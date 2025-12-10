const express = require("express");
const session = require("express-session");

const app = express(); 
const path = require("path");

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions enabled
app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true
}));

const CheckoutController = require("./controllers/CheckoutController");

// TEMP test cart to simulate items
app.get("/add-test-cart", (req, res) => {
    req.session.cart = [
        { title: "Sample Book 1", price: 5.50, qty: 1 },
        { title: "Python Guide", price: 12.00, qty: 2 }
    ];

    let total = 0;
    req.session.cart.forEach(item => {
        total += item.price * item.qty;
    });

    res.send(`
        <h2>Test Cart Added!</h2>
        <p>Your temporary cart data has been created:</p>
        <ul>
            <li>Sample Book 1 - $5.50 × 1 = $5.50</li>
            <li>Python Guide - $12.00 × 2 = $24.00</li>
        </ul>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p><strong>Next:</strong> <a href="/checkout">Proceed to Checkout</a></p>
    `);
});



// Checkout routes
app.get("/checkout", CheckoutController.checkoutPage);
app.post("/checkout/pay", CheckoutController.processPayment);

// Server listening at bottom
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
