import config from "../config/env.js";
import whatsappService from "./whatsappService.js";

//utils
import { normalizeWhatsappNumber, isGreeting, getSenderName } from "../utils.js";

class MessageHandler {

    /**
     * @description Maneja los mensajes entrantes.
     * @param {Object} message - El mensaje entrante de WhatsApp.
     * @param {Object} sernderInfo - Información del remitente del mensaje.
     */
    async handleIncomingMessage(message, sernderInfo) {

        // Quita el prefijo "521" para números mexicanos, si es necesario
        const from = normalizeWhatsappNumber(message.from);

        if (message?.type === "text") {

            const incomingText = message.text.body.trim().toLowerCase();

            if(isGreeting(incomingText)) {
                await this.sendWelcomeMessage(from, message.id, sernderInfo);
                return;
            }else{
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(
                    from,
                    response,
                    message.id,
                );
            }
            await whatsappService.markAsRead(message.id);
        }
    }

    async sendWelcomeMessage(to, messageId, sernderInfo) {

        const name = getSenderName(sernderInfo);

        const welcomeMessage = `¡Hola ${name}! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?`;
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
    }
}

export default new MessageHandler();
