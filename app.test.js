const request = require("supertest");
const app = require("./app");
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

describe("API", () => {

  describe("GET /projects", () => {

    describe("happy path", () => {
      it("should return a status code of 200", async () => {
        const res = await request(app).get("/api/v1/projects");
        expect(res.status).toBe(200);
      })
      it.skip("should return all projects in database", async () => {
        const expectedProjects = await database("projects").select();

        const res = await request(app).get("/api/v1/projects");
        const projects = res.body;

        expect(projects).toEqual(expectedProjects);
      })
      it("should return a project with the query name", async () => {
        const expectedProjectName = "Sample 1"
        const res = await request(app).get("/api/v1/projects/?name=Sample 1");
        const projectName = res.body[0].name;

        expect(projectName).toEqual(expectedProjectName);
      })
    })

    describe("sad path", () => {
      
    });
  })

})