require("dotenv").config();
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
var bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "data", "apptest.db");
// const SqliteStore = sqliteStoreFactory(session);

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/**
  Initialize db before initializing express server
*/

let db = null;

open({
  filename: dbPath,
  driver: sqlite3.Database,
})
  .then(async (sqliteDB) => {
    db = sqliteDB;
    /** Create DB Tables */
    const create_users = `CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT 
);`;
    const create_books = `CREATE TABLE IF NOT EXISTS Books (
        Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title VARCHAR(100) NOT NULL,
        Author VARCHAR(100) NOT NULL,
        Comments TEXT
      );`;

    const usersTable = await db.run(create_users);
    const booksTable = await db.run(create_books);
    app.listen(8001, () => {
      console.log("Server started (http://localhost:8000/) !");
    });
  })
  .catch((e) => {
    console.error("DB is not initialized properly ", e.message);
    process.exit(-1);
  });


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) res.sendStatus(401);
  else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  }
}

app.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const dbUser = await db.get(
    "SELECT username, id FROM Users WHERE username = :username",
    {
      ":username": req.body.username,
    }
  );
  if (dbUser) {
    res.status(400).send("Username already exists");
    return;
  }
  const createUserSql = `INSERT INTO Users (username, password) VALUES (:username, :password)`;
  const newUser = await db.run(createUserSql, {
    ":username": req.body.username,
    ":password": hashedPassword,
  });
  res.send(`Created new user ${newUser}`);
});

app.get("/users", authenticateToken, async (req, res) => {
  const usersQuery = `SELECT * from Users`;
  const users = await db.all(usersQuery);
  res.send(users);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;

  const dbUser = await db.get(
    "SELECT id, username, password FROM Users WHERE username = :username",
    { ":username": username }
  );
  console.log("db User ", dbUser, username );
  if (!dbUser) {
    res.status(400).send("Invalid Credentials");
    return;
  }
  const isPasswordMactched = await bcrypt.compare(
    req.body.password,
    dbUser.password
  );
  if (isPasswordMactched === true) {
    const user = { name: username, userId: dbUser.id };

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.send({ accessToken });
  } else {
    res.status(400).send("Invalid Password");
  }
});

app.get("/", authenticateToken, (req, res) => {
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

app.get("/books/:id", async (req, res) => {
  const getBookQuery = "SELECT * FROM Books WHERE Book_ID = ?";
  const book = await db.get(getBookQuery, req.params.id);
  res.send(book);
});

app.get("/get/books", async (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  const rows = await db.all(sql);
  res.send(rows);
});

app.get("/books/:id", async (req, res) => {
  const getBookQuery = "SELECT * FROM Books WHERE Book_ID = ?";
  const book = await db.get(getBookQuery, req.params.id);
  res.send(book);
});

app.get("/get/books", async (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  const rows = await db.all(sql);
  res.send(rows);
});

app.post("/post/books", async (req, res) => {
  console.log(req.body);
  res.send("Hello");
});
