const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
	{
		username: "ibrahim",
		password: "55555",
	},
	{
		username: "ali",
		password: "123456",
	},
];

const isValid = (username) => {
	//returns boolean
	return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
	//returns boolean
	//write code to check if username and password match the one we have in records.
	const user = users.find((user) => user.username === username);
	return user && user.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	//Write your code here
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	if (!isValid(username)) {
		return res.status(401).json({ message: "Invalid username" });
	}

	if (!authenticatedUser(username, password)) {
		return res.status(401).json({ message: "Invalid password" });
	}

	// Authentication successful, generate JWT token
	const token = jwt.sign({ username }, "secretkey");

	res.json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	//Write your code here
	const { isbn } = req.params;
	const { review } = req.query;
	const { username } = req.session;

	if (!username) {
		return res.status(401).json({ message: "Unauthorized, user not logged in" });
	}

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	const existingReviewIndex = books[isbn].reviews.findIndex(
		(r) => r.username === username
	);

	if (existingReviewIndex !== -1) {
		books[isbn].reviews[existingReviewIndex].review = review;
		return res.status(200).json({ message: "Review modified successfully" });
	} else {
		books[isbn].reviews.push({ username, review });
		return res.status(201).json({ message: "Review added successfully" });
	}
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	const { isbn } = req.params;
	const { username } = req.session;

	if (!username) {
		return res.status(401).json({ message: "Unauthorized, user not logged in" });
	}

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	books[isbn].reviews = books[isbn].reviews.filter(
		(review) => review.username !== username
	);

	return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
