const pool = require('../db');
const { comparePassword, hashPassword } = require('../helpers/hash');

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const validateLogin = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('User not found');

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new Error('Invalid credentials');

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
};


const getAllUsers = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

const createUser = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
    );
    return result.rows[0];
};

const getAssociateByUser = async (user) => {
    const result = await pool.query('select * from associates a join user_associate ua on ua.associate_id = a.id where ua.user_id = $1', [user]);
    return result.rows;
};

module.exports = { findUserByEmail, validateLogin, getAllUsers, createUser, getAssociateByUser };
