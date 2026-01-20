import { User } from "./model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export async function Login(req, res) {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
        return res.status(400).json({
            message: "Missing credentials",
        });
    }

    const user = await User.findOne({
        $or: [{ username: loginId }, { email: loginId }],
    });

    if (!user) {
        return res.status(401).json({
            message: "Username or email not found",
        });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.status(401).json({
            message: "Incorrect password",
        });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.json({
        message: "Login successful",
        token: token,
        user: {
            userid: user._id,
            username: user.username,
        },
    });
}

export async function Register(req, res) {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
        return res.status(400).json({
            message: "Missing credentials",
        });
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        return res.status(400).json({
            message: "Already used username",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = uuidv4();

    const newUser = new User({
        _id: id,
        fullname,
        username,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
        message: "User registered successfully",
    });
}
