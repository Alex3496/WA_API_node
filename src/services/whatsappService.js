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
    async sendMessage(to, body, messageId) {
        console.log(`Sending message to ${to}: ${body}`);
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
                    context: {
                        message_id: messageId,
                    },
                },
            });
        } catch (error) {
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
}

export default new WhatsAppService();
