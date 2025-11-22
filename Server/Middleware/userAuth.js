const jwt = require("jsonwebtoken");

require("dotenv").config();

const userAuth = async (req, res, next) => {
    let { token } = req.cookies;
    
    // Check Authorization header if token not in cookies
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        req.user = { id: decoded.id }; // Attach user object
        req.token = token; // Attach token for downstream use
        console.log("Decoded userId:", req.body.userId);
    } catch (e) {
        // console.error("Error verifying token:", e.message);
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access - Token is invalid or expired"
        });
    }

    next();
};

module.exports = userAuth;