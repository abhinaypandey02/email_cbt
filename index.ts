import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'https';
import {handleEmail} from "./routes/email";
import {handleStripeCheckout} from "./routes/stripe-checkout";
import {handleStripeWebhook} from "./routes/stripe-webhook";
import * as fs from "node:fs";
import {handleVouchers} from "./routes/vouchers";
import './client'
import {handleWhatsapp} from "./client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const options = {
    key: fs.readFileSync(__dirname + '/private.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/certificate.crt', 'utf8'),
    ca: fs.readFileSync(__dirname + '/ca.ca-bundle', 'utf8')
};
const app = express()
app.use('/uploads',express.static('../cms/public/uploads'))
app.use(cors({
    origin: '*'
}))
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)
app.use(express.json())
app.post('/stripe-checkout', handleStripeCheckout)
app.post('/email', handleEmail)
app.post('/vouchers', handleVouchers)
app.post('/whatsapp', handleWhatsapp)


createServer(options,app).listen(process.env.PORT);
