const pool = require('../db');
const { comparePassword, hashPassword } = require('../helpers/hash');

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log("Result", result);
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
    // const result = await pool.query('SELECT * FROM users');
    const result = await pool.query(`SELECT u.*, string_agg(a.id::text, ' | ' ORDER BY a.id) AS associates FROM users u LEFT JOIN user_associate ua ON ua.user_id = u.id LEFT JOIN associates a ON a.id = ua.associate_id GROUP BY u.id`);
    return result.rows;
};

const createUser = async (name, email, password, active) => {

    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
        'INSERT INTO users (name, email, password,active) VALUES ($1, $2, $3,$4) RETURNING *',
        [name, email, hashedPassword,active]
    );
    return result.rows[0];
};

const registerUser = async (name, email, type, associates, randomPassword, active) => {

    console.log("Ative", active);
    const hashedPassword = await hashPassword(randomPassword);
    const result = await pool.query(
        'INSERT INTO users (name, email, password, type, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, hashedPassword, type, active]
    );
    if (type == 2) {
        for (let i = 0; i < associates.length; i++) {
            const associate = associates[i];
            const responseUserAssociate = await pool.query(
                'INSERT INTO user_associate (user_id, associate_id, role) VALUES ($1, $2, $3)',
                [result.rows[0].id, associate, type]
            );
            console.log("User Associate", responseUserAssociate);
        };
    };
    return result.rows[0];
};

const updateUser = async (id, name, email, type, associates, active) => {
    console.log(`Active ${active}`);
    const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, type = $3, active = $5 WHERE id = $4 RETURNING *',
        [name, email, type, id, active]
    );
    if (type == 2) {
        await pool.query(
            'DELETE FROM user_associate WHERE user_id = $1',
            [id]
        );
        for (let i = 0; i < associates.length; i++) {
            const associate = associates[i];
            const responseUserAssociate = await pool.query(
                'INSERT INTO user_associate (user_id, associate_id, role) VALUES ($1, $2, $3)',
                [id, associate, type]
            );
            console.log("User Associate", responseUserAssociate);
        };
    };
    return result.rows[0];
};

const getAssociateByUser = async (req) => {
    const { user } = req;
    const { user_id } = req.params;


    if (user_id != "null" && user_id != null) {
        const result = await pool.query(`select *, '0' as "numberofproducts", 0.0 as "totalvalue"  from associates a join user_associate ua on ua.associate_id = a.id where ua.user_id = $1`, [user_id]);
        return result.rows;
    } else if (user.type == 2) {
        const result = await pool.query('select * from associates a join user_associate ua on ua.associate_id = a.id where ua.user_id = $1', [user.id]);
        return result.rows;
    } else {
        const result = await pool.query(`select *, '0' as "numberofproducts", 0.0 as "totalvalue" from associates`);
        return result.rows;
    }
};

module.exports = { findUserByEmail, validateLogin, getAllUsers, createUser, getAssociateByUser, registerUser, updateUser };
