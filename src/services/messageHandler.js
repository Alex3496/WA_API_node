import config from "../config/env.js";
import whatsappService from "./whatsappService.js";

class MessageHandler {

    /**
     * @description Maneja los mensajes entrantes.
     * @param {Object} message - El mensaje entrante de WhatsApp.
     */
    async handleIncomingMessage(message) {
        if (message?.type === "text") {
            const response = `Echo: ${message.text.body}`;
            await whatsappService.sendMessage(
                config.TO_WHATSAPP_NUMBER,
                response,
                message.id,
            );
            await whatsappService.markAsRead(message.id);
        }
    }
}

export default new MessageHandler();
