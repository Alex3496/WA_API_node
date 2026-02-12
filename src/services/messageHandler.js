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
                await this.sendWelcomeMenu(from);
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

    /**
     * @description Envía un mensaje de bienvenida al usuario personalizando el saludo.
     * @param {string} to - Número de teléfono del destinatario.
     * @param {string} messageId - ID del mensaje original.
     * @param {Object} sernderInfo - Información del remitente del mensaje.
     */
    async sendWelcomeMessage(to, messageId, sernderInfo) {
        const name = getSenderName(sernderInfo);
        const welcomeMessage = `¡Hola ${name}! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?`;
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
    }

    async sendWelcomeMenu(to){
        const menuMessage = "Elige una opción"
        const buttons = [
            {
                type: "reply",
                reply: {
                    id: "option_1",
                    title: "Agendar una cita"
                },
            },{
                type: "reply",
                reply: {
                    id: "option_2",
                    title: "Consultar"
                },
            },{
                type: "reply",
                reply: {
                    id: "option_3",
                    title: "Ubicación"
                },
            }
        ]

        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }
}

export default new MessageHandler();
