const express = require("express");

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//get all books
function fetchBooks() {
	return require("./booksdb.js");
}

//get books by isbn
function getBookByIsbn(isbn) {
	return new Promise((resolve, reject) => {
		const book = fetchBooks()[isbn];
		if (book) {
			resolve(book);
		} else {
			reject("Book not found");
		}
	});
}

// fetch books by author
function getBooksByAuthor(author) {
	return new Promise((resolve, reject) => {
		const matchingBooks = [];
		const books = fetchBooks();
		for (let key in books) {
			if (books.hasOwnProperty(key) && books[key].author === author) {
				matchingBooks.push(books[key]);
			}
		}
		if (matchingBooks.length > 0) {
			resolve(matchingBooks);
		} else {
			reject("Books by this author not found");
		}
	});
}

// fetch books by title
function getBooksByTitle(title) {
	return new Promise((resolve, reject) => {
		const matchingBooks = [];
		const books = fetchBooks();
		for (let key in books) {
			if (books.hasOwnProperty(key) && books[key].title === title) {
				matchingBooks.push(books[key]);
			}
		}
		if (matchingBooks.length > 0) {
			resolve(matchingBooks);
		} else {
			reject("Books with this title not found");
		}
	});
}

public_users.post("/register", (req, res) => {
	const { username, password } = req.body;

	// Check if username and password are provided
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	// Check if the username already exists
	if (users.hasOwnProperty(username)) {
		return res.status(409).json({ message: "Username already exists" });
	}

	// Register the new user
	users[username] = { username, password };

	// Respond with success message
	return res.status(201).json({ message: "User registered successfully" });
});

public_users.get("/", async function (req, res) {
	try {
		let books = await fetchBooks();
		return res.send(JSON.stringify(books, null, "\t"));
	} catch (error) {
		console.error(error);
		return res.status(500).send("An error occurred");
	}
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	const isbn = req.params.isbn;

	getBookByIsbn(isbn)
		.then((book) => {
			if (book) {
				res.json(book);
			} else {
				res.status(404).send("Book not found");
			}
		})
		.catch((error) => {
			console.error("Error fetching book:", error);
			res.status(500).send("Error fetching book");
		});
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	const author = req.params.author;
	getBooksByAuthor(author)
		.then((books) => {
			if (books.length > 0) {
				res.json(books);
			} else {
				res.status(404).send("Books by this author not found");
			}
		})
		.catch((error) => {
			console.error("Error fetching books by author:", error);
			res.status(500).send("Error fetching books by author");
		});
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	const title = req.params.title;
	getBooksByTitle(title)
		.then((books) => {
			if (books.length > 0) {
				res.json(books);
			} else {
				res.status(404).send("Books with title not found");
			}
		})
		.catch((error) => {
			console.error("Error fetching books with title:", error);
			res.status(500).send("Error fetching books with title");
		});
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	const bookReview = fetchBooks()[isbn].reviews;
	res.json(bookReview);
});

module.exports.general = public_users;
