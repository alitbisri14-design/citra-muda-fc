import { Match, Player, Transaction } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

type SyncResource = 'transactions' | 'matches' | 'players';

const loadResource = async <T>(resource: SyncResource): Promise<T[] | null> => {
  const response = await fetch(`${apiBaseUrl}/sync/${resource}`);
  if (!response.ok) return null;
  return (await response.json()) as T[];
};

const saveResource = async <T>(resource: SyncResource, data: T[]): Promise<boolean> => {
  const response = await fetch(`${apiBaseUrl}/sync/${resource}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.ok;
};

export const loadTransactions = () => loadResource<Transaction>('transactions');
export const saveTransactions = (data: Transaction[]) => saveResource('transactions', data);

export const loadMatches = () => loadResource<Match>('matches');
export const saveMatches = (data: Match[]) => saveResource('matches', data);

export const loadPlayers = () => loadResource<Player>('players');
export const savePlayers = (data: Player[]) => saveResource('players', data);
