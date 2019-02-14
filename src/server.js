require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const users = require('./controllers/users')

let db = null;

switch (process.env.NODE_ENV) {
    case 'staging':
        db = knex({
            client: 'pg',
            connection: {
                connectionString: process.env.DATABASE_URL,
                ssl: true
            }
        });
        break;
    default:
        db = knex({
            client: 'pg',
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }
        });
        break;
}

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
