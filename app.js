const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
app.use(express.json());
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);
app.locals.title = "Testing Swatchr";
app.set("port", process.env.PORT || 3000);

app.get("/", (request, response) => {
  response.send("Swatchr");
});

app.get("/api/v1/projects", async (request, response) => {
  try {
    if (request.query.name) {
      const project = await database("projects")
        .select()
        .where("name", request.query.name);
      response.status(200).json(project);
    }
    const projects = await database("projects").select();
    response.status(200).json(projects);
  } catch (error) {
  }
});

app.get("/api/v1/projects/:id/palettes", async (request, response) => {
  try {
    const id = request.params.id;
    const validProject = await database("projects").where("id", id);
    if (validProject.length) {
      const palettes = await database("palettes")
        .where("project_id", id)
        .select();
      response.status(200).json(palettes);
    } else {
      response.status(404).json(`A project with an id of ${id} doesn't exist`);
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.get("/api/v1/projects/:id", async (request, response) => {
  try {
    const project = await database("projects")
      .select()
      .where("id", request.params.id);
    if (project.length) {
      const palettes = await database("palettes")
        .select()
        .where("project_id", request.params.id);
      const newProject = { ...project[0], palettes };
      response.status(200).json(newProject);
    } else {
      response.status(404).json({
        error: `Could not find a project with id of ${request.params.id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.get("/api/v1/palettes/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const palette = await database("palettes")
      .select()
      .where("id", id);
    if (palette) {
      response.status(200).json(palette);
    } else {
      response.status(404).json({
        error: `Could not find a palette with id of ${id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.post("/api/v1/projects", async (request, response) => {
  const newProject = request.body.project;
  try {
    if (newProject) {
      const id = await database("projects").insert(newProject, "id");
      response.status(201).json({ id });
    } else {
      response.status(400).json({
        error:
          "Expected an object with a key of project in the body of the post request"
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.post("/api/v1/projects/:id/palettes", async (request, response) => {
  let newPalette = request.body.palette;
  try {
    for(let requiredParameter of ['name', 'project_id', 'color1', 'color2', 'color3', 'color4', 'color5']) {
      if(!newPalette[requiredParameter]) {
        return response.status(422).json({
          error: `Expected format: { name: <String>, project_id : <Integer>, color1 : <Sring>, color2 : <Sring>, color3 : <Sring>, color4 : <Sring>, color5: <String> }. You're missing a ${requiredParameter} property.`
        })
      }
    }
      const newPaletteId = await database.insert(newPalette).returning('*').into('palettes')
      response.status(201).json(newPaletteId); 
  } catch (error) {
    response.status(500).json({ error })
  }
});

app.delete("/api/v1/projects/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const project = await database("projects")
      .select()
      .where("id", id);
    if (project.length) {
      await database("projects")
        .select()
        .where("id", id)
        .del();
      response.status(200).json({ id });
    } else {
      response.status(404).json({
        error: `Could not find a project with id of ${id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.delete("/api/v1/palettes/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const palette = await database("palettes")
      .where("id", id).select()
      if (palette.length) {
        await database("palettes")
          .select()
          .where("id", id)
          .del();
          response.sendStatus(204);
      } else {
        response.status(404).json({
          error: `Could not find a palette with id of ${id}`
        });
      }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.patch("/api/v1/palettes/:id", async (request, response) => {
  const id = request.params.id;
  const name = request.body.name;
  try {
    const palette = await database("palettes")
      .select()
      .where("id", id);
    if (palette.length) {
      await database("palettes")
        .select()
        .where("id", id)
        .update({ name });
      response.status(200).json({ id, name });
    } else {
      response.status(404).json({
        error: `Could not find a palette with id of ${id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.patch("/api/v1/projects/:id", async (request, response) => {
  const id = request.params.id;
  const name = request.body.name;
  try {
    const project = await database("projects")
      .select()
      .where("id", id);
    if (project.length) {
      await database("projects")
        .select()
        .where("id", id)
        .update({ name });
      response.status(200).json({ id, name });
    } else {
      response.status(404).json({
        error: `Could not find a palette with id of ${id}`
      });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
});

module.exports = app;
