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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const options = {
    key: fs.readFileSync(__dirname + '/private.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/certificate.crt', 'utf8')
};
const app = express()
app.use(express.json())
app.use(cors({
    origin: '*'
}))
app.post('/stripe-checkout', handleStripeCheckout)
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)
app.post('/email', handleEmail)
createServer(options,app).listen(process.env.PORT);
