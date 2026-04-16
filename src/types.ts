export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type TeamCategory = 'Tim A' | 'Tim B' | 'Tim C' | 'Tim D' | 'Ladies' | 'Remako A' | 'Remako B';

export interface Player {
  id: string;
  name: string;
  position: Position;
  category: TeamCategory;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  isHome: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  level: number; // 0: Ketua, 1: Wakil, 2: Staff
}

export interface Attendance {
  id: string;
  name: string;
  timestamp: string;
}

export interface MatchScore {
  id: string;
  matchId: string;
  category: TeamCategory;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
}

export interface Formation {
  id: string;
  category: TeamCategory;
  coach: string;
  startingPlayers: Player[];
  substitutes: Player[];
  lastUpdated: string;
}
