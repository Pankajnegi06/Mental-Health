const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    // Try to get token from cookies first
    let token = req.cookies?.token;
    
    // If not in cookies, try to get from Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    console.log("Auth Debug - Token received:", token ? 'Token exists' : 'No token found');

    if (!token) {
        return res.status(401).json({
            status: 0,
            message: "Authentication required: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Attach user to the request object
        req.user = { id: decoded.id, _id: decoded.id };
        if (!req.body) req.body = {};
        req.body.userId = decoded.id; // For backward compatibility
        
        console.log(`User authenticated successfully - User ID: ${decoded.id}`);
        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);
        
        // Clear the invalid token cookie if it exists
        res.clearCookie('token');
        
        return res.status(401).json({
            status: 0,
            message: `Authentication failed: ${error.message}`
        });
    }
};

module.exports = { isAuthenticated };
