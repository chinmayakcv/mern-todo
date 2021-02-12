const sqlite3 = require("sqlite3").verbose();

exports.createDb = (dbName) => {
  const sql_create = `CREATE TABLE IF NOT EXISTS Books (
        Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title VARCHAR(100) NOT NULL,
        Author VARCHAR(100) NOT NULL,
        Comments TEXT
      );`;
  const createPromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbName, (err) => {
      if (err) {
        reject(err.message);
        return console.error(err.message);
      }
      resolve({ db, dbName: dbName });
      console.log("Successful connection to the database 'apptest.db'");
    });
  });

  return createPromise.then(({ db }) => {
    db.run(sql_create, (err) => {
      if (err) {
        reject(err.message);
        return console.error(err.message);
      }
      console.log("Successful creation of the 'Books' table");
    });
    return db;
  });
};
