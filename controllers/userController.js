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
    const { name, email, password } = req.body;
    try {
        const result = await userService.createUser(name, email, password);
        res.status(201).json(result);
    } catch (err) {
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
    const { user } = req;
    try {
        const result = await userService.getAssociateByUser(user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
        return { error: err.message };
    }
};
