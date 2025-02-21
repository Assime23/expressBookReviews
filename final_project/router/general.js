const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Route to register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Get username and password from request body

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists
    if (users[username]) {
        return res.status(409).json({ message: "Username is already taken." });
    }

    // Add the new user to the database (without password hashing for now)
    users[username] = { password };

    res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;  // Récupérer l’ISBN de la requête
    const book = books[isbn];  // Chercher le livre dans la base de données

    if (book) {
        res.json(book);  // Retourner les détails du livre
    } else {
        res.status(404).json({ message: "Livre non trouvé" });  // Livre introuvable
    }
 });
  
// Get book details based on author
// Route pour obtenir un livre par auteur
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;  // Récupérer l’auteur de la requête
    const booksByAuthor = [];

    // Parcourir tous les livres pour trouver ceux de l’auteur
    Object.keys(books).forEach(isbn => {
        if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
            booksByAuthor.push({ isbn, ...books[isbn] });
        }
    });

    // Vérifier si des livres ont été trouvés
    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);  // Retourner les livres trouvés
    } else {
        res.status(404).json({ message: "Aucun livre trouvé pour cet auteur" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleQuery = req.params.title.toLowerCase(); // Convertir en minuscule pour éviter la casse
    let foundBook = null;

    // Parcourir tous les livres pour trouver le titre correspondant
    Object.keys(books).forEach(isbn => {
        if (books[isbn].title.toLowerCase() === titleQuery) {
            foundBook = { isbn, ...books[isbn] };
        }
    });

    // Vérifier si le livre a été trouvé
    if (foundBook) {
        res.json(foundBook);  // Retourner les détails du livre
    } else {
        res.status(404).json({ message: "Aucun livre trouvé avec ce titre" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Récupérer l’ISBN depuis la requête
    const book = books[isbn];  // Vérifier si le livre existe

    if (book) {
        const reviews = book.reviews;
        if (Object.keys(reviews).length > 0) {
            res.json(reviews);  // Retourner les critiques si elles existent
        } else {
            res.json({ message: "Aucune critique disponible pour ce livre." });
        }
    } else {
        res.status(404).json({ message: "Livre non trouvé" });  // Livre introuvable
    }
});
module.exports.general = public_users;
