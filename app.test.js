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
      })
      it("should return all projects in database", async () => {
        const expectedProjects = await database("projects").select();
        const cleanedExpectedProjects = expectedProjects.map(proj => {
          return { name: proj.name, id: proj.id };
        })

        const res = await request(app).get("/api/v1/projects");
        const projects = res.body;
        const cleanedProjects = projects.map(proj => {
          return { name: proj.name, id: proj.id };
        })

        expect(cleanedProjects).toEqual(cleanedExpectedProjects);
      })
      it("should return a project with the query name", async () => {
        const expectedProjectName = "Sample 1"
        const res = await request(app).get("/api/v1/projects/?name=Sample 1");
        const projectName = res.body[0].name;

        expect(projectName).toEqual(expectedProjectName);
      })
    })

  })

  describe("GET /projects/:id/palettes", () => {

    describe("happy path", () => {

      it("should return a status code of 200", async () => {
        const res = await request(app).get("/api/v1/projects");
        const projectId = res.body[0].id
        const paletteRes = await request(app).get(`/api/v1/projects/${projectId}/palettes`);
        expect(paletteRes.status).toBe(200);
      });
      it("should return all palettes for the project", async () => {
        const projectRes = await request(app).get("/api/v1/projects");
        const projectId = projectRes.body[0].id;
        const expectedPalettes = await database("palettes").where("project_id", projectId);
        const cleanedExpectedPalettes = expectedPalettes.map(pal => {
          return { name: pal.name, id: pal.id };
        });

        const res = await request(app).get(`/api/v1/projects/${projectId}/palettes`);
        const palettes = res.body;
        const cleanedPalettes = palettes.map(pal => {
          return { name: pal.name, id: pal.id };
        })

        expect(cleanedPalettes).toEqual(cleanedExpectedPalettes);
      });
    });

    describe("sad paths", () => {
      it("should return a 404 status code if id doesn't exist", async () => {
        const invalidId = -1;
        const res = await request(app).get(`/api/v1/projects/${invalidId}/palettes`);
        expect(res.status).toBe(404);
      })
    })
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

})