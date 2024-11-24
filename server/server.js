const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());

const PORT = 3000;

let nextUniquieID = 1000;

const usernames = ['ali','amir','muhammad'];

app.get('/checkUsernameAvailability', (req, res) => {
  const username = req.query.username;

  const isAvailable = !usernames.includes(username.toLowerCase());
  setTimeout(() => {
    res.json({available: isAvailable,});
  }, 1000);
});

app.get('/nextUniquieID',(req,res)=>{
  res.send(nextUniquieID);
  nextUniquieID++;
});

server.listen(PORT, () => {
  console.log(`Listening of localhost:${PORT}`);
});