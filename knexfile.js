// Update with your config settings.
module.exports = {
  development: {
    client: "pg",
    connection: "postgres://localhost/swatchr",
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds"
    },
    useNullAsDefault: true
  },
  test: {
    client: "pg",
    connection: "postgres://localhost/swatchr_test",
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds/test"
    },
    useNullAsDefault: true
  },
  production: {
    client: "pg",
    connection: "http://swatchr-be.herokuapp.com",
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds"
    },
    useNullAsDefault: true
  },
  pool: {
    min: 0,
    max: 10
  },
  acquireConnectionTimeout: 10000
};
