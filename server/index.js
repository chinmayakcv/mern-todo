const express = require("express");
const path = require("path");
const { createDb } = require("./db_init");
const { createBooks, getBooks } = require("./views");

const db_name = path.join(__dirname, "data", "apptest.db");
console.log({ db_name });
const dbPromise = createDb(db_name);

const app = express();

app.listen(8000, () => {
  console.log("Server started (http://localhost:8000/) !");
});

app.get("/", (req, res) => {
  res.send("Hello world...");
});

app.get("/books/v1", async (req, res) => {
  try {
    const { response, error } = await createBooks();
    if (error) {
      res.status(417).send("Something Went Wrong");
    } else {
      res.status(201).send(response);
    }
  } catch (e) {}
});

app.get("/get/books", async (req, res) => {
  try {
    const { response, error } = await getBooks();
    if (error) {
      res.status(417).send("Something Went Wrong");
    } else {
      res.status(200).send(response);
    }
  } catch (e) {}
});
