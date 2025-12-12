const pool = require("../db");

module.exports = {
    async findByEmail(email) {
        const [rows] = await pool.execute(
            "SELECT user_id AS id, username, email, user_password AS password_hash, role FROM user WHERE email = ? LIMIT 1",
            [email.toLowerCase()]
        );
        return rows[0] || null;
    },

    async create({ name, email, password }) {
        const normalizedEmail = email.toLowerCase();
        const [result] = await pool.execute(
            "INSERT INTO user (username, email, user_password, role) VALUES (?, ?, ?, 'buyer')",
            [name, normalizedEmail, password]
        );
        return { id: result.insertId, name, email: normalizedEmail, role: "buyer" };
    }
};
