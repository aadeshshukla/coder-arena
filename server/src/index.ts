import { runMatch } from './engine/matchLoop';
import { startSocketServer } from './network/socketServer';

console.log("Coder Arena Server Starting...");

// Start WebSocket server
startSocketServer();

// Start match loop
runMatch();

