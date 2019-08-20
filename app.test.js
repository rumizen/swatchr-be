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
      it("should return all projects in database", async () => {
        
      })
    })

    describe("sad path", () => {
      
    });
  })

})