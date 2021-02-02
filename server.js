const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const prefix = '/';

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = '☑️ PrismChat Bot ';
const warnMessage = '(( WARN )) ' 

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {


    if(room != 'Room-1' && room != 'Room-2' && room != 'Room-3' && room != 'Room-4' && room != 'Room-5' ) {
      console.log(warnMessage + username + ', entered an invalid room number.');
      socket.emit('message', formatMessage(botName, ' WARN! invaled roomID.'));


    } else {

      if(username == "" && username == null) {
        console.log(warnMessage + 'someone is entered invalid username.')
        socket.emit('message', formatMessage(botName, ' WARN! invaled userID.'));

      } else {

    console.log(username + ', has joined the '+ room);

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to PrismChat!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    

    }
      }
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
io.to(user.room).emit('message', formatMessage(user.username, msg));

    if(msg == prefix + 'getadmin veAufTfBa7T5_f#') {
      formatMessage(botName, `${user.username}, you have successfully become an admin. ` );
      console.log(user.username + ', received admin privileges.')
    } else {
      
    }

  });

  // Runs when client disconnects
  socket.on('disconnect', () => { 
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
