const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Auth Header:", authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: "failure",
            message: "Access denied. Access token not found, please login again.",
        });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded Token:", decodedToken);
        req.userInfo = decodedToken;
        next();


    } catch (error) {
        return res.status(500).json({
            status: "failure",
            message: "Access denied. Access token not found, please login again.",
        });
    }


}

module.exports = authMiddleware