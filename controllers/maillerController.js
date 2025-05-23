
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pool = require('../db');
const { hashPassword } = require('../helpers/hash');

dotenv.config(); // carrega variáveis de .env

/**
 * Envia um e-mail.
 *
 * @param {string|string[]} to     Destinatário(s). Pode ser string ou array de strings.
 * @param {string}          subject Assunto do e-mail.
 * @param {string}          html    Conteúdo HTML do e-mail.
 * @param {string}          [text]  Conteúdo em texto puro (fallback).
 */
exports.sendEmail = async (req, res) => {

    const { id, subject, html, text, link } = req.body;


    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];

    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    //gerar senha aleatória de 8 caracteres
    const randomPassword = Math.random().toString(36).slice(-8);
    const decodedPassword = await hashPassword(randomPassword);
    await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
        [decodedPassword, id]
    );


    const replaceHtml = html.replaceAll("@name", user.name).replaceAll("@email", user.email).replaceAll("@password", randomPassword).replaceAll("@link", link);

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,       // ex: 'smtp.gmail.com'
        port: Number(process.env.MAIL_PORT) || 587,
        secure: process.env.MAIL_SECURE === 'true', // true se usar SSL/TLS na porta 465
        auth: {
            user: process.env.MAIL_USER,     // seu usuário SMTP
            pass: process.env.MAIL_PASS,     // sua senha SMTP ou token de app
        },
    });

    // 2) Verifica conexão (opcional)
    try {
        await transporter.verify();
        console.log('Conexão SMTP estabelecida com sucesso');
    } catch (err) {
        console.error('Erro ao verificar conexão SMTP:', err);
        return res.status(500).json({ error: err });
    }

    // 3) Envia o e-mail
    const info = await transporter.sendMail({
        from: `"Portal Associados" <${process.env.MAIL_FROM}>`, // remetente
        to: user.email,        // destinatário(s)
        subject,   // assunto
        text,      // texto puro
        html: replaceHtml,      // conteúdo HTML
    });

    console.log('E-mail enviado:', info.messageId);
    return res.status(200).json({ message: 'E-mail enviado com sucesso', messageId: info.messageId });
}
