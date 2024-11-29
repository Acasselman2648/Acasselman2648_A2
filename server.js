require('pg'); // explicitly require the "pg" module
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('PGDATABASE', 'PGUSER', 'PGPASSWORD', {
  host: 'PGHOST',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });