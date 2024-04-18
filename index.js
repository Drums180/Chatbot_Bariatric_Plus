require("dotenv").config();

const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { fetchChatGPTResponse } = require("./chatgpt.js");

async function connectionLogic() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};
    if (qr) console.log(qr);
    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      connectionLogic();
    }
  });

  sock.ev.on("messages.upsert", async (messageInfoUpsert) => {
    const message = messageInfoUpsert.messages[0];
    if (!message.key.fromMe && message.message.conversation) {
      const response = await fetchChatGPTResponse(message.message.conversation);
      await sock.sendMessage(message.key.remoteJid, { text: response });
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

connectionLogic();
