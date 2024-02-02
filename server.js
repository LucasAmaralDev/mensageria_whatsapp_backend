const express = require('express');
const client = require('./whatsapp');
const cors = require('cors');

const zapClient = client.client;
const app = express();
app.use(express.json());
app.use(cors())

const port = 3003;

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/me/info', async (req, res) => {
    try {
        const me = await zapClient.info;
        res.json(me);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

app.get('/chats', async (req, res) => {
    try {
        const chats = await zapClient.getChats();
        res.json(chats);
    } catch (error) {

    }

});

app.get('/chats/:id/messages', async (req, res) => {
    try {
        const chat = await zapClient.getChatById(req.params.id);
        const messages = await chat.fetchMessages({
            limit: 10
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

app.post('/send', async (req, res) => {
    try {
        const { to, message } = req.body;
        const chat = await zapClient.getChatById(to);
        chat.sendMessage(message);
        res.json({ to, message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

})

app.get("/chats/:id", async (req, res) => {
    try {
        const chat = await zapClient.getChatById(req.params.id);
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});