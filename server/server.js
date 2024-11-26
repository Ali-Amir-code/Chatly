const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(express.json())
app.use(cors());

const PORT = 3000;

const usernames = ['ali', 'amir', 'muhammad'];
const users = [];

let uniqueID = 1000;

function getUniqueID() {
  return uniqueID++;
}

app.get('/checkUsernameAvailability', (req, res) => {
  const username = req.query.username;

  const isAvailable = !usernames.includes(username.toLowerCase());
  setTimeout(() => {
    res.json({ available: isAvailable, });
  }, 1000);
});

app.post('/register', (req, res) => {
  const { name, username, password } = req.body;
  res.json({
    'uniqueID' : getUniqueID(),
    'name' : name,
    'username' : username,
    'password' : password
  });
});

app.post('/login', async (req, res) => {
  res.json({
    'uniqueID': 2341,
    'name': 'Ali',
    'username': req.body.username,
    'password': req.body.password,
  });
});

server.listen(PORT, () => {
  console.log(`Listening of localhost:${PORT}`);
});