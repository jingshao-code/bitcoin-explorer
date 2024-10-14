

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const dbPath = '/usr/src/app/blockchain_data.db';

app.use(cors());
app.use(bodyParser.json());

let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database: ", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

let latestData = null;

// 添加一个处理根路径 ("/") 的路由
app.get('/', (req, res) => {
  res.send('Welcome to Bitcoin Explorer API!');
});

app.post('/update-block-data', (req, res) => {
  const { height, tx_count, price, timestamp } = req.body;

  latestData = { height, tx_count, price, timestamp };

  res.sendStatus(200);
});

app.get('/block-height-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendData = () => {
    if (latestData) {
      res.write(`data: ${JSON.stringify(latestData)}\n\n`);
    }
  };

  const interval = setInterval(sendData, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });

  sendData(); 
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});





