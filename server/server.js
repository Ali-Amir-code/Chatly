const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const PORT = 3000;

let nextUniquieID = 1000;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.get('/nextUniquieID',(req,res)=>{
  res.send(nextUniquieID);
  nextUniquieID++;
})

server.listen(PORT, () => {
  console.log(`Listening of localhost:${PORT}`);
});