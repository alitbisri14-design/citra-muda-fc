import React, { useState, useEffect } from 'react';
import { Users, Trophy, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_MATCHES, MOCK_TRANSACTIONS, MOCK_PLAYERS } from '../mockData';
import { Transaction, Player, MatchScore, TeamCategory } from '../types';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  // Get transactions from localStorage or fallback to mock data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('citramudafc_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  // Get matches from localStorage or fallback to mock data
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('citramudafc_matches');
    return saved ? JSON.parse(saved) : MOCK_MATCHES;
  });

  // Get players from localStorage or fallback to mock data
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('citramudafc_players');
    return saved ? JSON.parse(saved) : MOCK_PLAYERS;
  });

  // Get match scores from localStorage
  const [matchScores, setMatchScores] = useState<MatchScore[]>(() => {
    const saved = localStorage.getItem('citramudafc_match_scores');
    return saved ? JSON.parse(saved) : [];
  });

  const categories: TeamCategory[] = ['Tim A', 'Tim B', 'Tim C', 'Tim D', 'Ladies', 'Remako A', 'Remako B'];

  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Update data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTransactions = localStorage.getItem('citramudafc_transactions');
      const savedMatches = localStorage.getItem('citramudafc_matches');
      const savedPlayers = localStorage.getItem('citramudafc_players');
      const savedScores = localStorage.getItem('citramudafc_match_scores');
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedMatches) setMatches(JSON.parse(savedMatches));
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedScores) setMatchScores(JSON.parse(savedScores));
    };

    const handlePlayersUpdate = () => {
      const savedPlayers = localStorage.getItem('citramudafc_players');
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('playersUpdated', handlePlayersUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('playersUpdated', handlePlayersUpdate);
    };
  }, []);

  const totalBalance = transactions.reduce((acc, curr) =>
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  // Calculate win percentage
  const calculateWinPercentage = () => {
    if (matchScores.length === 0) return 0;
    const wins = matchScores.filter(score => {
      const isHomeWin = score.homeTeam === 'Citra Muda FC' && score.homeScore > score.awayScore;
      const isAwayWin = score.awayTeam === 'Citra Muda FC' && score.awayScore > score.homeScore;
      return isHomeWin || isAwayWin;
    }).length;
    return Math.round((wins / matchScores.length) * 100);
  };

  const winPercentage = calculateWinPercentage();

  // Find the next upcoming match
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const upcomingMatches = matches.filter(match => match.date >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : (matches.length > 0 ? matches[matches.length - 1] : MOCK_MATCHES[0]);

  const stats = [
    { label: 'Total Pemain', value: `${players.length} Orang`, icon: Users, color: 'text-blue-400' },
    { label: 'Pertandingan Berikutnya', value: nextMatch.opponent.toUpperCase(), icon: Trophy, color: 'text-yellow-400' },
    { label: 'Saldo Kas', value: `Rp ${totalBalance.toLocaleString('id-ID')}`, icon: Wallet, color: 'text-electric-green' },
    { label: 'Performa Tim', value: `${winPercentage}%`, icon: TrendingUp, color: winPercentage >= 50 ? 'text-green-400' : 'text-red-400' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-glow">Ringkasan Klub</h2>
        <p className="text-white/50 mt-1">Selamat datang kembali di panel manajemen Citra Muda FC.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className={cn("p-3 rounded-xl bg-white/5 w-fit mb-4", stat.color)}>
                <stat.icon size={24} />
              </div>
              <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <stat.icon size={100} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass p-8 rounded-3xl overflow-hidden relative"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-electric-green" />
              Laga Mendatang
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5 p-8 rounded-2xl border border-white/10">
              <div className="text-center md:text-left">
                <p className="text-electric-green font-bold text-sm uppercase tracking-widest mb-2">Home Match</p>
                <p className="text-4xl font-black italic tracking-tighter">CITRA MUDA FC</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-white/20 italic">VS</div>
                <div className="mt-2 px-4 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
                  {nextMatch.date}
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-white/30 font-bold text-sm uppercase tracking-widest mb-2">Away Team</p>
                <p className="text-4xl font-black italic tracking-tighter text-white/80">{nextMatch.opponent.toUpperCase()}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-8 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{nextMatch.time} WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={16} />
                <span>{nextMatch.location}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric-green/10 blur-[100px] -z-0" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 rounded-3xl"
        >
          <h3 className="text-xl font-bold mb-6">Aktivitas Terakhir</h3>
          <div className="space-y-6">
            {transactions.slice(0, showAllTransactions ? transactions.length : 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === 'income' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-electric-green transition-colors">{tx.description}</p>
                    <p className="text-xs text-white/40">{tx.date}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-bold",
                  tx.type === 'income' ? "text-green-400" : "text-red-400"
                )}>
                  {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/60"
          >
            {showAllTransactions ? 'Lihat Lebih Sedikit' : 'Lihat Semua Riwayat'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
