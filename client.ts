import Whatsapp from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal';
import * as fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "url";
import {RequestHandler} from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize().catch(err => {
    fs.rmSync(path.join(__dirname, '.wwebjs_auth'), { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, '.wwebjs_cache'), { recursive: true, force: true });
    client.resetState()
});


export const handleWhatsapp:RequestHandler=async (req,res)=>{
    const body = req.body
    const channel = await client.getChannelByInviteCode(body.channel)
    await channel.sendMessage(body.message)
    return res.sendStatus(200)
}

