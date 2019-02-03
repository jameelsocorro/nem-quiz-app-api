require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const users = require('./controllers/users')

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(db.users);
})

//USERS
app.post('/users/signin', (req, res) => { users.signIn(req, res, db, bcrypt) });
app.post('/users/register', (req, res) => { users.register(req, res, db, bcrypt) });

app.listen(process.env.PORT, () => {
    console.log(`app is running on port ${process.env.PORT}`);
})
