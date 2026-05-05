const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({message: "Username already exists."});
  }

  users.push({ username, password });

  return res.status(201).json({message: "User successfully registered. You can now login."});
});

// Helper function to get all books (simulating async operation)
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    // In a real scenario, this would be an axios.get call to a data source
    // For now, we resolve with the local 'books' object
    resolve(books);
  });
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    // This catch block would typically handle network errors or API issues
    return res.status(500).json({ message: "Error retrieving books: " + error.message });
  }
});

// Helper function to get book by ISBN (simulating async operation)
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    // In a real scenario, this would be an axios.get call
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Helper function to get books by Author (simulating async operation)
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    // In a real scenario, this would be an axios.get call
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject(new Error("No books by this author found"));
    }
  });
};

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Helper function to get books by Title (simulating async operation)
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    // In a real scenario, this would be an axios.get call
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject(new Error("No books with this title found"));
    }
  });
};

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.json(book.reviews);
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
