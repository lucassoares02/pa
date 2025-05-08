const userService = require('../services/userService');
const { generateToken } = require('../helpers/jwt');

exports.signin = async (req, res, next) => {
    console.log('Request Login');
    const { email, password } = req.body;
    try {
        const user = await userService.validateLogin(email, password);
        const token = generateToken({ id: user.id, email: user.email, type: user.type });
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};
