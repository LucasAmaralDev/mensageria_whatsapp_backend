const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "Luc" }),
});

const informes = {
  status: "not ready",
};

client.on("qr", (qr) => {
  informes.status = "waiting for qr code";
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  informes.status = "ready";
});

client.on("message", async (message) => {
  console.log(message);
  console.log(`user: ${message.from} - message: ${message.body}`);
});

client.initialize();

module.exports = {
  client,
  informes,
};
