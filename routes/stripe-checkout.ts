import {RequestHandler} from "express";
import axios from "axios";
import getStripe from "../stripe";
import {getCoupon} from "./utils";

export const handleStripeCheckout:RequestHandler=async (req,res)=>{
    const data = req.body
    if (!data.couponID) return res.status(400).send({})
    const couponResData = await getCoupon(data.couponID)
    if (couponResData.id !== data.couponID) return res.status(404).send({})
    if (couponResData.attributes.count < 1) return res.status(400).send({})
    const image = couponResData.attributes.image?.data?.attributes.formats?.thumbnail?.url
    const coupon = couponResData.attributes
    const payment = getStripe()
    const checkout = await payment.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    unit_amount: coupon.finalPrice * 100,
                    product_data: {
                        name: 'Coupon for ' + coupon.examCode,
                        images: image ? [process.env.GATSBY_STRAPI_LIVE_ENDPOINT + ':1337' + image] : [],
                        description: coupon.validCountries,
                    },
                    currency: 'USD',
                },
                quantity: 1,
            },
        ],
        consent_collection:{
          terms_of_service:'required',  
        },
        custom_text:{
            terms_of_service_acceptance:{
                message: "IMPORTANT: After purchase, you will receive your exam voucher via email within one business day. The voucher will be sent to the email you specify at the time of purchase. please do register for your exam right after receiving the voucher number. You may reschedule your exam prior to the expiration date as long as you follow the voucher vendor's regulation.",
            },
        },
        metadata: {
            couponID: couponResData.id,
            test: "TEST"
        },
        invoice_creation: {
            enabled: true,
        },
        mode: 'payment',
        success_url: 'https://cbtproxy.com',
    })
    return res.status(200).json({ url: checkout.url })
}
