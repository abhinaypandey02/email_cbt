import {RequestHandler} from "express";
import {Readable} from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import {ReadableStream} from "node:stream/web";

export const handleVouchers:RequestHandler=async (req,res)=>{
    const body = req.body
    const data = await fetch(body.url).then(res=>res.blob());
    const gif = await getProperSizedGif(Readable.fromWeb(data.stream() as ReadableStream))
    res.sendStatus(200)
    await fetch(body.uploadURL, {
        method: "PUT",
        body: gif,
    });

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
            if (blob.size <= 5*1024*1024) return blob;
        }
    }
    return null;
}