const { createDb } = require("./db_init");
const path = require("path");
const db_name = path.join(__dirname, "data", "apptest.db");
console.log({ db_name });
const dbPromise = createDb(db_name);

exports.createBooks = async () => {
  const sql_insert = `INSERT INTO Books (Title, Author, Comments) VALUES
('Mrs. Bridge', 'Evan S. Connell', 'First in the serie'),
('Mr. Bridge', 'Evan S. Connell', 'Second in the serie'),
('L''ingénue libertine', 'Colette', 'Minne + Les égarements de Minne');`;
  const db = await dbPromise;
  const sqlResult = new Promise((resolve, reject) => {
    const { response, error } = db.run(sql_insert, (err) => {
      if (err) {
        resolve({ response: null, error: err });
        return console.log("Failed to create books", err.message);
      }
      console.log("Successful creation of 3 books");
      resolve({ response: "Successfully inserted", error: null });
    });
    return { response: response, error: error };
  });
  return sqlResult;
};

exports.getBooks = async () => {
  const sql = "SELECT * FROM Books ORDER BY Title";
  const db = await dbPromise;
  const sqlResult = new Promise((resolve, reject) => {
    const rows = db.all(sql, [], (err, rows) => {
      if (err) {
        resolve({ response: null, error: err });
      } else {
        resolve({ response: rows, error: null });
      }
    });
  });
  return sqlResult;
};

exports.getBook = async (bookId) => {
  const sql = `SELECT * FROM Books WHERE Book_ID = ${bookId};`;
  console.log("sql: ", sql);
  const db = await dbPromise;
  const sqlResult = new Promise((resolve, reject) => {
    const rows = db.all(sql, [], (err, rows) => {
      if (err) {
        resolve({ response: null, error: err });
        return;
      }
      console.log(rows, rows.length);
      if (rows.length === 0) {
        resolve({ response: null, error: "Book Not Found" });
      } else {
        resolve({ response: rows[0], error: null });
      }
    });
  });
  return sqlResult;
};

exports.getBooksWithPagination = async (offset, limit) => {
  console.log(offset, limit);
  const sql = `SELECT * FROM Books LIMIT ${
    parseInt(offset) + parseInt(limit)
  } OFFSET ${offset};`;
  console.log("sql: ", sql);
  const db = await dbPromise;
  const sqlResult = new Promise((resolve, reject) => {
    const rows = db.all(sql, [], (err, rows) => {
      if (err) {
        resolve({ response: null, error: err });
        return;
      }
      console.log(rows, rows.length);
      resolve({ response: rows, error: null });
    });
  });
  return sqlResult;
};
