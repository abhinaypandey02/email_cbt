import Whatsapp from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal';

const queue = []
const threads = []

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

setInterval(async () => {
    const msg = queue.pop()
    if(msg){
        const data = await fetch('https://sociocube.com/api/handle-whatsapp',{
            method: 'POST',
            body: JSON.stringify({
                body: msg.body,
                author: msg.author,
                chat: msg.from
            }),
        })
        const res = await data.text()
        if(data.status===501) {
            console.error(res)
        } else {
            threads.push(res)
        }
    }
},30000)

setInterval(async () => {
    const msg = threads.pop()
    if(msg){
        const data = await fetch('https://sociocube.com/api/handle-threads?id='+msg)
        if(data.status===501) {
            const res = await data.text()
            console.error(res)
        }
    }
},60000*60)

client.on('message',async msg => {
    if (msg.body.includes('forms')&&msg.body.includes('https://')&&!msg.fromMe) {
        queue.push(msg);
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('ready', () => {
    console.log('ready')
});

client.initialize()