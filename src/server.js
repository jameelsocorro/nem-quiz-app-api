require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const users = require('./controllers/users');
const quiz = require('./controllers/quiz');
const userQuiz = require('./controllers/user-quiz')

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

//QUIZ
app.get('/quiz/getQuizzes', (req, res) => { quiz.getQuizzes(req, res, db) });
app.get('/quiz/getQuizSummaries', (req, res) => { quiz.getQuizSummaries(req, res, db) });
app.get('/quiz/getQuizSummary/:userid/:quizid', (req, res) => { quiz.getQuizSummary(req, res, db) });
app.post('/quiz/generateQuizSummary', (req, res) => { quiz.generateQuizSummary(req, res, db) });

//USER QUIZ
app.post('/userQuiz/hasUserQuiz', (req, res) => { userQuiz.hasUserQuiz(req, res, db) });
app.post('/userQuiz/generateUserQuizzes', (req, res) => { userQuiz.generateUserQuizzes(req, res, db) });
app.get('/userQuiz/getUserQuizzes/:userid/:quizid/:summary', (req, res) => { userQuiz.getUserQuizzes(req, res, db) });
app.get('/userQuiz/getCurrentUserQuiz/:userid/:quizid', (req, res) => { userQuiz.getCurrentUserQuiz(req, res, db) });
app.get('/userQuiz/getUserQuizItems/:userquizid', (req, res) => { userQuiz.getUserQuizItems(req, res, db) });
app.post('/userQuiz/updateUserQuizAnswer', (req, res) => { userQuiz.updateUserQuizAnswer(req, res, db) });

app.listen(process.env.PORT, () => {
    console.log(`app is running on port ${process.env.PORT}`);
})
