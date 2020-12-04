const joi = require ('joi');
const bcrypt = require ('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const stripHtml = require('string-strip-html');

async function validateSignIn (req, res, next) {
    const { email, password } = req.body;

    try {
        const dbConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
        }
        const pool = new Pool(dbConfig);

        const emailCheck = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

        if(result.rows.length === 0) {
            return res.status(401).send('Invalid Email or Password');
        }
        
        if(bcrypt.compareSync(password, result.rows[0].password)){
            req.body.id = result.rows[0].id;
            req.body.name = result.rows[0].name;
            next();
        } else {
            return res.status(401).send('Invalid Email or Password');
        }
    } catch {
        return res.sendStatus(500);
    }
}

async function validateSignUp (req, res, next) {
    const { email } = req.body;

    const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(/^(?=.*[!@#$%&*+])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[!@#$%&*+a-zA-Z0-9]{6,10}$/).required(),
        confirmPassword: joi.ref('password')
    });

    const validation = schema.validade(req.body);
    if(validation.error){
        return res.sendStatus(422);
    }

    const dbConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
    }
    const pool = new Pool(dbConfig);

    const emailCheck = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

    if(result.rows.length !== 0) {
        return res.status(409).send('this email already exists');
    } else {
        next();
    }

}

module.exports = { validateSignIn, validateSignUp }