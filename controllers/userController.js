const pool = require('../db');
const userService = require('../services/userService');
const { sendEmailSmtp } = require('../services/mailerService');
const { templateHtml } = require('./template_html.js');

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
    const { id, name, email, type, associates, link, active } = req.body;
    const password = req.body.password || null;
    try {
        if (id != null && id != "null") {
            const result = await userService.updateUser(id, name, email, type, associates, active);
            res.status(200).json(result);
        } else {
            if (password != null) {
                const result = await userService.createUser(name, email, password, active);
                res.status(201).json(result);
            } else {
                const randomPassword = Math.random().toString(36).slice(-8);
                const result = await userService.registerUser(name, email, type, associates, randomPassword, active);
                // const html = "<div><span>Olá @name, segue acesso a plataforma do associados.<br><br>Link: <a href='@link'>@link</a><br>E-mail: @email<br>Senha: @password<br>Atenciosamente - Equipe Multishow.</span></div>";
                const html = templateHtml;
                const replaceHtml = html.replaceAll("@name", name).replaceAll("@email", email).replaceAll("@password", randomPassword).replaceAll("@link", link);

                await sendEmailSmtp(`"Portal Associados" <${process.env.MAIL_FROM}>`, email, "Cadastro de Usuário", "Seu cadastro foi realizado com sucesso", replaceHtml);

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
