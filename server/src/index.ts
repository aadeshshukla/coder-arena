import express from 'express';
import path from 'path';
import { runMatch } from './engine/matchLoop';
import { startSocketServer } from './network/socketServer';

const app = express();
const PORT = 3000;

// Determine the client build path based on whether we're in dev or production
const clientDistPath = path.join(__dirname, '../../../client/dist');

// Serve static files from React build
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// All routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

console.log("Coder Arena Server Starting...");

// Start WebSocket server
startSocketServer();

// Start match loop
runMatch();

