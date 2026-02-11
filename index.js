require('dotenv').config();

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


/**
 * @function sendTemplateMessage
 * @description Envia un mensaje de plantilla a un número de WhatsApp utilizando la API de WhatsApp Business.
 * Es la unica manera de enviar mensajes sin que el usuario haya iniciado una conversación.
 */
async function sendTemplateMessage() {
    const response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            'messaging_product': 'whatsapp',
            'to': `${process.env.TO_WHATSAPP_NUMBER}`,
            'type': 'template',
            'template': {
                name: 'hello_world',
                language:{
                    code: 'en_US'
                }
            }
        })
    });


    console.log('Message sent:',require('util').inspect(response.data, {depth: null}));
}

/**
 * @function sendTemplateMessageWithComponents
 * @description Envia un mensaje de plantilla con componentes a un número de WhatsApp utilizando la API de WhatsApp Business.
 * Es la unica manera de enviar mensajes sin que el usuario haya iniciado una conversación.
 */
async function sendTemplateMessageWithComponents() {
    const response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            'messaging_product': 'whatsapp',
            'to': `${process.env.TO_WHATSAPP_NUMBER}`,
            'type': 'template',
            'template': {
                name: 'order_created',
                language:{
                    code: 'en_US'
                }
            },
            components: [
                {
                    type: 'header',
                    parameters: [
                        {
                            type: 'text',
                            text: "Erick Doe"
                        }
                    ]
                },
                {
                    type: 'body',
                    parameters: [
                        {
                            type: 'text',
                            text: "Erick Johnson"
                        },
                        {
                            type: 'text',
                            text: "FC-12345"
                        }
                    ]
                }
            ]
        })
    });


    console.log('Message sent:',require('util').inspect(response.data, {depth: null}));
}

/**
 * @function sentTextMessage
 * @description Envía un mensaje de texto a un número de WhatsApp utilizando la API de WhatsApp Business.
 * Solo se puede enviar mensajes a números que hayan iniciado una conversación previamente y el cliente haya respondido
 * en las últimas 24 horas.
 */
async function sentTextMessage(params) {

    const response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            'messaging_product': 'whatsapp',
            'to': `${process.env.TO_WHATSAPP_NUMBER}`,
            'type': 'text',
            'text': {
                'body': 'Hello, this is a text message from WhatsApp Business API'
            }
        })
    });

    //status
    console.log('Status:', response.status);
    console.log('Message sent:',require('util').inspect(response.data, {depth: null}));
}

/**
 * 
 * @function sentMediaMessage
 * @description Envía un mensaje de medios (imagen) a un número de WhatsApp utilizando la API de WhatsApp Business.
 * Solo se puede enviar mensajes a números que hayan iniciado una conversación previamente y el cliente haya respondido
 * en las últimas 24 horas. 
 */
async function sentMediaMessage(params) {

    const response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            'messaging_product': 'whatsapp',
            'to': `${process.env.TO_WHATSAPP_NUMBER}`,
            'type': 'image',
            'image': {
                //'link': 'https://dummyimage.com/600x400/000/fff.png&text=imagen+dinamica',
                'id': '1396187478808404',
                'caption': 'This is an image caption',
            }
        })
    });
}

/**
 * 
 * @function uploadImage
 * @description Sube una imagen a la API de WhatsApp Business y obtiene un ID de medios que se puede usar para enviar mensajes de medios.
 * @return {string} mediaId - El ID del medio subido.
 */
async function uploadImageToAPIWS() {

    const data = new FormData();
    data.append('file', fs.createReadStream('./images/leon.png'), { contentType: 'image/png' });
    data.append('type', 'image/png');
    data.append('messaging_product', 'whatsapp');


    const response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.PHONE_NUMBER_ID}/media`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        },
        data: data
    });

    console.log('Media uploaded:',require('util').inspect(response.data, {depth: null}));
    //Media uploaded: { id: '1396187478808404' }

    return response.data.id;

}


async function getTemplates(params) {
    const  response = await axios({
        url: `${process.env.APP_WHATSAPP_API_URL}/${process.env.APP_WHATSAPP_BUSINESS_ID}/message_templates`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.APP_WHATSAPP_TOKEN}`
        }
    });

    console.log('Templates:',require('util').inspect(response.data, {depth: null}));
}



try{
    getTemplates();
}catch(e){
    console.error('Error sending message:', e.response ? e.response.data : e.message);
}
