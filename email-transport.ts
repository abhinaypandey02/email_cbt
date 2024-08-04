import nodemailer from 'nodemailer';
export const Nodemailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "webmaster@cbtproxy.com", // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
});