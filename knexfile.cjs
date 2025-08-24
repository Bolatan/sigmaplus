module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './server/migrations'
    },
    seeds: {
      directory: './server/seeds'
    }
  }
};
