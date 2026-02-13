import path from "path";
import config from "../config/env.js";
import { google } from "googleapis";

const sheets = google.sheets("v4");

async function addRowToSheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: "reservas", // Cambia esto si tu hoja tiene un nombre diferente o quieres empezar en otra celda
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
            values: [values],
        },
        auth,
    };

    try {
        const response = await sheets.spreadsheets.values.append(request);
        console.log("Fila agregada a Google Sheets:", response.data);
    } catch (err) {
        console.error("Error al agregar fila a Google Sheets:", err);
    }
}

const appendToSheet = async (values) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), "src/config", "credentials.json"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const authClient = await auth.getClient();
        const spreadsheetId = config.GOOGLE_SHEET_ID; // Reemplaza con tu ID de hoja de cálculo

        await addRowToSheet(authClient, spreadsheetId, values);
        return "OK";
    } catch (err) {
        console.error("Error al autenticar con Google Sheets:", err);
    }
};

export default {
    appendToSheet,
};
