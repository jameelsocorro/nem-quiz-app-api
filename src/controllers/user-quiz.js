

const _randomizedItems = (items, totalItems) => {
    const randomizedItems = items.sort(() => 0.5 - Math.random());
    return randomizedItems.slice(0, totalItems)
}

module.exports = {

    generateUserQuizzes: (req, res, db) => {
        const { userid, quizid } = req.body;

        return db.select('*').from('quizitem')
            .where('quizid', '=', quizid)
            .then(quizitems => {
                const totalItems = quizitems.length > 10 ? 10 : quizitems.length;
                const randomQuizItems = _randomizedItems(quizitems, totalItems);

                if (randomQuizItems) {
                    const userQuizzesTemp = randomQuizItems.map((qi, index) => {
                        return {
                            userid,
                            quizid,
                            quizitemid: qi.quizitemid,
                            itemsequence: index + 1
                        };
                    });

                    db.transaction(trx => {
                        trx.insert(userQuizzesTemp)
                            .into('userquiz')
                            .returning(['userid', 'quizid', 'quizitemid', 'userquizid'])
                            .then(userQuizzes => {

                                return db.select('*').from('quizanswer')
                                    .then(quizanswers => {

                                        let totalUserItems = [];

                                        for (const userQuiz of userQuizzes) {
                                            const correctAnswer = quizanswers.find(qa => qa.quizitemid === userQuiz.quizitemid);
                                            const randomQuizAnswers = _randomizedItems(quizanswers.filter(m => m.quizanswerid !== correctAnswer.quizanswerid), 3);
                                            randomQuizAnswers.push(correctAnswer);

                                            const reShuffleAnswers = randomQuizAnswers.sort(() => 0.5 - Math.random());
                                            const userItems = reShuffleAnswers.map(rqa => {
                                                return {
                                                    userquizid: userQuiz.userquizid,
                                                    quizanswerid: rqa.quizanswerid
                                                }
                                            });

                                            totalUserItems = totalUserItems.concat(userItems);
                                        }

                                        return trx.insert(totalUserItems)
                                            .into('userquizitem')
                                            .then(() => {
                                                res.json(true);
                                            })
                                            .catch(err => res.status(400).json('unable to save user quiz items'))
                                    })
                                    .catch(err => res.status(400).json('unable to get quiz answers'))

                            })
                            .then(trx.commit)
                            .catch(trx.rollback)
                    })
                        .catch(err => res.status(400).json('unable to save user quizzes'));
                }

            }).catch(err => res.status(400).json('unable to get quiz'))
    },

    hasUserQuiz: (req, res, db) => {
        const { userid, quizid } = req.body;
        if (!userid || !quizid) {
            return res.status(400).json('userid and quizid is required');
        }
        db.select('*')
            .from('userquiz')
            .where('userid', '=', userid, 'quizid', '=', quizid)
            .then(userquizzes => {
                res.json(userquizzes.length > 1);
            })
            .catch(err => res.status(400).json('unable to get data from user quiz'))
    },

    getUserQuizzes: (req, res, db) => {
        const { userid, quizid, summary } = req.params;
        if (!userid || !quizid) {
            return res.status(400).json('userid and quizid is required');
        }
        db.select('*')
            .from('userquiz')
            .where('userid', '=', userid, 'quizid', '=', quizid)
            .join('quizitem', 'userquiz.quizitemid', '=', 'quizitem.quizitemid')
            .then(userQuizzes => {

                if (!summary) {
                    res.json(userQuizzes);
                } else {

                    Promise.all(userQuizzes.map(function (userQuiz) {
                        const quizanswerid = userQuiz.useranswer;
                        return db.select('*')
                            .from('quizanswer')
                            .where({ quizanswerid })
                            .orWhere({ quizitemid: userQuiz.quizitemid })
                            .then(quizAnswers => {
                                userQuiz.answers = quizAnswers;
                                return userQuiz
                            });
                    })).then(response => {
                        res.json(response.sort((a, b) => a.itemsequence - b.itemsequence));
                    });
                }
            })
            .catch(err => res.status(400).json('unable to get data from user quiz'));
    },

    getCurrentUserQuiz: (req, res, db) => {
        const { userid, quizid } = req.params;
        if (!userid || !quizid) {
            return res.status(400).json('userid and quizid is required');
        }
        db.select('*')
            .from('userquiz')
            .where('userid', '=', userid, 'quizid', '=', quizid)
            .join('quizitem', 'userquiz.quizitemid', '=', 'quizitem.quizitemid')
            .then(userQuizzes => {
                const userQuizzesLeft = userQuizzes.sort((a, b) => a.itemsequence - b.itemsequence)
                    .filter(q => q.useranswer === null);

                if (userQuizzesLeft) {
                    res.json(userQuizzesLeft[0]);
                }
                else {
                    res.json(null);
                }
            })
            .catch(err => res.status(400).json('unable to get data from user quiz'));
    },

    getUserQuizItems: (req, res, db) => {
        const { userquizid } = req.params;
        if (!userquizid) {
            return res.status(400).json('userquizid is required');
        }
        db.select('*')
            .from('userquizitem')
            .where('userquizid', '=', userquizid)
            .join('quizanswer', 'userquizitem.quizanswerid', '=', 'quizanswer.quizanswerid')
            .then(userQuizItems => {

                if (userQuizItems && userQuizItems.length > 0) {
                    res.json(userQuizItems.map(uqi => {
                        return {
                            answer: uqi.answer,
                            quizanswerid: uqi.quizanswerid
                        }
                    }));
                }
                else {
                    res.json(null);
                }

            })
            .catch(err => res.status(400).json('unable to get data from user quiz items'));
    },

    updateUserQuizAnswer: (req, res, db) => {
        const { userquizid, quizitemid, useranswer } = req.body;
        if (!userquizid) {
            return res.status(400).json('userquizid is required');
        }

        const quizanswerid = parseInt(useranswer);

        db.select('*')
            .from('quizanswer')
            .where('quizanswerid', '=', quizanswerid)
            .then(quizAnswers => {

                //TODO multi answers support
                const quizAnswer = (quizAnswers && quizAnswers.length > 0) ? quizAnswers[0] : quizAnswers;

                db.transaction(trx => {
                    trx.update({
                        useranswer,
                        correct: quizAnswer.quizitemid === quizitemid
                    })
                        .into('userquiz')
                        .where('userquizid', '=', userquizid)
                        .then(() => {
                            res.json(true);
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                })
                    .catch(err => res.status(400).json('unable to save user answer'))

            })
            .catch(err => res.status(400).json('unable to get data from quiz answer'));
    }
}
