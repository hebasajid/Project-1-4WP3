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


//NOW DEFINING ROUTES TO RENDER A DIFF MUSTACHE FILE FOR EACH ROUTE: 

//getting list of books from the database and rendering the index page with the list of books (users bookshelf)
//READ action
app.get('/', (req, res) => {
    db.all("SELECT * FROM Books", (err, rows) => {
        res.render('index', 
            { title: "My Bookshelf",
              books: rows });
    });
});

// adding a book nav link -  form 
//User creates a new entry here:
app.get('/add', (req, res) => {
    res.render('addBook', { title: "Add a New Book" });
});

// managing a book nav link  
//User edits a book entry here -> update or delete book entry
app.get('/manage', (req, res) => {
    res.render('manageBook', { title: "Manage Library", books: rows });
});


app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
