// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        // 1. Headers se token nikalna (Format: "Bearer <token_string>")
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Access denied. Ticket (token) nahi mila!" });
        }

        // Sirf token ka string nikalna ("Bearer " ko hata kar)
        const token = authHeader.split(' ')[1];

        // 2. Token ko verify karna ki fake ya expire toh nahi hua
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Token se userId nikal kar aage ki request ke liye save kar dena
        req.userId = decoded.userId;

        // 4. Ticket valid hai, agle function (controller) ke paas bhej do
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid ya expired token!" });
    }
};

module.exports = protect;