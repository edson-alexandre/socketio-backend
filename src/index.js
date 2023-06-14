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

io.use(async (socket, next) => {
  // fetch token from handshake auth sent by FE
  const token = socket.handshake.auth.token;
  const user = { ...token };

  // save the user data into socket object, to be used further
  socket.user = user;
  next();
});

io.on('connection', socket => {
  // join user's own room
  socket.join(socket.user.id);
  console.log('a user connected', 'id', socket.user.id, 'name', socket.user.name);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('my message', msg => {
    console.log('message: ' + msg);
    io.emit('my broadcast', `server: ${msg}`);
  });

  socket.on('join', roomName => {
    console.log('join: ' + roomName);
    socket.join(roomName);
  });

  socket.on('message', ({ message, roomName }, callback) => {
    console.log('message: ' + message + ' in ' + roomName);
    // generate data to send to receivers
    const outgoingMessage = {
      name: socket.user.name,
      id: socket.user.id,
      message,
    };

    // send socket to all in room except sender
    socket.to(roomName).emit('message', outgoingMessage);
    callback({
      status: 'ok',
    });
    // send to all including sender
    // io.to(roomName).emit("message", message);
  });

  socket.on('message', ({ message, roomName }, callback) => {
    console.log('message: ' + message + ' in ' + roomName);

    // generate data to send to receivers
    const outgoingMessage = {
      name: socket.user.name,
      id: socket.user.id,
      message,
    };
    console.log(outgoingMessage);
    // send socket to all in room except sender
    socket.to(roomName).emit('message', outgoingMessage);
    callback({
      status: 'ok',
    });
    // send to all including sender
    // io.to(roomName).emit("message", message);
  });
});

http.listen(3000, () => {
  console.log('listening http on *:3000');
});
