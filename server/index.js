const express = require("express");
const path = require("path");
const { createDb } = require("./db_init");
const {
  createBooks,
  getBooks,
  getBook,
  getBooksWithPagination,
} = require("./views");

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

app.get("/get/:bookId/books", async (req, res) => {
  try {
    const { response, error } = await getBook(req.params.bookId);
    if (error) {
      res.status(404).send("Book Id notfound");
    } else {
      console.log("Response: ", response);
      res.status(200).send(response);
    }
  } catch (e) {}
});

app.get("/get/books_with_pagination/", async (req, res) => {
  try {
    console.log(req.query);
    const offset = req.query.offset || 0;
    const limit = req.query.limit || 10;
    console.log(offset, limit);
    const { response, error } = await getBooksWithPagination(offset, limit);
    if (error) {
      res.status(404).send("Book Id notfound");
    } else {
      console.log("Response: ", response);
      res.status(200).send(response);
    }
  } catch (e) {}
});
