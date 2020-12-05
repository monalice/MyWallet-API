require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uuid = require('uuid');
const bcrypt = require ('bcrypt');
const { Pool } = require('pg');

const { validateSignUp, validateSignIn } = require('./controller/usersController');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/sign-in', validateSignIn, async (req, res) => {
    const { id, name } = req.body;
    try {
        const token = uuid.v4();
        const dbConfig = {
            cennectionString: process.env.DATABASE_URL
        }
        const pool = new Pool(dbConfig);
        await pool.query('INSERT INTO session (id, token) VALUES ($1, $2)', [id, token]);

        res.status(200).send(token, name);
    } catch {
        res.sendStatus(500);
    }
});

app.post('/sign-up', validateSignUp, async (req, res) => {
    const { name, email, password } = req.body;
    const dbConfig = {
        cennectionString: process.env.DATABASE_URL
    }
    const pool = new Pool(dbConfig);
    const hash = bcrypt.hashSync(password, 12);

    try{
        await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hash]);

        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    }

})

app.listen(process.env.PORT);