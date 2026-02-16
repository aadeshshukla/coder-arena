import express from 'express';
import path from 'path';
import { runMatch } from './engine/matchLoop';
import { startSocketServer } from './network/socketServer';

const app = express();
const PORT = 3000;

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../client/dist')));

// All routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

console.log("Coder Arena Server Starting...");

// Start WebSocket server
startSocketServer();

// Start match loop
runMatch();

