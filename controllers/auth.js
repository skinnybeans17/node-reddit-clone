const chai = require('chai');
const jwt = require('jsonwebtoken');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

module.exports = (app) => {
    const User = require('../models/user');

    app.get('/sign-up', (req, res) => {
        return res.render('sign-up')
    })
    // SIGN UP POST
    app.post('/sign-up', (req, res) => {
        // Create User and JWT
        const user = new User(req.body);

        user.save().then((user) => {
            const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '60 days' });
            return res.redirect('/');
        }).catch((err) => {
            console.log(err.message);
            return res.status(400).send({ err });
        });
    });

    app.get('/login', (req, res) => {
        return res.render('login')
    })
    // LOGIN
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        // Find this user name
        User.findOne({ username }, 'username password')
        .then((user) => {
            if (!user) {
            // User not found
            return res.status(401).send({ message: 'Wrong Username or Password' });
            }
            // Check the password
            user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
                // Password does not match
                return res.status(401).send({ message: 'Wrong Username or password' });
            }
            // Create a token
            const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
                expiresIn: '60 days',
            });
            // Set a cookie and redirect to root
            res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
            return res.redirect('/');
            });
        })
        .catch((err) => {
            console.log(err);
        });
    })
};
