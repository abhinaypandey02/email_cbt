import {RequestHandler} from "express";
import axios from "axios";
import getStripe from "../stripe";
import {Nodemailer} from "../email-transport";

export const handleStripeWebhook:RequestHandler=async (req,res)=>{
    const payload = req.body
    const sig = req.headers['stripe-signature']
    let event

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (sig) {
        try {
            const payment = getStripe()
            event = payment.webhooks.constructEvent(payload, sig, endpointSecret)
        } catch (error) {
            console.error(error)
            return res.status(400).send({})
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkoutSessionCompleted = event.data.object as any
                const { couponID } = checkoutSessionCompleted.metadata
                const {
                    data: { data: couponResData },
                } = await axios.get(process.env.GATSBY_STRAPI_LOCAL_ENDPOINT + ':1337/api/coupons/' + couponID)
                const text = `The following coupon has been purchased :\n
        COUPON ID: ${couponResData.attributes.couponID}
    `
                try{
                    await Nodemailer.sendMail({
                        from: '"Webmaster CBT Proxy" <webmaster@cbtproxy.com>',
                        to: "info@examremote.com",
                        subject: "Coupon purchased on CBT Proxy",
                        text,
                    });

                    await Nodemailer.sendMail({
                        from: '"Webmaster CBT Proxy" <webmaster@cbtproxy.com>',
                        to: checkoutSessionCompleted.customer_details.email,
                        subject: "Coupon purchased on CBT Proxy",
                        text,
                    });
                    res.sendStatus(200);
                } catch (e) {
                    console.error(e)
                    res.sendStatus(500);
                }
                break
            }
        }
        return res.status(200).send({})
    }
    return res.status(400).send({})
}