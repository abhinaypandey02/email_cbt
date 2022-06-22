import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';
const app = express()
app.use(express.json())
app.use(cors({
    origin: '*'
}))
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "webmaster@cbtproxy.com", // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
});
app.post('/email', async (req, res) => {
    const data = req.body;
    if(!data.name||!data.email||!data.countryCode||!data.location||!data.phone||!data.subject||!data.message){
        res.sendStatus(400);
        return;
    }

    const text = `The following information has been received on the website form:\n
        Name: ${data.name}\n
        Email: ${data.email}\n
        Phone: ${data.countryCode} ${data.phone}\n
        Location: ${data.location}\n
        Subject: ${data.subject}\n
        Message: ${data.message}
    `
    const html = `<div><h1>The following information has been received on the website form:</h1><table style="font-size: 18px"><tr><td style="padding: 10px"><b>Name</b></td><td>${data.name}</td></tr><tr><td style="padding: 10px"><b>Email</b></td><td>${data.email}</td></tr><tr><td style="padding: 10px"><b>Phone</b></td><td>${data.countryCode} ${data.phone}</td></tr><tr><td style="padding: 10px"><b >Location</b></td><td>${data.location}</td></tr><tr><td style="padding: 10px"><b>Subject</b></td><td>${data.subject}</td></tr><tr><td style="padding: 10px"><b >Message</b></td><td>${data.message}</td></tr></table></div>`
    try{
        await transporter.sendMail({
            from: '"Webmaster CBT Proxy" <webmaster@cbtproxy.com>',
            to: "info@examremote.com",
            subject: "Form Submission on CBT Proxy",
            text,
            html
        });
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }

})
app.listen(process.env.PORT)
