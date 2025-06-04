module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 1337,
  app: {
    keys: process.env.APP_KEYS ? process.env.APP_KEYS.split(',') : ['key1', 'key2', 'key3', 'key4'],
  },
  webhooks: {
    populateRelations: process.env.WEBHOOKS_POPULATE_RELATIONS || false,
  },
  database: {
    client: 'postgres',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  },
};