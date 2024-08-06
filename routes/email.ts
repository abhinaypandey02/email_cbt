import {RequestHandler} from "express";
import {Nodemailer} from "../email-transport";

export const handleEmail:RequestHandler=async (req, res) => {
    const data = req.body;
    if(!data.name||!data.email||!data.countryCode||!data.location||!data.phone||!data.message){
        res.sendStatus(400);
        return;
    }

    const text = `The following information has been received on the website form:\n
        Name: ${data.name}\n
        Email: ${data.email}\n
        Phone: ${data.countryCode} ${data.phone}\n
        Whatsapp: https://wa.me/${data.countryCode}${data.phone}\n
        Location: ${data.location}\n
        Subject: ${data.subject}\n
        Message: ${data.message}
    `
    const html = `<div><h1>The following information has been received on the website form:</h1><table style="font-size: 18px"><tr><td style="padding: 10px"><b>Name</b></td><td>${data.name}</td></tr><tr><td style="padding: 10px"><b>Email</b></td><td>${data.email}</td></tr><tr><td style="padding: 10px"><b>Phone</b></td><td>${data.countryCode} ${data.phone}</td></tr><tr><td style="padding: 10px"><b >Location</b></td><td>${data.location}</td></tr><tr><td style="padding: 10px"><b>Subject</b></td><td>${data.subject}</td></tr><tr><td style="padding: 10px"><b >Message</b></td><td>${data.message}</td></tr></table></div>`
    try{
        await Nodemailer.sendMail({
            from: '"Webmaster CBT Proxy" <webmaster@cbtproxy.com>',
            to: (data.cbt?"info@cbtproxy.com":"info@examremote.com"),
            subject: "Form Submission on CBT Proxy",
            text,
            html
        });
        res.sendStatus(200);
    } catch (e) {
        console.error(e)
        res.sendStatus(500);
    }

}