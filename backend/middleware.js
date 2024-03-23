import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded.user; // Set the decoded user to the request object
        // console.log("Middleware: ",req.user);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// export const authorizeUser = (req, res, next) => {
//     // console.log(req.user);
//     const userRole = getRole(req.user);
//     if (userRole === 'admin') {
//         next(); // User is admin, continue to the next middleware
//     } else {
//         // res.redirect('/home/customer');
//         res.status(403).json({ message: 'Unauthorized access.' });
//     }
// };


// export const getRole = (user) => {
//     if(user.email === 'admin42@gm.com') {
//         return 'admin';
//     }else {
//         return 'customer';
//     }
// };