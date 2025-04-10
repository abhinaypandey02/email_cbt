import Whatsapp from 'whatsapp-web.js'

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

client.on('message', msg => {
    if (msg.body.includes('form')&&msg.body.includes('https://')) {
        fetch('https://sociocube.com/api/handle-whatsapp')
    }
});
client.initialize()