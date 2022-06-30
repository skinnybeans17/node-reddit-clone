const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

module.exports = (app) => {
    app.get('/users/:username', (req, res) => {
        User.findOne({ username: req.params.username }).lean().then((this_user) => {
            Post.find({ author: this_user }).lean().then((posts) => {
                Comment.find({ author: this_user}).populate('comments').lean().then((comments) => {
                    res.render('users-show', { this_user, posts, comments });
                });
            });
        });
    });
};