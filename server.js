// IMPORT INSTALLED PACKAGES 
import 'dotenv/config';                 
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

// CALL DOTENV.CONFIG 
// dotenv.config()

// JWT 
const bearerToken = 'Bearer aaa.eyJzdWIiOiIxMjMifQ.bbb'

// JWT PARSING
const token = bearerToken.slice(7);
const [header, payload, signature] = token.split('.');

if(token) {
  console.log('TOKEN HAS A VALUE');
} else {
  console.log('Token has no value');
}

console.log(`Bearer Token: ${bearerToken}`);
console.log(`Token: ${token}`);
console.log(`Header: ${header}`);
console.log(`Payload: ${payload}`);
console.log(`Signature: ${signature}`);

// INITIALIZE EXPRESS APP 
const app = express()

// ADD MIDDLEWARE 
// enable CORS 
app.use(cors())
// enable JSON body parsing 
app.use(express.json())

// DATABASE CONFIG
const useSsl = process.env.DB_SSL === 'true';
const DB_SCHEMA = process.env.DB_SCHEMA || 'app';

// CREATE SEQUELIZE CONNECTION 
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
    define: {
        schema: DB_SCHEMA,
    },
  });

  // DEFINE SEQUELIZE MODEL NAMED PUPPIES
  // use sequelize.define('puppies', ...)
  const puppies = sequelize.define('puppies', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    name:  { type: DataTypes.TEXT(), allowNull: false },
    breed:   { type: DataTypes.TEXT(), allowNull: false },
    age:       { type: DataTypes.INTEGER(), allowNull: false },
    user_id:  { type: DataTypes.INTEGER(), allowNull: true },
  }, { schema: DB_SCHEMA, tableName: 'puppies', timestamps: false });
  
  // BASIC TEST ROUTE 
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// START UP AND AUTHENTICATE SERVER
const startServer = async () => {
    try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await puppies.sync({ alter: true });
    console.log(`Puppies model synced in schema "${DB_SCHEMA}".`);
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });
    } catch (err) {
    console.error('Error: ', err);
    process.exit(1); // Exit with failure code
    }
};

startServer();