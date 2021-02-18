const express = require("express");
const path = require("path");
const { createDb } = require("./db_init");
const db_name = path.join(__dirname, "data", "apptest.db");
console.log({ db_name });
const dbPromise = createDb(db_name);

const app = express();

app.use(express.json())

app.listen(8000, () => {
  console.log("Server started (http://localhost:8000/) !");
});

app.get("/", (req, res) => {
  res.send("Hello world...");
});

app.get("/books/v1", async (req, res) => {
  const sql_insert = `INSERT INTO Books (Book_ID, Title, Author, Comments) VALUES
    (1, 'Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
    (2, 'Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
    (3, 'L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne');`;
  const db = await dbPromise;
  db.run(sql_insert, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Successful creation of 3 books");
    res.send("Successfully inserted");
  });
});

app.get('/books/:id',(req, res)=> {
  req.send(req.params.id)
})

app.get("/get/books", async (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  const db = await dbPromise;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.send(rows);
  });
});
