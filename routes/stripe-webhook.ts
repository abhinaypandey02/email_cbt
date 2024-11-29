import {RequestHandler} from "express";
import axios from "axios";
import getStripe from "../stripe";
import {Nodemailer} from "../email-transport";
import {getCoupon} from "./utils";

export const handleStripeWebhook:RequestHandler=async (req,res)=>{
    const payload = req.body
    const sig = req.headers['stripe-signature']
    let event

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (sig) {
        const payment = getStripe()
        try {
            event = payment.webhooks.constructEvent(payload, sig, endpointSecret)
        } catch (error) {
            console.error(error)
            return res.status(400).send({})
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkoutSessionCompleted = event.data.object as any
                const { couponID } = checkoutSessionCompleted.metadata
                const couponResData = await getCoupon(couponID)
                if(!couponResData) {
                    await payment.refunds.create({
                        payment_intent: checkoutSessionCompleted.payment_intent
                    })
                    return res.sendStatus(204);
                }
                await axios.put(process.env.GATSBY_STRAPI_LOCAL_ENDPOINT + ':1337/api/coupons/' + couponID,{
                    "data":{
                        "count":couponResData.attributes.count-1
                    }
                },{
                    headers:{
                        "Authorization": `Bearer ${process.env.GATSBY_STRAPI_TOKEN}`
                    }
                })
                const text = `The following coupon has been purchased :\n
        COUPON ID: ${couponResData.attributes.couponID}
        EXAM ID: ${couponResData.attributes.examID}
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
                        subject: "Thank You for Your Purchase! Choose How to Apply Your Exam Voucher",
                        text:`
                            Dear ${checkoutSessionCompleted.customer_details.email},

                            Thank you for purchasing the ${couponResData.attributes.examCode} exam voucher with us! We’re thrilled to assist you in your certification journey.
                            
                            To ensure the best experience, please choose one of the following options for applying your voucher:
                            
                            Option 1 (Preferred): We Apply it For You, With a 100% Guarantee
                            For total peace of mind, you can grant us remote access, and we will apply the voucher and schedule your exam for a future date. This option comes with a 100% guarantee that your voucher will work. You can reschedule the exam later if needed.
                            
                            Option 2: Apply it Yourself, With No Guarantee
                            If you prefer to handle it yourself, we’ll send the voucher via email. Please note that this option is non-refundable. As the voucher is a non-tangible item, it cannot be refunded if it doesn't work.
                            
                            Please reply to this email with your preferred option, and we will proceed accordingly.
                            
                            Want to Pass Your Exam with a 100% Guarantee?
                            Don’t forget to check out our Proxy Exam Help service, where we offer a guaranteed pass with the option to pay after you succeed. Learn more here: Pass Your Exam with CBTProxy
                            
                            Thank you for choosing us for your exam preparation needs. We look forward to hearing from you soon!
                            
                            Best regards,  
                            Voucher Store
                            CBTProxy
                        `,
                        html:`
                            Dear ${checkoutSessionCompleted.customer_details.email},

                            Thank you for purchasing the ${couponResData.attributes.examCode} exam voucher with us! We’re thrilled to assist you in your certification journey.
                            
                            To ensure the best experience, please choose one of the following options for applying your voucher:
                            
                            <em>Option 1 (Preferred): We Apply it For You, With a 100% Guarantee</em>
                            For total peace of mind, you can grant us remote access, and we will apply the voucher and schedule your exam for a future date. This option comes with a 100% guarantee that your voucher will work. You can reschedule the exam later if needed.
                            
                            <em>Option 2: Apply it Yourself, With No Guarantee</em>
                            If you prefer to handle it yourself, we’ll send the voucher via email. Please note that this option is non-refundable. As the voucher is a non-tangible item, it cannot be refunded if it doesn't work.
                            
                            Please reply to this email with your preferred option, and we will proceed accordingly.
                            
                            <em>Want to Pass Your Exam with a 100% Guarantee?</em>
                            Don’t forget to check out our Proxy Exam Help service, where we offer a guaranteed pass with the option to pay after you succeed. Learn more here: <a href="https://cbtproxy.com/cbt-landing">Pass Your Exam with CBTProxy</a>
                            
                            Thank you for choosing us for your exam preparation needs. We look forward to hearing from you soon!
                            
                            Best regards,  
                            Voucher Store
                            CBTProxy
                        `,
                    });
                    return res.sendStatus(200);
                } catch (e) {
                    console.error(e)
                    return res.status(500).send({error: e});
                }
            }
        }
    }
    return res.sendStatus(500)
}