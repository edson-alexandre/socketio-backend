const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080'],
  },
});
app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

io.on('connection', socket => {
  const token = socket.handshake.auth.token;
  console.log('a user connected', token);
  socket.on('disconnect', () => {
    console.log('user disconnected', token);
  });
  socket.on('my message', msg => {
    console.log('message: ' + msg);
    io.emit('my broadcast', `server: ${msg}`);
  });
});

http.listen(3000, () => {
  console.log('listening http on *:3000');
});
