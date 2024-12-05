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
        id: 9999,
        name: 'ali',
        username: 'admin',
        password: 'thunderfighter',
        addedUsers: [],
        unDeliveredMessages: [],
        notifications: [],
    }
];
// const onlineUserIDs = [1000];

const onlineUserIDs = new Map([
    [9999, 'sdfhsodfsodfjsdof']
]);

let id = 1000;

function getKeyByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
        if (value === searchValue) {
            return key;
        }
    }
    return undefined; // Return undefined if no match found
}

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
        unDeliveredMessages : [],
    };
    const dataForClient = {
        id : data.id,
        username : data.username,
        name : data.name,
        password : data.password,
        contacts : [],
    }
    users.push(data);
    res.json(dataForClient);
    console.log(users);
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

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/checkUsernameAvailability', (req, res) => {
    const username = req.query.username;
    const usernames = extractPropertyValues(users, 'username');
    const isAvailable = !usernames.includes(username.toLowerCase());
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

app.get('/getContactsID', (req, res) => {
    const id = Number(req.query.id);
    const contacts = users.find(user => user.id === id).addedUsers;
    res.json(contacts);
})

app.get('/getContact', (req, res) => {
    const id = Number(req.query.id);
    const contact = users.find(user => user.id === id);
    if(contact){
        const contactForClient = {
            id: contact.id,
            name: contact.name,
            username: contact.username,
            messages : contact.unDeliveredMessages
        }
        res.json(contactForClient);
    }
    res.status(401).json('No User Found');
})

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
    });

    socket.on('disconnect', () => {
        onlineUserIDs.delete(getKeyByValue(onlineUserIDs, socket.id));
    });

    socket.on('message', (data) => {
        const { senderId, receiverId, message } = data;
        console.log(data);
        const receiverSocket = onlineUserIDs.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('message', data);
        }
    });
});