import {RequestHandler} from "express";
import * as fs from "node:fs";
import {callIFTTTWebhook, getDeplaggedTweet, getGeneratedTweets} from "./utils";
import path from "node:path";

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

export async function job(){
    flag=!flag
    const json = JSON.parse(fs.readFileSync(path.join(__dirname, '../queue.json')).toString()) as Queue;
    for(const person of json.personas){
        if(flag&&person.pendingLiked[0]){
            await callIFTTTWebhook(person.pendingLiked[0])
            person.pendingLiked.shift();
        } else {
            if (!person.pendingGenerated[0]){
                const generatedTweets = await getGeneratedTweets(person.prompt, person.theme, person.hashtags, person.examplePosts)
                person.pendingGenerated.push(...generatedTweets)
            }
            if (person.pendingGenerated[0]) {
                await callIFTTTWebhook(person.pendingGenerated[0])
                person.pendingGenerated.shift();
            }
        }
    }
    fs.writeFileSync(path.join(__dirname, '../queue.json'),JSON.stringify(json))

}

export const handleLike:RequestHandler=async (req,res)=>{
    const newTweet = req.body;
    if(!newTweet)res.sendStatus(400)
    const json = JSON.parse(fs.readFileSync(path.join(__dirname, '../queue.json')).toString()) as Queue;
    for(const person of json.personas){
        if(person.repostLiked){
            const res = await getDeplaggedTweet(newTweet)
            if(res){
                person.pendingLiked.push(res)
            }
        }
    }
    fs.writeFileSync(path.join(__dirname, '../queue.json'),JSON.stringify(json))
    res.sendStatus(200)
}