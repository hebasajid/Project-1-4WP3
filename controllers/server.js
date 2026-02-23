const express = require('express');
const path = require('path');
const app = express();
const mustacheExpress = require('mustache-express'); //inlcuding mustache as the templating engine
const db = require('../models/model.js'); // setting up dependencies and importing the db

// registering the mustache engine w express
app.engine("mustache", mustacheExpress());

// sets mustache to be the view engine
app.set('view engine', 'mustache');

app.set('views', path.join(__dirname, '..', 'views'));

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
    db.all("SELECT * FROM Books", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send("Database Error");
        } else {
            res.render('manageBook', { 
                title: "Manage Library", 
                books: rows 
            });
        }
    });
});


//using post route to add a book to the database - CREATE action - taking data from the form and inserting it into the database

app.post('/insert-book', (req, res) => {
    const { title, author, genre, rating, is_read, image_URL } = req.body;
    let errors = [];

    //adding validation to ensure all fields are filled out
    // backend validation: Check if required fields are empty
    if (!title || title.trim() === "") errors.push("Title cannot be empty.");
    if (!author || author.trim() === "") errors.push("Author cannot be empty.");

    //  backend validation: checking to ensure rating is between 0 and 10
    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) {
        errors.push("Rating must be a numeric value between 0.0 and 10.0.");
    }

    //after validation checking if there are errors, if so re-render the form with error messages
    if (errors.length > 0) {
        //rendering the add page again and passing the error messages to Mustache
        return res.render('addBook', { 
            title: "Add a New Book", 
            errorMessage: errors,
            prevData: req.body
        });
    }

    db.run("INSERT INTO Books (title, author, genre, rating, is_read, image_URL) VALUES (?, ?, ?, ?, ?, ?)", 
    [title, author, genre, rating, is_read, image_URL], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send("Error adding a book");
        } else {
            res.redirect('/');
        }
    });
});

//using post route to delete a book from the database - DELETE action:
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM Books WHERE id = ?", id, (err) => {
        if (err) {
            res.status(500).send("Delete failed");
        } else {
            res.redirect('/manage'); 
        }
    });
});

//using post route to update a book in the database - UPDATE action:
app.post('/toggle-status/:id', (req, res) => {
    const id = req.params.id;
    // using sql logic to flip 0 to 1 or 1 to 0
    db.run("UPDATE Books SET is_read = NOT is_read WHERE id = ?", id, (err) => {
        res.redirect('/manage');
    });
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
