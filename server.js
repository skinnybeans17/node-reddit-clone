require('dotenv').config();

const express = require('express');

const app = express();

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./data/reddit-db');

app.get('/', (req, res) => {
    res.render('home');
});

require('./controllers/posts')(app);


app.listen(3000);

module.exports = app;