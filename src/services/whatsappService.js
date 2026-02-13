import axios from "axios";
import config from "../config/env.js";

class WhatsAppService {
    /**
     * 
     * @description Envía un mensaje de texto a través de la API de WhatsApp.
     * @param {string} to - El número de teléfono del destinatario en formato internacional.
     * @param {string} body - El contenido del mensaje de texto a enviar.
     * @param {string} messageId - El ID del mensaje original al que se está respondiendo (opcional).
     */
    async sendMessage(to, body, messageId = null) {
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    text: { body },
                    context: messageId ? { message_id: messageId } : undefined,
                },
            });
        } catch (error) {
            console.log(error)
            console.error("Error sending message:", error.response?.data || error.message);
        }
    }

    /**
     * @description Marca un mensaje como leído a través de la API de WhatsApp.
     * @param {string} messageId - El ID del mensaje a marcar como leído.
     */
    async markAsRead(messageId) {
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                },
            });
        } catch (error) {
            console.error("Error marking message as read:", error.response?.data || error.message);
        }
    }

    /**
     * @description Envía un mensaje interactivo con botones a través de la API de WhatsApp.
     * @param {string} to - El número de teléfono del destinatario en formato internacional. 
     * @param {string} bodyText - El texto del cuerpo del mensaje interactivo.
     * @param {Array} buttons - Un array de botones interactivos.
     * Ejemplo de botón: { type: "reply", reply: { id: "button1", title: "Opción 1" } }
     */
    async sendInteractiveButtons(to, bodyText, buttons ) {
        try{
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type: "interactive",
                    interactive:{
                        type: "button",
                        body: { text: bodyText },
                        action: {
                            buttons: buttons
                        }
                    }
                },
            });
        }catch(error){
            console.error("Error sending interactive buttons:", error.response?.data || error.message);
        }
    }

    /**
     * @description Envía un mensaje de medios al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     * @param {string} type - Tipo de medio (image, video, audio, document).
     * @param {string} mediaURL - URL del medio.
     * @param {string} caption - Texto opcional para el medio.
     */
    async sendMediaMessage(to, type, mediaURL, caption = "") {
        try {
            const mediaObject = {}

            switch(type){
                case "image":
                    mediaObject.image = { link: mediaURL, caption };
                    break;
                case "video":
                    mediaObject.video = { link: mediaURL, caption };
                    break;
                case "audio":
                    mediaObject.audio = { link: mediaURL };
                    break;
                case "document":
                    mediaObject.document = { link: mediaURL, caption, filename: 'foo.pdf' };
                    break;
                default:
                    throw new Error("Unsupported media type");
            }

            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type,
                    ...mediaObject
                },
            });

        }catch(error){
            console.error("Error sending media message:", error.response?.data || error.message);
        }
    }

    /**
     * @description Envía un mensaje de contacto al usuario.
     * @param {string} to - Número de teléfono del destinatario. 
     * @param {Object} contactInfo - Información del contacto a enviar.
     */
    async sendContactMessage(to, contactInfo){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type: "contacts",
                    contacts: [contactInfo]
                },
            });

        }catch(error){
            console.error("Error sending contact message:", error.response?.data || error.message);
        }
    }

    /**
     * @description Envía un mensaje de ubicación al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     * @param {number} latitude - Latitud de la ubicación.
     * @param {number} longitude - Longitud de la ubicación.
     * @param {string} name - Nombre de la ubicación.
     * @param {string} address - Dirección de la ubicación.
     */
    async sendLocationMessage(to, latitude, longitude, name = "Ubicación", address = "Dirección no disponible"){
        try {
            const locationInfo = {
                latitude,
                longitude,
                name,
                address
            };
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.PHONE_NUMBER_ID}/messages`,
                headers: {
                    Authorization: `Bearer ${config.APP_WHATSAPP_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type: "location",
                    location: locationInfo
                },
            });

        }catch(error){
            console.error("Error sending location message:", error.response?.data || error.message);
        }
    }

}

export default new WhatsAppService();
