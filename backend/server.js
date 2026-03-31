// IMPORT INSTALLED PACKAGES 
import 'dotenv/config';                 
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import * as jose from 'jose';

// CALL DOTENV.CONFIG 
// // dotenv.config()

// // JWT 
// const bearerToken = 'Bearer aaa.eyJzdWIiOiIxMjMifQ.bbb'

// // JWT PARSING
// const token = bearerToken.slice(7);
// const [header, payload, signature] = token.split('.');

// if(token) {
//   console.log('TOKEN HAS A VALUE');
// } else {
//   console.log('Token has no value');
// }

// console.log(`Bearer Token: ${bearerToken}`);
// console.log(`Token: ${token}`);
// console.log(`Header: ${header}`);
// console.log(`Payload: ${payload}`);
// console.log(`Signature: ${signature}`);

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
    port: process.env.DB_PORT || 5432,
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
    user_id:  { type: DataTypes.TEXT(), allowNull: false },
  }, { schema: DB_SCHEMA, tableName: 'puppies', timestamps: false });
  
  // ASGARDEO AUTH MIDDLEWARE 
  const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'sabtamorg';
  const JWKS_URI = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`; 

  async function authMiddleware(req, res, next) {
    const authHeader = (req.headers.authorization || '').trim();

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized', detail: 'Missing Bearer Token' });
    }

    const token = authHeader.slice(7).trim();

    try {
        const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));
        const { payload } = await jose.jwtVerify(token, JWKS);
        
        // This 'sub' is the unique ID for the logged-in user
        req.userId = payload.sub; 
        next();
    } catch (err) {
        console.error('JWT Error:', err.message);
        return res.status(401).json({ error: 'Invalid Token' });
    }
}

  // BASIC TEST ROUTE 
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // PART 1 - UPDATE BACKEND TO INCLUDE ROUTES (WITHOUT AUTH)
  // GET (all) 
  app.get('/api/puppies', async (req, res) => {
    try {
      const allPuppies = await puppies.findAll(); 
      res.json(allPuppies);
    } catch (err) {
      console.error('Error fetching puppies:', err);
      res.status(500).json({ error: 'Failed to fetch puppies' });
    }
  });

  // GET: Only fetch puppies where user_id matches the logged-in user
app.get('/api/puppies', authMiddleware, async (req, res) => {
    try {
        const myPuppies = await puppies.findAll({
            where: { user_id: req.userId } 
        });
        res.json(myPuppies);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

  // GET (by id)
  app.get('/api/puppies/:id', async (req, res) => {
    const { id } = req.params;  
    try {
      const puppy = await puppies.findByPk(id);
      if (!puppy) {
        return res.status(404).json({ error: 'Puppy not found' });
      }
      res.json(puppy);
    } catch (err) {
      console.error('Error fetching puppy:', err);
      res.status(500).json({ error: 'Failed to fetch puppy' });
    }
  });

  // POST 
  app.post('/api/puppies', authMiddleware, async (req, res) => {
    const { name, breed, age, user_id } = req.body; 
    try {
      const newPuppy = await puppies.create({ name, breed, age, user_id: req.userId});
      res.status(201).json(newPuppy);
    } catch (err) {
      console.error('Error creating puppy:', err);
      res.status(500).json({ error: 'Failed to create puppy' });
    } });

  // PUT (by id)
  app.put('/api/puppies/:id', async (req, res) => {
    const { id } = req.params; 
    const { name, breed, age, user_id } = req.body; 
    try { 
      const puppy = await puppies.findByPk(id);
      if (!puppy) {
        return res.status(404).json({ error: 'Puppy not found' });
      }
      puppy.name = name;
      puppy.breed = breed;
      puppy.age = age;
      puppy.user_id = user_id;
      await puppy.save();
      res.json(puppy);
    } catch (err) {
      console.error('Error updating puppy:', err);
      res.status(500).json({ error: 'Failed to update puppy' });
    } });

  // DELETE (by id)
  app.delete('/api/puppies/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await Puppy.destroy({
            where: { 
                id: req.params.id, 
                user_id: req.userId 
            }
        });
        
        if (!deleted) return res.status(404).json({ error: 'Puppy not found or unauthorized' });
        res.json({ message: 'Puppy deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
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