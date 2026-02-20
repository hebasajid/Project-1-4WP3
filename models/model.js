var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("book.db");

db.serialize(function() {

  // create books table
db.run("DROP TABLE IF EXISTS Books");
db.run(`CREATE TABLE Books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    genre TEXT,
    rating REAL,
    is_read INTEGER,
    image_URL TEXT
  )`);

  // inserting records into the book table
  var insertStmt = "INSERT INTO Books (title, author, genre, rating, is_read, image_URL) VALUES (?,?,?,?,?,?)";
  db.run(insertStmt, ['The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 9.5, 1, 'https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg']);  //0 = to be read. 1 = read
  db.run(insertStmt, ['The Hunger Games', 'Suzanne Collins', 'Dystopian', 8.0, 0, 'https://upload.wikimedia.org/wikipedia/en/d/dc/The_Hunger_Games.jpg']); 
  
  console.log("Database initialized with Book table!");
});

module.exports = db;