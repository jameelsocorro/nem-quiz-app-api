
module.exports = {

    getQuizzes: (req, res, db) => {
        return db.select('*').from('quiz')
            .then(quizzes => {
                res.json(quizzes)
            }).catch(err => res.status(400).json('unable to get quizzes'))
    },

    getQuizSummaries: (req, res, db) => {
        db.select('*')
            .from('quizsummary')
            .join('users', 'quizsummary.userid', '=', 'users.userid')
            .then(quizSummaries => {
                if (quizSummaries && quizSummaries.length > 0) {
                    res.json(quizSummaries);
                }
                else {
                    res.json(null);
                }
            })
            .catch(err => res.status(400).json('unable to get data from quiz summary'))
    },

    getQuizSummary: (req, res, db) => {
        const { userid, quizid } = req.params;
        if (!userid || !quizid) {
            return res.status(400).json('userid and quizid is required');
        }
        db.select('*')
            .from('quizsummary')
            .where('userid', '=', userid, 'quizid', '=', quizid)
            .join('quiz', 'quizsummary.quizid', '=', 'quiz.quizid')
            .then(quizSummary => {
                if (quizSummary && quizSummary.length > 0) {
                    res.json(quizSummary[0]);
                }
                else {
                    res.json(null);
                }
            })
            .catch(err => res.status(400).json('unable to get data from quiz summary'))
    },

    generateQuizSummary: (req, res, db) => {
        const { userid, quizid } = req.body;

        return db.select('*').from('userquiz')
            .where('userid', '=', userid, 'quizid', '=', quizid)
            .then(userQuizzes => {

                const correctItems = userQuizzes.filter(m => m.correct);

                db.transaction(trx => {
                    trx.insert({
                        userid,
                        quizid,
                        score: correctItems.length
                    })
                    .into('quizsummary')
                    .then(() => {
                        res.json(true);
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
                })
                .catch(err => res.status(400).json('unable to generate quiz summary'));

            }).catch(err => res.status(400).json('unable to get user quizzes'))
    },

}
