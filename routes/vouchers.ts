import {RequestHandler} from "express";
import axios from "axios";
import {Readable} from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import {ReadableStream} from "node:stream/web";

export const handleVouchers:RequestHandler=async (req,res)=>{
    const {data} = await axios.get(process.env.GATSBY_STRAPI_LOCAL_ENDPOINT+':1337/api/coupons?populate=image');
    return res.status(200).send(data)
}


function createGif(file: Readable, duration: number): Promise<Buffer | null> {
    return new Promise((resolve) => {
        const command = ffmpeg(file)
            .format("gif")
            .duration(duration)
            .fpsOutput(10)
            .complexFilter("scale=-1:360")
            .pipe();

        const _buf = Array<Uint8Array>();

        command.on("data", (chunk: Uint8Array) => _buf.push(chunk));
        command.on("end", () => {
            resolve(Buffer.concat(_buf));
        });
        command.on("error", () => {
            resolve(null);
        });
    });
}

async function getProperSizedGif(file: Readable) {

    for (let currentDuration = 8; currentDuration > 0; currentDuration /= 2) {
        // eslint-disable-next-line no-await-in-loop -- fu
        const gif = await createGif(file, currentDuration);
        if (gif) {
            const blob = new Blob([gif]);
            if (blob.size <= 5*1024*1024) return gif;
        }
    }
    return null;
}

export const handleFFMPEG:RequestHandler=async (req,res)=>{
    const body = req.body
    const data = await fetch(body.url).then(res=>res.blob());
    const gif = await getProperSizedGif(Readable.fromWeb(data.stream() as ReadableStream))
    return res.send(gif)
}