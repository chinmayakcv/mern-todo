const express = require("express");
const path = require("path");
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

const dbPath = path.join(__dirname, "data", "apptest.db");



const app = express();

app.use(express.json())

/**
  Initialize db before initializing express server
*/

let db = null

open({
  filename: dbPath,
  driver: sqlite3.Database
}).then((sqliteDB) => {
  db = sqliteDB
  // Start listening server
  app.listen(8001, () => {
    console.log("Server started (http://localhost:8000/) !");
  });
}).catch((e) => {
  console.error("DB is not initialized properly ", e.message)
  process.exit(-1)
})

app.get("/", (req, res) => {
  res.send("Hello world...");
});

app.get("/books/v1", async (req, res) => {
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
    (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
    (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
    (3, 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne');`;
  const inserted = await db.run(sql_insert);
    res.send("Successfully inserted");
});

app.get('/books/:id',async (req, res)=> {
  const getBookQuery = "SELECT * FROM Books WHERE Book_ID = ?"
  const book = await db.get(getBookQuery,req.params.id)
  res.send(book)
})

app.get("/get/books", async (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  const rows = await db.all(sql)
  res.send(rows)
});
