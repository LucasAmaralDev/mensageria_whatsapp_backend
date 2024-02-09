const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "Luc" }),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");

  //get last chats
  // const chats = await client.getChats();

  //get last messages
  // const messages = await chats[0].fetchMessages({limit: 10});
  // for (let message of messages) {
  //     console.log(message.body);
  // }

  //get my info
});

client.on("message", async (message) => {
  console.log(message);
  console.log(`user: ${message.from} - message: ${message.body}`);
});

client.initialize();

exports.client = client;
