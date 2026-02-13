import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

const openAiSErvice = async (message) => {
    try {
        const response = await client.chat.completions.create({
            messages: [{
                role: "system",
                content: PROMT
            },{
                role: "user",
                content: message
            }],
            model: "gpt-5-nano",
        })

        return response.choices[0].message.content;

    } catch (error) {
        console.error("Error al obtener respuesta de OpenAI:", error);
    }
}


export default openAiSErvice;


const PROMT = `
Actúa como un veterinario con experiencia. 
Responde usando frases cortas. 
Sé claro, directo y profesional. 
Usa lenguaje sencillo. 
Da recomendaciones prácticas. 
No escribas párrafos largos.
NO HAGAS MAS PREGUNTAS, SOLO RESPONDE A LA PREGUNTA DEL USUARIO.
`
