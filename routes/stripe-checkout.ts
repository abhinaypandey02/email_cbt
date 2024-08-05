import {RequestHandler} from "express";
import axios from "axios";
import getStripe from "../stripe";

export const handleStripeCheckout:RequestHandler=async (req,res)=>{
    const data = req.body
    if (!data.couponID) return res.status(400).send({})
    const {
        data: { data: couponResData },
    } = await axios.get(
        process.env.GATSBY_STRAPI_LOCAL_ENDPOINT + ':1337/api/coupons/' + data.couponID + '?populate=image'
    )
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
        metadata: {
            couponID: couponResData.id,
        },
        invoice_creation: {
            enabled: true,
        },
        mode: 'payment',
        success_url: 'https://cbtproxy.com',
    })
    return res.status(200).json({ url: checkout.url })
}