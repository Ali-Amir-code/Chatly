const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(express.json())
app.use(cors());

const PORT = 3000;

const usernames = ['ali', 'amir', 'muhammad'];

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
  console.log(name, username, password);
  res.json({
    'uniqueID' : getUniqueID(),
    'name' : name,
    'username' : username,
    'password' : password
  });
});

server.listen(PORT, () => {
  console.log(`Listening of localhost:${PORT}`);
});