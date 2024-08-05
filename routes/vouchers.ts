import {RequestHandler} from "express";
import axios from "axios";

export const handleVouchers:RequestHandler=async (req,res)=>{
    const {data} = await axios.get(process.env.GATSBY_STRAPI_LOCAL_ENDPOINT+':1337/api/voucher');
    return res.status(200).send(data)
}