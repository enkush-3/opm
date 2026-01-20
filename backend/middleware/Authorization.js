import jwt from "jsonwebtoken";

export function Authorzation(req, res, next) {
    const authHeader = req.header.authorzation;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "invalid token format",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "invalid or expired token",
        });
    }
}

export function socketAuth(socket, next) {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

    if (!token) {
        return next(new Error("No token provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
}

