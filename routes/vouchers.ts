import {RequestHandler} from "express";
import axios from "axios";

export const handleStripeWebhook:RequestHandler=async (req,res)=>{
    const {data} = await axios.get(process.env.GATSBY_STRAPI_ENDPOINT+':1337/api/vouchers');
    return res.status(200).send(data)
}