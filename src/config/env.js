import dotenv from 'dotenv';

dotenv.config();


export default {
  PORT: process.env.PORT || 3000,
  APP_WHATSAPP_TOKEN: process.env.APP_WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  APP_WHATSAPP_BUSINESS_ID: process.env.APP_WHATSAPP_BUSINESS_ID,
  APP_WHATSAPP_API_URL: process.env.APP_WHATSAPP_API_URL,
  API_VERSION: process.env.API_VERSION || 'v22.0',
  TO_WHATSAPP_NUMBER: process.env.TO_WHATSAPP_NUMBER,
  WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
};