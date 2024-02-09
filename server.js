const express = require("express");
const client = require("./whatsapp");
const cors = require("cors");

const zapClient = client.client;
const app = express();
app.use(express.json());
app.use(cors());

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
