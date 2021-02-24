require("dotenv").config();
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const passport = require("passport");
const sqliteStoreFactory = require("express-session-sqlite").default;
const LocalStrategy = require("passport-local").Strategy;
var crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "data", "apptest.db");

function hashPassword(password, salt) {
  var hash = crypto.createHash("sha256");
  hash.update(password);
  hash.update(salt);
  return hash.digest("hex");
}
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
/*
  app.use(
  session({
    store: new SqliteStore({
      driver: sqlite3.Database,
      path: dbPath,
      ttl: 1234,
      prefix: "sess:",
    }),
    secret: "learn",
    resave: true,
    saveUninitialized: false,
  })
);
*/
app.use(cookieParser("learn"));
/**
  Initialize db before initializing express server
*/

let db = null;

open({
  filename: dbPath,
  driver: sqlite3.Database,
})
  .then((sqliteDB) => {
    db = sqliteDB;
    /** Create DB Tables */
    const create_users = `CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT, 
    salt TEXT 
);`;
    const create_books = `CREATE TABLE IF NOT EXISTS Books (
        Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title VARCHAR(100) NOT NULL,
        Author VARCHAR(100) NOT NULL,
        Comments TEXT
      );`;

    passport.use(
      new LocalStrategy(function (username, password, done) {
        db.get(
          "SELECT salt FROM users WHERE username = ?",
          username,
          function (err, row) {
            if (!row) return done(null, false);
            var hash = hashPassword(password, row.salt);
            db.get(
              "SELECT username, id FROM users WHERE username = ? AND password = ?",
              username,
              hash,
              function (err, row) {
                if (!row) return done(null, false);
                return done(null, row);
              }
            );
          }
        );
      })
    );

    passport.serializeUser(function (user, done) {
      return done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
      db.get(
        "SELECT id, username FROM users WHERE id = ?",
        id,
        function (err, row) {
          if (!row) return done(null, false);
          return done(null, row);
        }
      );
    });

    app.listen(8001, () => {
      console.log("Server started (http://localhost:8000/) !");
    });
  })
  .catch((e) => {
    console.error("DB is not initialized properly ", e.message);
    process.exit(-1);
  });

app.use(passport.initialize());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) res.sendStatus(401);
  else {
    jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET,(err, user) => {
      if(err){
        res.sendStatus(403)
      }
      req.user = user
      next()
    })
  }
}

app.post("/register", async (req, res) => {
  const result = await db.get(
    "SELECT username, id FROM users WHERE username = :username AND password = :password",
    {
      ":username": req.body.username,
      ":password": req.body.password,
    }
  );
});

app.post("/login", (req, res) => {
  // TODO: Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
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
