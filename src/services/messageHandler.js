import config from "../config/env.js";
import whatsappService from "./whatsappService.js";

//utils
import { normalizeWhatsappNumber, isGreeting, getSenderName } from "../utils.js";

class MessageHandler {

    constructor() {
        this.appoinmentsState = {}; // Almacena el estado de las citas para cada usuario
    }

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
            }else if (incomingText.includes("media")) {
                await this.sendMedia(from);
            } else if (this.appoinmentsState[from]) {
                await this.handleAppointmentFlow(from, incomingText);
            } else {
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(
                    from,
                    response,
                    message.id,
                );
            }
            await whatsappService.markAsRead(message.id);
        }else if (  message?.type === "interactive" && message.interactive.type === "button_reply") {
            console.log("Received button reply:", JSON.stringify(message, null, 2));
            const option = message?.interactive?.button_reply?.title?.toLowerCase().trim() || "";
            await this.handleMenuOption(from, option);
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

    /**
     * @description Envia un menú de opciones al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     */
    async sendWelcomeMenu(to){
        const menuMessage = "Elige una opción"
        const buttons = [
            {
                type: "reply",
                reply: {
                    id: "agendar_cita",
                    title: "Agendar una cita"
                },
            },{
                type: "reply",
                reply: {
                    id: "consultar",
                    title: "Consultar"
                },
            },{
                type: "reply",
                reply: {
                    id: "ubicacion",
                    title: "Ubicación"
                },
            }
        ]

        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }

    /**
     * @description Envía una respuesta basada en la opción seleccionada por el usuario en el menú interactivo.
     * @param {string} to - Número de teléfono del destinatario. 
     * @param {string} option - Opción seleccionada por el usuario.
     */
    async handleMenuOption(to, option){
        let response = "";
        switch(option){
            case "agendar una cita":
                this.appoinmentsState[to] = { step: "name" }; // Inicia el flujo de agendar cita
                response = "Por supuesto, para agendar una cita, primero necesito saber tu nombre. ¿Cuál es tu nombre?";
                break;
            case "consultar":
                response = "Para consultas, por favor llama a nuestro número de atención al cliente: +52 55 1234 5678";
                break;
            case "ubicación":
                response = "Nuestra ubicación es: Calle Falsa 123, Ciudad, País.";
                break;
            default:
                response = "Lo siento, no entendí tu selección. Por favor elige una opción del menú.";
        }
        await whatsappService.sendMessage(to, response);
    }

    /**
     * @description Envía un mensaje de medios al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     */
    async sendMedia(to){
        let mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
        let caption = "Bienvenida";
        let type = "audio";

        await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
    }

    async handleAppointmentFlow(to, message){
        
        const state = this.appoinmentsState[to];
        let response = "";

        switch(state.step){
            case "name":
                state.name = message.trim();
                state.step = "petName";
                response = "¿Cuál es el nombre de tu mascota?";
                break;
            case "petName":
                state.petName = message.trim();
                state.step = "petType";
                response = `Perfecto ${state.name}, ¿qué tipo de mascota tienes?`;
                break;
            case "petType":
                state.petType = message.trim();
                state.step = "reason";
                response = `Entendido, tienes un ${state.petType}. Por último, ¿cuál es el motivo de la cita?`;
                break;
            case "reason":
                state.reason = message.trim();
                response = this.completeAppointment(to);
                break;
             default:
                response = "Lo siento, ocurrió un error en el proceso de agendar la cita. Por favor intenta de nuevo.";
                 delete this.appoinmentsState[to]; // Limpia el estado en caso de error
            
        }

        await whatsappService.sendMessage(to, response);
    }


    completeAppointment(to){
        const appoinment = this.appoinmentsState[to];
        delete this.appoinmentsState[to]; // Limpia el estado de la cita

        const userData = {
            to,
            name: appoinment.name,
            petName: appoinment.petName,
            petType: appoinment.petType,
            reason: appoinment.reason,
            date: new Date().toISOString()
        }

        console.log("Cita agendada:", userData);

        return `Gracias por la información, ${appoinment.name}.
        
        Hemos registrado tu cita para tu ${appoinment.petType} por el motivo: "${appoinment.reason}". 
        Nos pondremos en contacto contigo para confirmar la fecha y hora.`;
    }
}

export default new MessageHandler();
