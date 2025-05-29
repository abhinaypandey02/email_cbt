import Whatsapp from 'whatsapp-web.js'

const queue = []

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

setInterval(async () => {
    const msg = queue.pop()
    if(msg){
        await fetch('https://sociocube.com/api/handle-whatsapp',{
            method: 'POST',
            body: JSON.stringify({
                body: msg.body,
                author: msg.author,
                chat: msg.from
            }),
        })
        // const res = await data.text()
        // if(res) await client.sendMessage("919811954465@c.us",res)
    }
},30000)

client.on('message',async msg => {
    console.log(msg.body)
    if (msg.body.includes('forms')&&msg.body.includes('https://')&&!msg.fromMe) {
        queue.push(msg);
    }
});
client.initialize()