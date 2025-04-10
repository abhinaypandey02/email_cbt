import Whatsapp from 'whatsapp-web.js'

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

client.on('message',async msg => {
    if (msg.body.includes('form')&&msg.body.includes('https://')&&!msg.fromMe) {
        const data = await fetch('https://sociocube.com/api/handle-whatsapp',{
            method: 'POST',
            body: JSON.stringify({
                body: msg.body,
                author: msg.author,
                chat: msg.from
            }),
        })
        const res = await data.text()
        if(res) await client.sendMessage("919811954465@c.us",res)

    }
});
client.initialize()