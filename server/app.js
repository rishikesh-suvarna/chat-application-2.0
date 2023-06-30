const express = require('express'),
socketio = require('socket.io'),
http = require('http'),
cors = require('cors'),
path = require('path'),
PORT = process.env.PORT || 8000;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')


const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: ["http://localhost:8000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors())
app.use(express.static(path.join(__dirname, "../client/build")));

route = require('./routes/routes');

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'../../client/build/index.html'));
});
// app.use(route);

io.on('connection', (socket) => {
    console.log('connected')

    socket.on('join', ({name, room}, callback) => {
        console.log(name);
        console.log(room);
        const { error, user } = addUser({id: socket.id, name, room});
        if(error) return callback(error)

        socket.emit('message', {user: 'admin', text: `${user.name} welcome to the room ${user.room}`})
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} joined the room`})
        socket.join(user.room)

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        
        callback();
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', {user: user.name, text: message})
        callback()
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left the chat`})
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        }
        console.log('disconnected');
    })

})


server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
})