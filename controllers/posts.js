const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

module.exports = (app) => {

    // INDEX
    // ASYNC AWAIT
    app.get('/', async (req, res) => {
        try {
            // const { user } = req;
            // console.log(req.cookies);
            const currentUser = await req.user;
            console.log(currentUser);
            const posts = await Post.find({}).lean().populate('author');
            return res.render('posts-index', { posts, currentUser });
        } catch (err) {
            console.log(err.message);
        };
    });

    // NEW POST
    app.get('/posts/new', (req, res) => {
        if (req.user) {
            const currentUser = req.user;
            res.render('posts-new', { currentUser });
        } else {
            console.log('unauthorized');
            res.render('error', { errorMessage:'You need to be logged in to see this page.' });
            return res.status(401); // UNAUTHORIZED
        };
    });

    // CREATE
    app.post('/posts/new', (req, res) => {
        if (req.user) {
            const userId = req.user._id;
            const post = new Post(req.body);
            post.author = userId;
			post.upVotes = [];
			post.downVotes = [];
			post.voteScore = 0;

            post.save().then(() => User.findById(userId)).then((user) => {
                user.posts.unshift(post);
                user.save();
                // REDIRECT TO THE NEW POST
                return res.redirect(`/posts/${post._id}`);
            }).catch((err) => {
                console.log(err.message);
            });
        } else {
            res.render('error', { errorMessage:'You need to be logged in to see this page.' })
            return res.status(401); // UNAUTHORIZED
        };
    });

    // SHOW SINGLE POST
    app.get('/posts/:id', (req, res) => {
        // LOOK UP THE POST
        const currentUser = req.user;
        Post.findById(req.params.id).populate('comments').lean()
        .then((post) => {
            let createdAt = post.createdAt;
            res.render('posts-show', { post, currentUser })
        })
        .catch((err) => {
            console.log(err.message);
        });
    });

	// SUBREDDIT
	app.get('/n/:subreddit', (req, res) => {
		const { user } = req;
		Post.find({ subreddit: req.params.subreddit }).lean()
		.then((posts) => res.render('posts-index', { posts, user }))
		.catch((err) => {
			console.log(err);
		});
	});

    // DELETE

    
	// UPVOTE
	app.put('/posts/:id/vote-up', (req, res) => {
		Post.findById(req.params.id).then(post => {
			post.upVotes.push(req.user._id);
			post.voteScore += 1;
			post.save();
			console.log('———————————————————')
			console.log(post.voteScore)
			console.log('———————————————————')
		
			return res.status(200);
		}).catch(err => {
		  	console.log(err);
		})
	});
	
	// DOWNVOTE
	app.put('/posts/:id/vote-down', (req, res) => {
		Post.findById(req.params.id).then(post => {
			post.downVotes.push(req.user._id);
			post.voteScore -= 1;
			post.save();
			console.log('———————————————————')
			console.log(post.voteScore)
			console.log('———————————————————')
		
			return res.status(200);
		}).catch(err => {
			console.log(err);
		});
	});

};