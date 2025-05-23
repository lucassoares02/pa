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

const registerUser = async (name, email, type, associates) => {

    // generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const result = await pool.query(
        'INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, randomPassword, type]
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

const updateUser = async (id, name, email, type, associates) => {
    const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, type = $3 WHERE id = $4 RETURNING *',
        [name, email, type, id]
    );
    console.log("Type", type);
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

    console.log("user_id", user_id);

    if (user_id != "null" && user_id != null) {
        console.log("STEP 1")
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
