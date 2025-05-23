const pool = require('../db');
const userService = require('../services/userService');


// Get all users
exports.getAllUsers = async (req, res) => {
    console.log("Get Users");
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    console.log("Create User");
    const { id, name, email, type, associates } = req.body;
    const password = req.body.password || null;
    try {
        console.log("ID", id);
        if (id != null && id != "null") {
            const result = await userService.updateUser(id, name, email, type, associates);
            res.status(200).json(result);
        } else {
            if (password != null) {
                const result = await userService.createUser(name, email, password);
                res.status(201).json(result);
            } else {
                const result = await userService.registerUser(name, email, type, associates);
                res.status(201).json(result);
            }
        }
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.findAssociateByUser = async (req, res) => {
    console.log("Get Associate by User");
    const { user } = req;
    try {
        const result = await userService.getAssociateByUser(user.id);
        return result[0];
    } catch (err) {
        return { error: err.message };
    }
};


exports.getAssociateByUser = async (req, res) => {
    console.log("Get Associate by User");
    try {
        const result = await userService.getAssociateByUser(req);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
        return { error: err.message };
    }
};
