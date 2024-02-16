const express = require("express");
const { client, informes } = require("./whatsapp");
const cors = require("cors");
const Server = require("socket.io");

const zapClient = client;
const app = express();
app.use(express.json());
app.use(cors());
const http = require("http").createServer(app);
const serverSocket = Server(http, {
  cors: {
    origin: "*",
  },
});

const cacheImages = {};
const profilePhoto = {};
const port = 3003;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/me/info", async (req, res) => {
  try {
    const me = zapClient.info;
    res.json(me);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getContacts", async (req, res) => {
  try {
    const contacts = await zapClient.getContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/chats", async (req, res) => {
  try {
    const chats = await zapClient.getChats();
    const firstsChats = chats.slice(0, 20);
    res.json(firstsChats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/chats/:id/messages", async (req, res) => {
  try {
    const chat = await zapClient.getChatById(req.params.id);
    const messages = await chat.fetchMessages({
      limit: 12,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/send", async (req, res) => {
  try {
    const { to, message } = req.body;
    const chat = await zapClient.getChatById(to);
    chat.sendMessage(message);
    res.json({ to, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/chats/:id", async (req, res) => {
  try {
    const chat = await zapClient.getChatById(req.params.id);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/message/donwloadMedia/:id", async (req, res) => {
  try {
    const message = await zapClient.getMessageById(req.params.id);

    if (cacheImages[req.params.id]) {
      res.json(cacheImages[req.params.id]);
      return;
    }

    const media = await message.downloadMedia();
    cacheImages[req.params.id] = media;
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/profilePhoto/:id", async (req, res) => {
  try {
    if (profilePhoto[req.params.id]) {
      return res.json(profilePhoto[req.params.id]);
    }

    const photo = await zapClient.getProfilePicUrl(req.params.id);
    profilePhoto[req.params.id] = photo;
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

serverSocket.on("connection", (socket) => {
  // Emitindo o status do cliente
  client.on("ready", async () => {
    socket.emit("status", "ready");
  });

  client.on("message", async (message) => {
    const chats = await zapClient.getChats();
    const firstsChats = chats.slice(0, 40);
    socket.emit("getChats", firstsChats);
  });

  // Emitindo a verificação do status do cliente
  socket.on("verificar status", () => {
    socket.emit("status", informes.status);
  });

  // Emitindo informações da conta conectada
  socket.on("getMyInfo", async () => {
    while (informes.status !== "ready") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const me = await zapClient.info;
      socket.emit("getMyInfo", me);
    } catch (error) {
      console.log("erro");
    }
  });

  socket.on("getContacts", async () => {
    while (informes.status !== "ready") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const contacts = await zapClient.getContacts();
    socket.emit("getContacts", contacts);
  });

  socket.on("getChats", async () => {
    while (informes.status !== "ready") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const chats = await zapClient.getChats();
    const firstsChats = chats.slice(0, 30);
    socket.emit("getChats", firstsChats);
  });

  socket.on("getChatMessages", async (id) => {
    while (informes.status !== "ready") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const chat = await zapClient.getChatById(id);
    const messages = await chat.fetchMessages({
      limit: 12,
    });
    socket.emit("getChatMessages", messages);
  });
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
