const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const {Server} = require('socket.io');;
const io = new Server(server);

app.use(express.json())
app.use(cors());

const PORT = 3000;

const users = [
    {
        uniqueID: 234,
        name: 'ali',
        username:'ali',
        password:'123',
        addedUsers: [23,234,234],
    }
];
const onlineUserIDs = [];

let uniqueID = 1000;

function getUniqueID() {
    return uniqueID++;
}

function extractPropertyValues(arr,property){
    return arr.map(obj => obj[property]);
}

function getUser(data, propertyName){
    users.find(user => user[propertyName] === data);
}

async function register(req, res) {
    const { name, username, password } = req.body;
    const data = {
        uniqueID: getUniqueID(),
        name: name,
        username: username,
        password: password,
        addedUsers: [],
    };
    users.push(data);
    res.json(data);
}

async function login(req, res) {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        res.json(user);
    } else {
        res.status(401).json({ message: "Invalid username or password" });
    }
}

app.get('/checkUsernameAvailability', (req, res) => {
    const username = req.query.username;
    const usernames = extractPropertyValues(users, 'username');
    const isAvailable = usernames.includes(username.toLowerCase());
    res.json({ available: isAvailable, });
});

app.post('/register', register);

app.post('/login', login);

server.listen(PORT, () => {
    console.log(`Listening of localhost:${PORT}`);
});


// const express = require('express');
// const http = require('http');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);

// const { Server } = require('socket.io');
// const io = new Server(server, { cors: { origin: "*" } }); // Enable CORS for Socket.IO

// app.use(express.json());
// app.use(cors());

// const PORT = 3000;

// const users = [];
// const onlineUsers = new Map(); // Tracks online users (userID -> socketID)
// const messages = []; // In-memory storage for offline messages
// let uniqueID = 1000;

// // Helper Functions
// function getUniqueID() {
//     return uniqueID++;
// }

// function extractPropertyValues(arr, property) {
//     return arr.map(obj => obj[property]);
// }

// // Register API
// async function register(req, res) {
//     const { name, username, password } = req.body;
//     const data = {
//         uniqueID: getUniqueID(),
//         name: name,
//         username: username,
//         password: password,
//     };
//     users.push(data);
//     res.json(data);
// }

// // Login API
// async function login(req, res) {
//     const { username, password } = req.body;
//     const user = users.find(user => user.username === username && user.password === password);
//     if (user) {
//         res.json(user);
//     } else {
//         res.status(401).json({ message: "Invalid username or password" });
//     }
// }

// // Username Availability API
// app.get('/checkUsernameAvailability', (req, res) => {
//     const username = req.query.username;
//     const usernames = extractPropertyValues(users, 'username');
//     const isAvailable = !usernames.includes(username.toLowerCase());
//     setTimeout(() => {
//         res.json({ available: isAvailable });
//     }, 1000);
// });

// // API Routes
// app.post('/register', register);
// app.post('/login', login);

// // Socket.IO for Real-Time Chat
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     // User joins
//     socket.on('join', (userId) => {
//         onlineUsers.set(userId, socket.id);
//         console.log(`User ${userId} is now online.`);
        
//         // Deliver offline messages
//         const userMessages = messages.filter(msg => msg.recipientId === userId);
//         userMessages.forEach(msg => {
//             socket.emit('receiveMessage', msg);
//         });

//         // Remove delivered messages from the queue
//         messages = messages.filter(msg => msg.recipientId !== userId);
//     });

//     // Handle sending messages
//     socket.on('sendMessage', ({ senderId, recipientId, content }) => {
//         if (onlineUsers.has(recipientId)) {
//             const recipientSocketId = onlineUsers.get(recipientId);
//             io.to(recipientSocketId).emit('receiveMessage', { senderId, content, timestamp: new Date() });
//         } else {
//             // Store message for offline delivery
//             messages.push({ senderId, recipientId, content, timestamp: new Date() });
//         }
//     });

//     // User disconnects
//     socket.on('disconnect', () => {
//         const userId = Array.from(onlineUsers.entries()).find(([, socketId]) => socketId === socket.id)?.[0];
//         if (userId) {
//             onlineUsers.delete(userId);
//             console.log(`User ${userId} disconnected.`);
//         }
//     });
// });

// // Start Server
// server.listen(PORT, () => {
//     console.log(`Listening on localhost:${PORT}`);
// });
