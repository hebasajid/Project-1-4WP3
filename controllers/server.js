const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express'); //inlcuding mustache as the templating engine
const db = require('../models/model.js'); // setting up dependencies and importing the db

// registering the mustache engine w express
app.engine("mustache", mustacheExpress());

// sets mustache to be the view engine
app.set('view engine', 'mustache');

app.set('views', __dirname + '/views');

// having the middleware to handle form data 
app.use(express.urlencoded({ extended: false }));

//getting list of books from the database and rendering the index page with the list of books (users bookshelf)
//READ action
app.get('/', (req, res) => {
    db.all("SELECT * FROM Books", (err, rows) => {
        res.render('index', 
            { title: "My Bookshelf",
              books: rows });
    });
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
