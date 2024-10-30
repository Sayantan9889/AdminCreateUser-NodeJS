const bcrypt = require("bcryptjs");
const jsonwebtoken = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        return hashPassword;
    } catch (error) {
        console.error("error: ", error);
        throw new Error("Something went wrong while hashing your password!");
    }
}

const verifyPasswords = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("error: ", error);
        throw new Error("Something went wrong while verifing your password!");
    }
}

const tokenGenerator = async (userData) => {
    try {
        const token = jsonwebtoken.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
        return token;
    } catch (error) {
        console.error("error: ", error);
    }
}

const transporter = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });
        return transporter;
    } catch (error) {
        console.error("error: ", error);
        throw new Error("Something went wrong while setting up email transporter!");

    }
}

const sendEmailVerificationLink = async (req, res, mailOptions) => {
    try {
        const _transporter = await transporter();
        _transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("error: ", error);
        throw new Error("Something went wrong while sending email verification link!");
    }
}

module.exports = {
    hashPassword,
    verifyPasswords,
    tokenGenerator,
    transporter,
    sendEmailVerificationLink,
}