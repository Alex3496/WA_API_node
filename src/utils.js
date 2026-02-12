
function normalizeWhatsappNumber(phone) {
  // Solo México tiene este caso
  if (phone.startsWith("521") && phone.length === 13) {
    return "52" + phone.slice(3);
  }
  return phone;
}

function isGreeting(message) {
    const greetings = ["hola", "buenos días", "buenas tardes", "buenas noches", "hi", "hello"];
    const text = message.toLowerCase() || "";
    return greetings.includes(text);
}

function getSenderName(sernderInfo) {
    return sernderInfo?.profile?.name || sernderInfo.wa_id || "";
}

export {
  normalizeWhatsappNumber,
  isGreeting,
  getSenderName,
};