const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
const secretKey = "fingerprint_customer"; // Clé secrète pour JWT

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Middleware pour vérifier le JWT
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // On récupère le token du header Authorization

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Vérifier le token JWT
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "User not authenticated" });
        }
        req.user = user; // Stocker les informations de l'utilisateur dans la requête
        next(); // Continuer vers la route protégée
    });
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
