const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');;
const io = new Server(server);

app.use(express.json())
app.use(cors());

const PORT = 3000;


const users = [
    {
        id: 234,
        name: 'ali',
        username: 'ali',
        password: '123',
        addedUsers: [23, 234, 234],
        unDeliveredMessages: [

        ]
    }
];
// const onlineUserIDs = [1000];

const onlineUserIDs = new Map([
    [1000, 'sdfhsodfsodfjsdof']
]);

let id = 1000;


function getNewId() {
    return id++;
}

function extractPropertyValues(arr, property) {
    return arr.map(obj => obj[property]);
}

function getUser(data, propertyName) {
    users.find(user => user[propertyName] === data);
}

function isValidUser(data) {
    const user = getUser(data, 'id');
    return user && user.username === data.username && user.password === data.password;
}

async function register(req, res) {
    const { name, username, password } = req.body;
    const data = {
        id: getNewId(),
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

app.get('/checkStatus', (req, res) => {
    const id = Number(req.query.id);
    const result = onlineUserIDs.has(id);
    setTimeout(() => {
        if (result) {
            res.json('online');
        } else {
            res.json('offline');
        }
    }, 2000);
});


app.post('/register', register);

app.post('/login', login);

server.listen(PORT, () => {
    console.log(`Listening of localhost:${PORT}`);
});

// Socket Logic

io.use((socket, next) => {
    const data = socket.handshake.auth.user;
    if (isValidUser(data)) {
        next();
    } else {
        next(new Error('Authentication error'));
    }
})

io.on('connection', (socket) => {
    socket.on('setId', (userId) => {
        onlineUserIDs.set(userId, socket.id);
    })
});