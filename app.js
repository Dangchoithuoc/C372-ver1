const express = require("express");
const session = require("express-session");

const app = express(); 
const path = require("path");

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions enabled
app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true
}));

const CheckoutController = require("./controllers/CheckoutController");
const BookController = require("./controllers/BookController");
const UserController = require("./controllers/UserController");
const CartController = require("./controllers/CartController");

// Middleware to require items in cart before checkout
function requireCartItems(req, res, next) {
    const cart = req.session.cart || [];
    if (!cart.length) {
        return res.redirect("/cart");
    }
    next();
}

// Middleware to require login before cart actions
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Homepage
app.get("/", BookController.homePage);

// Auth routes
app.get("/login", UserController.loginPage);
app.post("/login", UserController.login);
app.get("/register", UserController.registerPage);
app.post("/register", UserController.register);
app.get("/logout", UserController.logout);

// Cart routes (login required)
app.get("/cart", requireLogin, CartController.viewCart);
app.post("/cart/add", requireLogin, CartController.addItem);
app.post("/cart/update", requireLogin, CartController.updateItem);
app.post("/cart/remove", requireLogin, CartController.removeItem);
app.post("/cart/clear", requireLogin, CartController.clearCart);

// Checkout routes (login + cart required)
app.get("/checkout", requireLogin, requireCartItems, CheckoutController.checkoutPage);
app.post("/checkout/pay", requireLogin, requireCartItems, CheckoutController.processPayment);

// Server listening at bottom
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
