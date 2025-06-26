import Whatsapp from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal';

const queue = []

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
        if(data.status===501) {
            const res = await data.text()
            await client.sendMessage("919811954465@c.us", res)
        }
    }
},30000)

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
client.initialize().then(()=>{
    console.log('init')
})