process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES(
        '123432122',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008
    ) RETURNING isbn`);
  book_isbn = result.rows[0].isbn;
});

describe("GET /", () => {
  test("Get all books", async () => {
    const res = await request(app).get("/books");
    expect(res.body.books[0]).toHaveProperty("isbn");
    expect(res.body.books[0]).toHaveProperty("amazon_url");
  });
});

describe("POST /", () => {
  test("Create a book", async () => {
    const res = await request(app).post("/books").send({
      isbn: "32794782",
      amazon_url: "https://taco.com",
      author: "mctest",
      language: "english",
      pages: 1000,
      publisher: "yeah right",
      title: "amazing times",
      year: 2000,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
  });
});

describe("GET /books/:isbn", () => {
  test("Get a single book", async () => {
    const res = await request(app).get(`/books/${book_isbn}`);
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.isbn).toBe(book_isbn);
  });
  test("Respond with 404 code if isbn is not in database", async () => {
    const res = await request(app).get(`/books/41542`);
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /books/:isbn", () => {
  test("Update a book", async () => {
    const res = await request(app).put(`/books/${book_isbn}`).send({
      amazon_url: "https://taco.com",
      author: "mctest",
      language: "english",
      pages: 1000,
      publisher: "yeah right",
      title: "UPDATED BOOK",
      year: 2000,
    });
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.title).toBe("UPDATED BOOK");
  });
});

describe("DELETE /books/:isnb", () => {
  test("Delete a book", async () => {
    const res = await request(app).delete(`/books/${book_isbn}`);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});

afterEach(async () => {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async () => {
  await db.end();
});
