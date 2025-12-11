const Book = require("../models/Book");

function ensureCart(req) {
    if (!req.session.cart) req.session.cart = [];
    return req.session.cart;
}

function calcTotal(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
}

module.exports = {
    viewCart: (req, res) => {
        const cart = ensureCart(req);
        const total = calcTotal(cart);
        res.render("cart", { cart, total: total.toFixed(2) });
    },

    addItem: async (req, res) => {
        try {
            const { bookId, title, price, qty } = req.body;
            const cart = ensureCart(req);
            let book = null;
            if (bookId) {
                book = await Book.findById(bookId);
            }
            const resolvedTitle = (book && book.title) || title || "Book";
            const resolvedPrice = Number((book && book.price) || price || 0);
            const resolvedId = book ? book.id : bookId || resolvedTitle;
            const resolvedQty = Math.max(1, Number(qty) || 1);

            const existing = cart.find(i => String(i.id) === String(resolvedId));
            if (existing) {
                existing.qty += resolvedQty;
            } else {
                cart.push({
                    id: resolvedId,
                    title: resolvedTitle,
                    price: resolvedPrice,
                    qty: resolvedQty,
                    badge: book && book.badge ? book.badge : ""
                });
            }
            res.redirect("/cart");
        } catch (err) {
            console.error("Add to cart error", err);
            res.status(500).send("Could not add to cart");
        }
    },

    updateItem: (req, res) => {
        const { id, qty } = req.body;
        const cart = ensureCart(req);
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            const newQty = Number(qty);
            if (!Number.isFinite(newQty) || newQty <= 0) {
                req.session.cart = cart.filter(i => String(i.id) !== String(id));
            } else {
                item.qty = newQty;
            }
        }
        res.redirect("/cart");
    },

    removeItem: (req, res) => {
        const { id } = req.body;
        const cart = ensureCart(req);
        req.session.cart = cart.filter(i => String(i.id) !== String(id));
        res.redirect("/cart");
    },

    clearCart: (req, res) => {
        req.session.cart = [];
        res.redirect("/cart");
    }
};
