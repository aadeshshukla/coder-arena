export interface PublicPlayerData {
  id: string;
  username: string;
  status: string;
  stats: { wins: number; losses: number; totalMatches: number };
}
