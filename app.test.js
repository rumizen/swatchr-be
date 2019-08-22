const request = require("supertest");
const app = require("./app");
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

describe("API", () => {
  beforeEach(async () => {
    await database.seed.run();
  });

  describe("GET /projects", () => {
    describe("happy path", () => {
      it("should return a status code of 200", async () => {
        const res = await request(app).get("/api/v1/projects");
        expect(res.status).toBe(200);
      });
      it("should return all projects in database", async () => {
        const expectedProjects = await database("projects").select();
        const cleanedExpectedProjects = expectedProjects.map(proj => {
          return { name: proj.name, id: proj.id };
        });

        const res = await request(app).get("/api/v1/projects");
        const projects = res.body;
        const cleanedProjects = projects.map(proj => {
          return { name: proj.name, id: proj.id };
        });

        expect(cleanedProjects).toEqual(cleanedExpectedProjects);
      });
      it("should return a project with the query name", async () => {
        const expectedProjectName = "Sample 1";
        const res = await request(app).get("/api/v1/projects/?name=Sample 1");
        const projectName = res.body[0].name;

        expect(projectName).toEqual(expectedProjectName);
      });
    });
  });

  describe("GET /projects/:id", () => {
    describe("happy path", () => {
      it("should return a status code of 200", async () => {
        const res = await request(app).get("/api/v1/projects/2");
        expect(res.status).toBe(200);
      });

      it("should return a specific project", async () => {
        const projectRes = await request(app).get("/api/v1/projects");
        const projectId = projectRes.body[0].id;
        const expectedProjectArray = await database("projects").where(
          "id",
          projectId
        );
        const expectedProject = expectedProjectArray[0];
        const projPalettes = await database("palettes").where(
          "project_id",
          projectId
        );
        const cleanedExpectedProjPalettes = projPalettes.map(pal => {
          return {
            id: pal.id,
            name: pal.name,
            project_id: pal.project_id,
            color1: pal.color1,
            color2: pal.color2,
            color3: pal.color3,
            color4: pal.color4,
            color5: pal.color5,
          }
        })
        expectedProject.palettes = cleanedExpectedProjPalettes;
        const res = await request(app).get(`/api/v1/projects/${projectId}`);
        const project = res.body;
        const cleanProjPalettes = project.palettes.map(pal => {
          return {
            id: pal.id,
            name: pal.name,
            project_id: pal.project_id,
            color1: pal.color1,
            color2: pal.color2,
            color3: pal.color3,
            color4: pal.color4,
            color5: pal.color5,
          }
        })
        project.palettes = cleanProjPalettes;

        expect(project.id).toEqual(expectedProject.id);
        expect(project.name).toEqual(expectedProject.name);
        expect(project.palettes).toEqual(expectedProject.palettes);
      });
    });

    describe("sad path", () => {
      it.skip('should return a 404 status and the message: "Could not find a project with id of 1" ', async () => {
        const invalidId = -1;
        const response = await request(app).get(`/api/v1/projects/${invalidId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toEqual('Could not find a project with id of -1');
      })
    });
  });

  describe("GET /projects/:id/palettes", () => {
    describe("happy path", () => {
      it("should return a status code of 200", async () => {
        const res = await request(app).get("/api/v1/projects");
        const projectId = res.body[0].id;
        const paletteRes = await request(app).get(
          `/api/v1/projects/${projectId}/palettes`
        );
        expect(paletteRes.status).toBe(200);
      });
      it("should return all palettes for the project", async () => {
        const projectRes = await request(app).get("/api/v1/projects");
        const projectId = projectRes.body[0].id;
        const expectedPalettes = await database("palettes").where(
          "project_id",
          projectId
        );
        const cleanedExpectedPalettes = expectedPalettes.map(pal => {
          return { name: pal.name, id: pal.id };
        });

        const res = await request(app).get(
          `/api/v1/projects/${projectId}/palettes`
        );
        const palettes = res.body;
        const cleanedPalettes = palettes.map(pal => {
          return { name: pal.name, id: pal.id };
        });

        expect(cleanedPalettes).toEqual(cleanedExpectedPalettes);
      });
    });

    describe("sad paths", () => {
      it("should return a 404 status code if id doesn't exist", async () => {
        const invalidId = -1;
        const res = await request(app).get(
          `/api/v1/projects/${invalidId}/palettes`
        );
        expect(res.status).toBe(404);
      });
    });
  });

  describe("GET /palettes/:id", () => {
    describe("happy path", () => {
      it("should return a status code of 200", async () => {
        const response = await request(app).get("/api/v1/palettes/14");
        expect(response.status).toBe(200);
      });
      it("should return a palette matching the id", async () => {
        const expectedPalette = await database("palettes").where("id", 14);

        const res = await request(app).get("/api/v1/palettes/14");
        const palette = res.body;

        expect(palette).toEqual(expectedPalette);
      });
    });

    describe("sad paths", () => {
      it("should return a 404 status code if id doesn't exist", async () => {
        const invalidId = -1;
        const res = await request(app).get(
          `/api/v1/projects/${invalidId}/palettes`
        );
        expect(res.status).toBe(404);
      });
    });
  });

  describe("POST /projects", () => {
    describe("happy path", () => {
      it("should return a status of 201 on success", async () => {
        const newProject = {
          project: { name: "Test Post" }
        };
        const res = await request(app)
          .post("/api/v1/projects")
          .send(newProject);
        expect(res.status).toBe(201);
      });

      it("should post a new student to the db", async () => {
        const newProject = {
          project: { name: "Test Post" }
        };
        const res = await request(app)
          .post("/api/v1/projects")
          .send(newProject);
        const projects = await database("projects")
          .where("id", parseInt(res.body.id))
          .select();
        const project = projects[0];

        expect(project.name).toEqual(newProject.project.name);
      });
    });
    describe("sad paths", () => {
      it("should send a 400 status back if request body is wrong", async () => {
        const invalidProject = {
          name: "Test Fail Name"
        };
        const res = await request(app)
          .post("/api/v1/projects")
          .send(invalidProject);
        expect(res.status).toBe(400);
      });
    });
  });

  describe("POST /projects/:id/palettes", () => {
    describe("happy path", () => {
      it("should return a status of 201 on success", async () => {
        const projectRes = await request(app).get("/api/v1/projects");
        const projectId = projectRes.body[0].id;
        const newPalette = {
            name: "Test Palette", 
            color1: "red",
            color2: "blue",
            color3: "orange",
            color4: "green",
            color5: "yellow",
            project_id: projectId
        };
        const res = await request(app)
          .post(`/api/v1/projects/${projectId}/palettes`)
          .send(newPalette);
        expect(res.status).toBe(201);
      });

      it("should post a new palette to the database", async () => {
        const projectRes = await request(app).get("/api/v1/projects");
        const projectId = projectRes.body[0].id;
        const newPalette = {
          name: "Palette 10000",
          color1: "#B06454",
          color2: "#B7AE23",
          color3: "#39B723",
          color4: "#23B7B7",
          color5: "#232EB7",
          project_id: projectId
        };
        const res = await request(app)
          .post(`/api/v1/projects/${projectId}/palettes`)
          .send(newPalette);
        const paletteArray = await database('palettes').where('project_id', projectId).select()
        const foundPalette = paletteArray.find(pal => pal.name === newPalette.name)

        expect(foundPalette.name).toEqual(newPalette.name)
      })
    })
  })

  describe("PATCH /projects/:id", () => {
    describe("happy path", () => {
      it("should return a 200 status on success", async () => {
        const newName = { name: "Different Name" };
        const res = await request(app).get("/api/v1/projects");
        const projectId = res.body[0].id;

        const projectRes = await request(app)
          .patch(`/api/v1/projects/${projectId}`)
          .send(newName);

        expect(projectRes.status).toBe(200);
      });

      it("should change the project name and return the new name", async () => {
        const newName = { name: "Different Name" };
        const res = await request(app).get("/api/v1/projects");
        const projectId = res.body[0].id;
        const project = await database("projects").where("id", projectId);

        const projectRes = await request(app)
          .patch(`/api/v1/projects/${projectId}`)
          .send(newName);

        expect(project.name).not.toEqual(projectRes.body.name);
        expect(projectRes.body.name).toEqual(newName.name);
      });
    });

    describe("sad paths", () => {
      it("should return a 500 status on failure", async () => {
        const newName = { wrong: "Different Name" };
        const res = await request(app).get("/api/v1/projects");
        const projectId = res.body[0].id;

        const projectRes = await request(app)
          .patch(`/api/v1/projects/${projectId}`)
          .send(newName);

        expect(projectRes.status).toBe(500);
      });

      it("should return a 404 status if sent an invalid id", async () => {
        const newName = { name: "Different Name" };
        const invalidId = -1;

        const projectRes = await request(app)
          .patch(`/api/v1/projects/${invalidId}`)
          .send(newName);

        expect(projectRes.status).toBe(404);
      });
    });
  });

  describe("DELETE /projects/:id", () => {
    describe("happy paths", () => {
      it("should return a 200 status on success", async () => {
        const projects = await request(app).get("/api/v1/projects");
        const projectId = projects.body[0].id;
        const deleteRes = await request(app).delete(
          `/api/v1/projects/${projectId}`
        );
        expect(deleteRes.status).toBe(200);
      });
      it("should return an id of deleted project on success", async () => {
        const projects = await request(app).get("/api/v1/projects");
        const projectId = projects.body[0].id;
        const deleteRes = await request(app).delete(
          `/api/v1/projects/${projectId}`
        );
        expect(parseInt(deleteRes.body.id)).toBe(projectId);
      });
      it("should return a 404 status when attempting to fetch palettes for deleted project", async () => {
        const projects = await request(app).get("/api/v1/projects");
        const projectId = projects.body[0].id;
        const deleteRes = await request(app).delete(
          `/api/v1/projects/${projectId}`
        );
        const palettesRes = await request(app).get(
          `/api/v1/projects/${projectId}/palettes`
        );

        expect(palettesRes.status).toBe(404);
      });
    });

    describe("sad paths", () => {
      it("should return a 404 status if id is invalid", async () => {
        const invalidId = -1;
        const res = await request(app).delete(`/api/v1/projects/${invalidId}`);
        expect(res.status).toBe(404);
      });
    });
  });
});
