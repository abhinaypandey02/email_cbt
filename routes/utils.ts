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


export async function getGroqResponse<T>(system: string, message?: string) {
    const data = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: system,
                },
                ...(message
                    ? [
                        {
                            role: "user",
                            content: message,
                        },
                    ]
                    : []),
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: {
                type: "json_object",
            },
            stop: null,
        }),
    }).then(
        (response) =>
            response.json() as Promise<{
                choices?: { message?: { content?: string } }[];
            }>,
    );
    const json = data.choices?.[0]?.message?.content;
    if (!json) return null;
    try {
        return JSON.parse(json) as T;
    } catch (e) {
        return null;
    }
}

export async function getDeplaggedTweet(prompt:string, hashtag:string){
    const response = await getGroqResponse<{ data: string }>(`Deplag this tweet so that it doesn't look copied. Add the hashtag #${hashtag} after two linebreakds (\\n\\n). Use "\\n" for linebreaks. Return it in the json format {data:string}
    
${prompt}
    `);
    if (!response) return null
    return response.data;
}


export async function getGeneratedTweets(prompt:string,theme:string,hashtag:string, examplePosts:string[]){
    const response = await getGroqResponse<{ data: string[] }>(`${prompt}

Generate 10 meta threads post in a json format of {data:string[]}. Make sure it tries to engage the people to comment. The style should be casual, but do use grammar and decent punctuations like comma and strictly use "\\n" for breaking into new lines.
The theme of the post should be ${theme}.
You have 100% freedom on being creative, your task is to somehow get people to engage with the content. You can try any sort of strategy to get people to engage. 
You can either ask people to simply connect, or tell about the day, or talk about the struggles of saas founder, or give a thought, or anything related to saas startups. Make sure that all 10 posts are completely different style.
Use one emoji at max. Dont use - hyphens or dashes. Don't make it structured, just use \\n for new linebreaks.
Add the following hashtag after two new-lines (\\n\\n): #${hashtag}

Here are some example posts. Be inspired from them and make sure to write stuff like them.:

${examplePosts.map(post=>post.replaceAll('\n',`
`)).join(`
---
`)}

`);
    if (!response) return null
    return response.data;
}


export async function callIFTTTWebhook(content:string){
    const res = await fetch(
        "https://maker.ifttt.com/trigger/new_thread/json/with/key/kH6DXaAG31WS5vs77aFgLnNbxEUO-bQtljIsXR_X_bd",
        {
            method: "POST",
            body: JSON.stringify({
                content,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return res.ok
}