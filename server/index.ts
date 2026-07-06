import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path'; // Gestore dei percorsi di Node

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// Configura la cartella dei file statici (prova sia 'dist' che 'public')
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public')));

// FORZA IL CARICAMENTO DELLA PAGINA INIZIALE
app.get('/', (req, res) => {
  // Prova a servire il file index.html da dist, se fallisce prova da public
  res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'dist/index.html'), (err2) => {
        if (err2) {
          res.sendFile(path.join(__dirname, '../public/index.html'));
        }
      });
    }
  });
});

// FORZA IL CARICAMENTO DELLA PAGINA HOST
app.get('/host.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/host.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'dist/host.html'), (err2) => {
        if (err2) {
          res.sendFile(path.join(__dirname, '../public/host.html'));
        }
      });
    }
  });
});

io.on('connection', (socket) => {
  console.log('Un utente si è connesso:', socket.id);

  socket.on('joinGame', (username: string) => {
    (socket as any).username = username;
    io.emit('playerJoined', username);
  });

  socket.on('sendQuestion', (data: any) => {
    io.emit('nextQuestion', data);
  });

  socket.on('submitAnswer', (data: any) => {
    io.emit('playerAnswered', data);
  });

  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
