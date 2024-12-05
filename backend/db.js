const mongoose = require("mongoose");
const zod = require("zod");
const bcrypt = require('bcrypt');
require("dotenv").config();

// Use the environment variable for MongoDB URI nPFVuXdLTsUN2tC8
const mongoURI = "mongodb+srv://sultanpal81:nPFVuXdLTsUN2tC8@hardikdb.bkxb2.mongodb.net/";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Define Zod validation schemas
const userSchemaZod = zod.object({
    userfirstname: zod.string().min(1, "First name must be at least 1 character"),
    userlastname: zod.string().min(1, "Last name must be at least 1 character"),
    gmailId: zod.string().email({ message: "Invalid email format" }),
    password: zod.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const TodoSchemaZod = zod.object({
    title: zod.string().min(1, "Title cannot be blank"),
    description: zod.string().min(1, "Description cannot be blank")
});

// Define Mongoose schemas for `users` and `todos`
const userSchemaMongoose = new mongoose.Schema({
    userfirstname: { type: String, required: true },
    userlastname: { type: String, required: true },
    gmailId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const TodoSchemaMongoose = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }  // Foreign key reference to `users`
});

// Create Mongoose models for `users` and `todos`
const User = mongoose.model("User", userSchemaMongoose);
const Todo = mongoose.model("Todo", TodoSchemaMongoose);


// Function to create a new user
async function createUser(data) {
    try {
        console.log("data recived");
        const validatedData = userSchemaZod.parse(data);
        
        // Check if user already exists
        const existingUser = await User.findOne({ gmailId: validatedData.gmailId });
        if (existingUser) {
            console.log("USER PHLE SE HAI");
            return { success: false, message: "Account with this email already exists." };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        console.log("data is gone to create");
        // Create a new user
        const newUser = new User({
            userfirstname: validatedData.userfirstname,
            userlastname: validatedData.userlastname,
            gmailId: validatedData.gmailId,
            password: hashedPassword
        });
        const savedUser = await newUser.save();
        console.log("user create ");
        return { success: true, user: savedUser };

    } catch (error) {
        if (error instanceof zod.ZodError) {
            return { success: false, message: "Validation errors", errors: error.errors };
        }
        return { success: false, message: "Database error" };
    }
}
async function loginUser(data) {
    const email = data.gmailId;
    const password = data.password;
    console.log("Processing login");
    
    if (!email || !password) {
        console.log("Missing email or password");
        return { success: false, message: "Email and password are required" };
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return { success: false, message: "User not found" };
        }
        console.log("login user find now check password");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid credentials");
            return { success: false, message: "Invalid credentials" };
        }

        console.log("Login successful");
        return { success: true, user };
    } catch (error) {
        console.error("Error during login:", error);
        return { success: false, message: "Server error" };
    }
}


// Function to create a new todo
async function createTodo(data) {
    try {
        const validatedTodo = TodoSchemaZod.parse(data);

        // Ensure userId is provided
        if (!data.userId) {
            throw new Error("User ID is required to create a todo.");
        }

        // Create a new todo and link to the user
        const newTodo = new Todo({
            title: validatedTodo.title,
            description: validatedTodo.description,
            userId: data.userId  // Link todo to the user via foreign key
        });

        const savedTodo = await newTodo.save();
        return { success: true, todo: savedTodo };

    } catch (error) {
        if (error instanceof zod.ZodError) {
            return { success: false, message: "Validation errors", errors: error.errors };
        }
        return { success: false, message: "Database error" };
    }
}

// Function to get all todos for a specific user
async function getTodosByUser(userId) {
    try {
        const todos = await Todo.find({ userId }).populate("userId", "userfirstname userlastname gmailId");
        return { success: true, todos };
    } catch (error) {
        return { success: false, message: "Error fetching todos" };
    }
}

module.exports = { createUser, createTodo, getTodosByUser,loginUser};
