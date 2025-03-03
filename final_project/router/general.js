const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

// Route pour obtenir la liste des livres avec async/await
public_users.get('/', async function (req, res) {
    try {
        // Simuler une récupération asynchrone des livres (vous pouvez aussi appeler une API externe ici)
        const getBooks = async () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(books); // Simuler une réponse réussie
                }, 1000); // Délai pour montrer l'asynchronicité
            });
        };

        const bookList = await getBooks(); // Attendre que la promesse soit résolue
        res.status(200).json(bookList); // Retourner la liste des livres
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des livres." });
    }
});


// Route pour obtenir les détails d'un livre par ISBN avec async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Simuler une requête asynchrone pour récupérer les détails du livre
        const bookDetails = await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("Livre non trouvé");
                }
            }, 1000);
        });

        res.json(bookDetails);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Route pour obtenir les détails d'un livre par auteur avec async/await
public_users.get('/author/:author', async function (req, res) {
    const authorName = req.params.author.toLowerCase();

    try {
        const booksByAuthor = await new Promise((resolve) => {
            setTimeout(() => {
                const results = Object.keys(books).filter((isbn) => 
                    books[isbn].author.toLowerCase() === authorName
                ).map((isbn) => ({ isbn, ...books[isbn] }));
                resolve(results);
            }, 1000);
        });

        if (booksByAuthor.length > 0) {
            res.json(booksByAuthor);
        } else {
            res.status(404).json({ message: "Aucun livre trouvé pour cet auteur" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des livres par auteur." });
    }
});

// Route pour obtenir les détails d'un livre par titre avec async/await
public_users.get('/title/:title', async function (req, res) {
    const titleQuery = req.params.title.toLowerCase();

    try {
        const foundBook = await new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = Object.keys(books).find((isbn) => 
                    books[isbn].title.toLowerCase() === titleQuery
                );

                if (book) {
                    resolve({ isbn: book, ...books[book] });
                } else {
                    reject("Aucun livre trouvé avec ce titre");
                }
            }, 1000);
        });

        res.json(foundBook);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});


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
