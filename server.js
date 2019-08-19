const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);

app.set("port", process.env.PORT || 3000);

app.get("/", (request, response) => {
  response.send("Swatchr");
});

app.get("/api/v1/projects", async (request, response) => {
  try {
    const projects = await database("projects").select();
    response.status(200).json(projects);
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.get("/api/v1/projects/:id", async (request, response) => {
  try {
    const project = await database("projects")
      .select()
      .where("id", request.params.id);
    if (project) {
      const palettes = await database("palettes")
        .select()
        .where("project_id", request.params.id);
      const newProject = { ...project[0], palettes };
      response.status(200).json(newProject);
    } else {
      response
        .status(404)
        .json({
          error: `Could not find a project with id of ${request.params.id}`
        });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.listen(app.get("port"), () => {
  console.log(`Swatchr is running on http://localhost:${app.get("port")}.`);
});
