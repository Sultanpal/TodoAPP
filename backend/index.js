const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken"); 
const { createUser, createTodo, getTodosByUser, loginUser } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "mySuperSecureKey123!";
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};

// Sign Up Route
app.post("/signUp", async (req, res) => {
    try {
        const result = await createUser(req.body);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(201).json({ message: "User created successfully", user: result.user });
    } catch (error) {
        console.error("Error in signUp:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const result = await loginUser(req.body);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        const token = jwt.sign({ id: result.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Todos for a User
app.post("/fetchData", verifyToken, async (req, res) => {
    try {
        const result = await getTodosByUser(req.user.id); // Use the logged-in user's ID
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in fetchData:", error.message);
        res.status(500).json({ message: "Error fetching data" });
    }
});

// Start Server
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});
