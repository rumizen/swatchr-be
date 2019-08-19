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
})

app.listen(app.get("port"), () => {
  console.log(
    `Swatchr is running on http://localhost:${app.get("port")}.`
  );
});


