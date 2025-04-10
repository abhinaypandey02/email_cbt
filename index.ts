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


// createServer(options,app).listen(process.env.PORT);
