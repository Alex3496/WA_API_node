import config from "../config/env.js";
import whatsappService from "./whatsappService.js";
import googleSheetsService from "./googleSheetsService.js";
import openAiSErvice from "./openAiService.js";
//utils
import {
    normalizeWhatsappNumber,
    isGreeting,
    getSenderName,
} from "../utils.js";

class MessageHandler {
    constructor() {
        this.appoinmentsState = {}; // Almacena el estado de las citas para cada usuario
        this.assitandState = {};
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

            if (isGreeting(incomingText)) {
                await this.sendWelcomeMessage(from, message.id, sernderInfo);
                await this.sendWelcomeMenu(from);
                return;
            } else if (incomingText.includes("media")) {
                await this.sendMedia(from);
            } else if (this.appoinmentsState[from]) {
                await this.handleAppointmentFlow(from, incomingText);
            } else if (this.assitandState[from]) {
                await this.handleAssistantFlow(from, incomingText);
            } else {
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(from, response, message.id);
            }
            await whatsappService.markAsRead(message.id);
        } else if (
            message?.type === "interactive" &&
            message.interactive.type === "button_reply"
        ) {
            console.log(
                "Received button reply:",
                JSON.stringify(message, null, 2),
            );
            const option =
                message?.interactive?.button_reply?.title
                    ?.toLowerCase()
                    .trim() || "";
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
    async sendWelcomeMenu(to) {
        const menuMessage = "Elige una opción";
        const buttons = [
            {
                type: "reply",
                reply: {
                    id: "agendar_cita",
                    title: "Agendar una cita",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "consultar",
                    title: "Consultar",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "ubicacion",
                    title: "Ubicación",
                },
            },
        ];

        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }

    /**
     * @description Envía una respuesta basada en la opción seleccionada por el usuario en el menú interactivo.
     * @param {string} to - Número de teléfono del destinatario.
     * @param {string} option - Opción seleccionada por el usuario.
     */
    async handleMenuOption(to, option) {
        let response = "";
        switch (option) {
            case "agendar una cita":
                this.appoinmentsState[to] = { step: "name" }; // Inicia el flujo de agendar cita
                response =
                    "Por supuesto, para agendar una cita, primero necesito saber tu nombre. ¿Cuál es tu nombre?";
                break;
            case "consultar":
                this.assitandState[to] = { step: "question" }; // Inicia el flujo del asistente
                response =
                    "Hazme tu pregunta y te ayudaré con la información que necesites.";
                break;
            case "ubicación":
                response =
                    "Esta es nuestra ubicación. ¡Te esperamos!";
                await this.sendLocation(to);
                break;
            case "emergencia":
                response =
                    "Si estás enfrentando una emergencia, por favor llama inmediatamente a nuestro número de emergencia";
                    await this.sendContact(to);
                break;
            default:
                response =
                    "Lo siento, no entendí tu selección. Por favor elige una opción del menú.";
        }
        await whatsappService.sendMessage(to, response);
    }

    /**
     * @description Envía un mensaje de medios al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     */
    async sendMedia(to) {
        let mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
        let caption = "Bienvenida";
        let type = "audio";

        await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
    }

    /**
     * @description Maneja el flujo de agendar una cita.
     * @param {string} to - Número de teléfono del destinatario.
     * @param {string} message - Mensaje recibido del usuario.
     */
    async handleAppointmentFlow(to, message) {
        const state = this.appoinmentsState[to];
        let response = "";

        switch (state.step) {
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
                response =
                    "Lo siento, ocurrió un error en el proceso de agendar la cita. Por favor intenta de nuevo.";
                delete this.appoinmentsState[to]; // Limpia el estado en caso de error
        }

        await whatsappService.sendMessage(to, response);
    }

    /**
     * @description Completa el proceso de agendar una cita, guarda la información
     * en google sheets y envía un mensaje de confirmación al usuario.
     * @param {string} to - Número de teléfono del destinatario.
     * @returns {string} - Mensaje de confirmación de la cita.
     */
    async completeAppointment(to) {
        const appoinment = this.appoinmentsState[to];
        delete this.appoinmentsState[to]; // Limpia el estado de la cita

        const userData = {
            to,
            name: appoinment.name,
            petName: appoinment.petName,
            petType: appoinment.petType,
            reason: appoinment.reason,
            date: new Date().toISOString(),
        };

        console.log("Cita agendada:", userData);
        googleSheetsService.appendToSheet([
            userData.to,
            userData.name,
            userData.petName,
            userData.petType,
            userData.reason,
            userData.date,
        ]);

        return `Gracias por la información, ${appoinment.name}.

        Hemos registrado tu cita para tu ${appoinment.petType} por el motivo: "${appoinment.reason}". 
        Nos pondremos en contacto contigo para confirmar la fecha y hora.`;
    }

    async handleAssistantFlow(to, message) {
        try {
            const state = this.assitandState[to];

            let response = "";
            if (state.step === "question") {
                response = await openAiSErvice(message);
            }

            delete this.assitandState[to]; // Limpia el estado del asistente después de responder
            await whatsappService.sendMessage(to, response);
            await whatsappService.sendInteractiveButtons(
                to,
                "¿La respuesta fue útil?",
                [
                    {
                        type: "reply",
                        reply: {
                            id: "yes",
                            title: "Sí, gracias",
                        },
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "no",
                            title: "No, otra pregunta",
                        },
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "emergency",
                            title: "Emergencia",
                        },
                    },
                ],
            );
        } catch (error) {
            console.error("Error en el flujo del asistente:", error);
        }
    }

    async sendContact(to) {
        let contact = {
            addresses: [
                {
                    street: "123 Calle de las Mascotas",
                    city: "Ciudad",
                    state: "Estado",
                    zip: "12345",
                    country: "PaÃ­s",
                    country_code: "PA",
                    type: "WORK",
                },
            ],
            emails: [
                {
                    email: "contacto@medpet.com",
                    type: "WORK",
                },
            ],
            name: {
                formatted_name: "MedPet Contacto",
                first_name: "MedPet",
                last_name: "Contacto",
                middle_name: "",
                suffix: "",
                prefix: "",
            },
            org: {
                company: "MedPet",
                department: "AtenciÃ³n al Cliente",
                title: "Representante",
            },
            phones: [
                {
                    phone: "+1234567890",
                    wa_id: "1234567890",
                    type: "WORK",
                },
            ],
            urls: [
                {
                    url: "https://www.medpet.com",
                    type: "WORK",
                },
            ],
        };

        await whatsappService.sendContactMessage(to, contact);
    }

    async sendLocation(to) {
        const location = {
            latitude: 6.2071694,
            longitude: -75.574607,
            name: "MedPet Veterinaria",
            address: "Cra 43 # 12-34, Medellín, Colombia",
        };

        await whatsappService.sendLocationMessage(to, location.latitude, location.longitude, location.name, location.address);
    }
}

export default new MessageHandler();
