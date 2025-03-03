const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = "fingerprint_customer";  // Vous pouvez la stocker dans un fichier .env pour plus de sécurité

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
regd_users.get("/auth/check", (req, res) => {
    if (req.session.authorization) {
        return res.json({ message: "User is logged in", session: req.session });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Vérifier si l'utilisateur existe dans l'objet `users`
    if (!users[username]) {
        return res.status(404).json({ message: "User not found." });
    }

    // Vérifier si le mot de passe correspond
    if (users[username].password !== password) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Générer le token JWT
    const accessToken = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    // Stocker le token et l'utilisateur dans la session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.user?.username; // Récupérer l'utilisateur à partir du JWT
    const { review } = req.body;
    const isbn = req.params.isbn;

    if (!username) {
        return res.status(403).json({ message: "Unauthorized: Please log in to submit a review." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content cannot be empty." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.json({ 
        message: "Review added/updated successfully!", 
        reviews: books[isbn].reviews 
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.user?.username; // Récupérer l'utilisateur à partir du JWT
    const isbn = req.params.isbn;

    if (!username) {
        return res.status(403).json({ message: "Unauthorized: Please log in to delete a review." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user." });
    }

    // Supprimer la critique de l'utilisateur
    delete books[isbn].reviews[username];

    return res.json({ 
        message: "Review deleted successfully!", 
        reviews: books[isbn].reviews 
    });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
