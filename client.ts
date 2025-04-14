import Whatsapp from 'whatsapp-web.js'

const queue = []

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

client.on('message',async msg => {
    if (msg.body.includes('form')&&msg.body.includes('https://')&&!msg.fromMe) {
        queue.push(msg);
        const i = queue.length;
        setTimeout(async ()=>{
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
            queue.splice(i, 1);
        },(queue.length+1)*5000);
    }
});
client.initialize()