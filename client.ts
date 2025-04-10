import Whatsapp from 'whatsapp-web.js'

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

client.on('message', msg => {
    msg.
    if (msg.body.includes('form')&&msg.body.includes('https://')&&!msg.fromMe) {
        fetch('https://sociocube.com/api/handle-whatsapp',{
            method: 'POST',
            body: JSON.stringify({
                body: msg.body,
                author: msg.author,
                chat: msg.from
            }),
        })
    }
});
client.initialize()