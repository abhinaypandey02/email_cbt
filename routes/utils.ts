import axios from "axios";

export async function getCoupon(id?:number){
    if(!id) return null;
    try{
        const {
            data: { data },
        } = await axios.get(process.env.GATSBY_STRAPI_LOCAL_ENDPOINT + ':1337/api/coupons/' + id)
        return data;
    } catch (e) {
        return null
    }
}