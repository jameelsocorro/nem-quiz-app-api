
module.exports = {

    getQuizzes: (req, res, db) => {
        return db.select('*').from('quiz')
            .then(quizzes => {
                res.json(quizzes)
            }).catch(err => res.status(400).json('unable to get quizzes'))
    },
    getQuizItems: (req, res, db) => {
        return db.select('*').from('quizitem')
            .then(quizItems => {
                res.json(quizItems)
            }).catch(err => res.status(400).json('unable to get quiz item'))
    },
    getQuizItemById: (req, res, db) => {
        const { quizId } = req.body;
        return db.select('*').from('quizItem')
            .where('quizId', '=', quizId)
            .then(quizItem => {
                res.json(quizItem)
            }).catch(err => res.status(400).json('unable to get quiz item'))
    },
    getQuizItemOptions: (req, res, db) => {
        const { includeId } = req.body;
        return db.select('*').from('quizItemOption')
            .then(quizItemOptions => {
                if (includeId) {
                    res.json(quizItemOptions)
                } else {
                    res.json(quizItemOptions.map(item => {
                        return {
                            key: item.key,
                            description: item.description
                        }
                    }))
                }

            }).catch(err => res.status(400).json('unable to get quiz item option'))
    },
    getQuizItemOptionsByKey: (req, res, db) => {
        const { key } = req.body;
        return db.select('*').from('quizItemOption')
            .where('key', '=', itemOptionId)
            .then(quizItemOption => {
                res.json(quizItemOption)
            }).catch(err => res.status(400).json('unable to get quiz item option'))
    },
    getUserQuiz: (req, res, db) => {
        const { quizId, quizItemId } = req.body;
        return db.select('*').from('userQuiz')
            .where('quizItemId', '=', quizItemId && 'quizId', '=', quizId)
            .then(userQuiz => {
                res.json(userQuiz)
            }).catch(err => res.status(400).json('unable to get user quiz'))
    },
    getQuizSummary: (req, res, db) => {
        const { userId, quizId } = req.body;
        return db.select('*').from('quizSummary')
            .where('userId', '=', userId && 'quizId', '=', quizId)
            .then(quizSummary => {
                res.json(quizSummary)
            }).catch(err => res.status(400).json('unable to get quiz summary'))
    },

}
