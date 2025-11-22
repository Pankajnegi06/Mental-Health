const jwt = require('jsonwebtoken');

require('dotenv').config();

const auth = async (req, res, next) => {
    const { token } = req.cookies;
    console.log("Token received:", token);

    if (!token) {
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        console.log("Decoded userId:", req.body.userId);
        console.log("User authenticated successfully");
        next();
    } catch (e) {
        console.error("Error verifying token:", e.message);
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access - Token is invalid or expired"
        });
    }
};

module.exports = auth;
