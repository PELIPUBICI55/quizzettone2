import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Un utente si è connesso:', socket.id);

  socket.on('joinGame', (username: string) => {
    (socket as any).username = username;
    console.log(`${username} è entrato in partita`);
    io.emit('playerJoined', username);
  });

  socket.on('sendQuestion', (data: any) => {
    console.log('Nuova domanda inviata dall\'host:', data.question);
    io.emit('nextQuestion', data);
  });

  socket.on('submitAnswer', (data: any) => {
    console.log(`${data.username} ha risposto: ${data.answer}`);
    io.emit('playerAnswered', data);
  });

  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
