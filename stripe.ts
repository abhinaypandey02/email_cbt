import { Stripe } from 'stripe'

let stripePromise: Stripe
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    })
  }
  return stripePromise
}
export default getStripe
