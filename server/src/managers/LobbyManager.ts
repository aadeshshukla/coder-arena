import { Server as SocketIOServer, Socket } from 'socket.io';
import { Player } from '../core/Player';
import { LobbyState } from '../../shared/types/events';

export class LobbyManager {
  private io: SocketIOServer;
  private lobbyPlayers: Set<string>; // Set of player IDs in the lobby

  constructor(io: SocketIOServer) {
    this.io = io;
    this.lobbyPlayers = new Set();
  }

  /**
   * Add a player to the lobby
   */
  joinLobby(player: Player, socket: Socket): void {
    this.lobbyPlayers.add(player.id);
    socket.join('lobby');
    console.log(`Player ${player.username} joined lobby`);
    this.broadcastLobbyUpdate();
  }

  /**
   * Remove a player from the lobby
   */
  leaveLobby(playerId: string): void {
    this.lobbyPlayers.delete(playerId);
    console.log(`Player ${playerId} left lobby`);
    this.broadcastLobbyUpdate();
  }

  /**
   * Check if a player is in the lobby
   */
  isInLobby(playerId: string): boolean {
    return this.lobbyPlayers.has(playerId);
  }

  /**
   * Get current lobby state
   */
  getLobbyState(allPlayers: Player[]): LobbyState {
    // Filter to only include players who are in the lobby
    const lobbyPlayersList = allPlayers.filter(p => this.lobbyPlayers.has(p.id));
    
    return {
      players: lobbyPlayersList.map(p => p.toPublicData()),
      playerCount: lobbyPlayersList.length
    };
  }

  /**
   * Broadcast lobby state to all players in the lobby room
   */
  broadcastLobbyUpdate(allPlayers?: Player[]): void {
    if (allPlayers) {
      const lobbyState = this.getLobbyState(allPlayers);
      this.io.to('lobby').emit('lobby:update', lobbyState);
    }
  }

  /**
   * Get lobby players set
   */
  getLobbyPlayers(): Set<string> {
    return this.lobbyPlayers;
  }
}
