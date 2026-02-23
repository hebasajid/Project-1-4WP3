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

    const selectedGenre = req.query.genre;
    const selectedRead = req.query.is_read; //1 = read, 0 = unread, undefined = no filter on read status
    const sort = req.query.sort; //sorting parameter by rating
    let sql = "SELECT * FROM Books";
    let params = [];

    if (selectedGenre) {
        sql = "SELECT * FROM Books WHERE genre = ?";
        params.push(selectedGenre);
    }
 //sorting by rating if the sort query parameter is set to 'rating'
    if (sort === 'rating') {
        sql += " ORDER BY rating DESC";
    }

   if (selectedRead !== undefined) {
        sql += (params.length > 0) ? " AND is_read = ?" : " WHERE is_read = ?";
        params.push(parseInt(selectedRead)); // converting string "1" or "0" to  number
    }

   db.all(sql, params, (err, rows) => { 
        if (err) {
            console.error(err);
            return res.status(500).send("Database Error");
        }
        res.render('index', { 
            title: "My Bookshelf",
            books: rows,
            genre: selectedGenre,
            is_read: selectedRead
        });
    });
});

// adding a book nav link -  form 
//User creates a new entry here:
app.get('/add', (req, res) => {
    res.render('index', { title: "Add a New Book" });
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

//rendering the edit page for a specific book when the user clicks the edit button - showing the form pre-populated with the current book data
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM Books WHERE id = ?", [id], (err, row) => {
        res.render('editBook', { book: row });
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

//post route to delete all books from the database - DELETE action:

app.post('/delete-all', (req, res) => {
    db.run("DELETE FROM Books", (err) => {
        if (err) {
            res.status(500).send("Error clearing the database");
        } else {
            res.redirect('/');
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

//processing the form submission from the edit page to update the book details in the database
app.post('/update-book/:id', (req, res) => {
    const id = req.params.id;
    const { genre, rating } = req.body;

    //backend validation:
    if (parseFloat(rating) < 0 || parseFloat(rating) > 10) {
        return res.status(400).send("Rating must be between 0 and 10.");
    }

    db.run("UPDATE Books SET genre = ?, rating = ? WHERE id = ?", [genre, rating, id], (err) => {
        if (err) { res.status(500).send("Update failed"); }
        else { res.redirect('/manage'); }
    });
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
