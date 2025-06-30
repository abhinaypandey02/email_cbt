import Whatsapp, {Channel} from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal';

const queue = []
const threads:string[] = []

const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.LocalAuth()
});

let IndiaChannel:Channel, GlobalChannel:Channel;

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

        if(data.status===200) {
            threads.push(res)
            await IndiaChannel.sendMessage(res)
            if(!res.includes('India')){
                await GlobalChannel.sendMessage(res)
            }
        } else {
            console.error(res)
        }
    }
},30000)

setInterval(async () => {
    const msg = threads.pop()
    if(msg){
        const data = await fetch('https://sociocube.com/api/handle-threads',{
            method: 'POST',
            body:JSON.stringify({
                thread:[
                    msg.split('\n').slice(0,-1).join('\n'),
                    msg.split('\n').at(-1),
                ],
                token: "dsfjbn13r4tdnlnjkfj1243vdfbjkn123r4ebfjsdfvef"
            }),
        })
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
client.on('ready', async () => {
    IndiaChannel = await client.getChannelByInviteCode('0029VaywINd9WtByQLkio206');
    GlobalChannel = await client.getChannelByInviteCode('0029VbAfFEdJZg444GK17n1M');

    console.log('ready')
});

client.initialize()