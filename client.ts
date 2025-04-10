const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('message', msg => {
    if (msg.body.includes('form')&&msg.body.includes('https://')) {
        fetch('https://sociocube.com/api/handle-whatsapp')
    }
});

client.initialize();