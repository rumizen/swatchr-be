const projects = [
  {
    name: "Sample 1",
    palettes: [
      {
        name: "Palette 1",
        color1: "#B06454",
        color2: "#B7AE23",
        color3: "#39B723",
        color4: "#23B7B7",
        color5: "#232EB7"
      },
      {
        name: "Palette 2",
        color1: "#B06453",
        color2: "#B7AE26",
        color3: "#39B728",
        color4: "#23B7B5",
        color5: "#232EB1"
      }
    ]
  },
  {
    name: "Sample 2",
    palettes: [
      {
        name: "Palette 1",
        color1: "#B06454",
        color2: "#B7AE23",
        color3: "#39B723",
        color4: "#23B7B7",
        color5: "#232EB7"
      },
      {
        name: "Palette 2",
        color1: "#B06453",
        color2: "#B7AE26",
        color3: "#39B728",
        color4: "#23B7B5",
        color5: "#232EB1"
      }
    ]
  },
  {
    name: "Sample 3",
    palettes: [
      {
        name: "Palette 1",
        color1: "#B06454",
        color2: "#B7AE23",
        color3: "#39B723",
        color4: "#23B7B7",
        color5: "#232EB7"
      },
      {
        name: "Palette 2",
        color1: "#B06453",
        color2: "#B7AE26",
        color3: "#39B728",
        color4: "#23B7B5",
        color5: "#232EB1"
      }
    ]
  }
];

const createProject = (knex, project) => {
  return knex("projects")
    .insert(
      {
        name: project.name
      },
      "id"
    )
    .then(projectId => {
      let palettePromises = [];

      project.palettes.forEach(palette => {
        palettePromises.push(
          createPalette(knex, {
            ...palette, 
            project_id: projectId[0]
          })
        );
      });

      return Promise.all(palettePromises);
    });
};

const createPalette = (knex, palette) => {
  return knex("palettes").insert(palette);
};

exports.seed = knex => {
  return knex("palettes")
    .del() // delete palettes first
    .then(() => knex("projects").del()) // delete all projects
    .then(() => {
      let projectPromises = [];

      projects.forEach(project => {
        projectPromises.push(createProject(knex, project));
      });

      return Promise.all(projectPromises);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
