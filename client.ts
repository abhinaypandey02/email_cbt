import Whatsapp, {Channel} from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal';

const queue = []

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

let IndiaChannel:Channel, GlobalChannel:Channel;

setInterval(async () => {
    const msg = queue.pop()
    const data = await fetch('https://sociocube.com/api/handle-whatsapp',{
        method: 'POST',
        body: msg || "{}",
    })
    const { nextPost, error } = await data.json()

    if(data.status===200) {
        await IndiaChannel.sendMessage(nextPost)
        if(!nextPost.includes('India')){
            await GlobalChannel.sendMessage(nextPost)
        }
    } else {
        console.error(error)
    }
},60000*2)

setInterval(() => {
    fetch('https://sociocube.com/api/handle-threads')
},60000*60)

client.on('message',async msg => {
    if (msg.body.includes('forms')&&msg.body.includes('https://')&&!msg.fromMe) {
        queue.push(msg.body);
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('ready', async () => {
    IndiaChannel = await client.getChannelByInviteCode('0029VaywINd9WtByQLkio206');
    GlobalChannel = await client.getChannelByInviteCode('0029VbAfFEdJZg444GK17n1M');

    console.log('ready')
});

client.initialize()