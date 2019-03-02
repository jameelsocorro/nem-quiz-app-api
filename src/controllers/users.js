
module.exports = {

    signIn: (req, res, db, bcrypt) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json('incorrect form submission');
        }
        db.select('email', 'hash').from('login')
            .where('email', '=', email)
            .then(data => {
                const isValid = bcrypt.compareSync(password, data[0].hash);
                if (isValid) {
                    return db.select('*').from('users')
                        .where('email', '=', email)
                        .then(user => {
                            res.json(user[0])
                        })
                        .catch(err => res.status(400).json('unable to get user'))
                } else {
                    res.status(400).json('wrong credentials')
                }
            })
            .catch(err => res.status(400).json('wrong credentials'))
    },

    register: (req, res, db, bcrypt) => {
        const { firstname, lastname, password, email, nemAddress } = req.body;
        if (!firstname || !lastname || !email || !password || !nemAddress) {
            return res.status(400).json('incorrect form submission');
        }
        const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
                .into('login')
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0],
                            firstname: firstname,
                            lastname: lastname,
                            nemaddress: nemAddress,
                            joined: new Date()
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to register'));
    }

}
