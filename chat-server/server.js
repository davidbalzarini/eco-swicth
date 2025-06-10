require('dotenv').config();

const express = require('express');
const http = require('http');

const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});


const dbConfig = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.pass,
  database: process.env.db
};

io.on('connection', (socket) => {
  socket.on('join', (conversationId) => {
    socket.join('conv_' + conversationId);
  });

  socket.on('chat_message', async (data) => {
    const { conversationId, senderId, content } = data;
    console.log(`Mensagem recebida: ${content} de ${senderId} na conversa ${conversationId}`);
    const conn = await mysql.createConnection(dbConfig);

    await conn.execute(
      "INSERT INTO chat_messages (conversation_id, sender_id, message_content) VALUES (?, ?, ?)",
      [conversationId, senderId, content]
    );
    await conn.execute(
      "UPDATE conversations SET last_message_at=NOW() WHERE id=?",
      [conversationId]
    );
    await conn.end();

    io.to('conv_' + conversationId).emit('chat_message', {
      conversationId,
      senderId,
      content,
      sent_at: new Date().toISOString()
    });
  });
});

server.listen(3001, () => {
  console.log('Servidor de chat rodando em http://localhost:3001');
});