import config from "../config/env.js";
import messageHandler from "../services/messageHandler.js";

class WebhookController {

    /**
     * @description Maneja los mensajes entrantes del webhook de WhatsApp.
     * Extrae el mensaje del cuerpo de la solicitud y lo pasa al servicio de manejo de mensajes para su procesamiento. 
     * Responde con un estado 200 para indicar que el mensaje fue recibido correctamente
     */
    async handleIncoming(req, res) {
        const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
        if (message) {
            await messageHandler.handleIncomingMessage(message);
        }
        res.sendStatus(200);
    }

    /**
     * @description Verifica el webhook de WhatsApp.
     * Comprueba que el token de verificación recibido coincida con el token configurado.
     * Responde con el desafío recibido si la verificación es exitosa, o con un estado 403 si falla.
     */
    verifyWebhook(req, res) {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === config.WEBHOOK_VERIFY_TOKEN) {
            res.status(200).send(challenge);
            console.log("Webhook verified successfully!");
        } else {
            res.sendStatus(403);
        }
    }
}

export default new WebhookController();
