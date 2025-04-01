import {RequestHandler} from "express";
import * as fs from "node:fs";
import {callIFTTTWebhook, getDeplaggedTweet, getGeneratedTweets} from "./utils";
import path from "node:path";
import { fileURLToPath } from 'url';
import {dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let flag=false;

interface Queue{personas:{
        webhook:string,
        repostLiked:boolean,
        prompt:string,
        theme:string,
        pendingLiked:string[]
        pendingGenerated:string[]
        examplePosts:string[]
        hashtags:string[]
    }[]}

function updateQueue(fn:(queue:Queue)=>Promise<Queue>){
    const queue = JSON.parse(fs.readFileSync(path.join(__dirname, '../queue.json')).toString()) as Queue;
    fn(queue).then((queue)=>{
        fs.writeFileSync(path.join(__dirname, '../queue.json'),JSON.stringify(queue, undefined, 2))
    });
}

export async function job(){
    flag=!flag
    updateQueue(async queue=>{
        for(const person of queue.personas){
            if(flag&&person.pendingLiked[0]){
                await callIFTTTWebhook(person.pendingLiked[0])
                person.pendingLiked.shift();
            } else {
                if (!person.pendingGenerated[0]){
                    const generatedTweets = await getGeneratedTweets(person.prompt, person.theme, person.hashtags, person.examplePosts)
                    if(generatedTweets) person.pendingGenerated.push(...generatedTweets)
                }
                if (person.pendingGenerated[0]) {
                    await callIFTTTWebhook(person.pendingGenerated[0])
                    person.pendingGenerated.shift();
                }
            }
        }
        return queue;
    })
}

export const handleLike:RequestHandler=async (req,res)=>{
    const newTweet = req.body;
    if(!newTweet)res.sendStatus(400)
    updateQueue(async queue=>{
        for(const person of queue.personas){
            if(person.repostLiked){
                const res = await getDeplaggedTweet(newTweet)
                if(res){
                    person.pendingLiked.push(res)
                }
            }
        }
        return queue;
    })
    res.sendStatus(200)
}