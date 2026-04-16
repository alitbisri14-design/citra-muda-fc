import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, Clock, Target, Users, Edit, Trash2, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Match, MatchScore, TeamCategory } from '../types';
import { cn, capitalizeInput } from '../lib/utils';

interface MatchScoresProps {
  isAdmin: boolean;
}

const MatchScores: React.FC<MatchScoresProps> = ({ isAdmin }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ homeScore: number; awayScore: number }>({ homeScore: 0, awayScore: 0 });

  const categories: TeamCategory[] = ['Tim A', 'Tim B', 'Tim C', 'Tim D', 'Ladies', 'Remako A', 'Remako B'];

  // Load data from localStorage
  useEffect(() => {
    const savedMatches = localStorage.getItem('citramudafc_matches');
    const savedScores = localStorage.getItem('citramudafc_match_scores');
    const lastReset = localStorage.getItem('citramudafc_scores_last_reset');

    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }

    // Check if 2 months have passed since last reset
    const now = new Date();
    const resetDate = lastReset ? new Date(lastReset) : new Date(0);
    const monthsDiff = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsDiff >= 2 || !savedScores) {
      generateMockScores();
      localStorage.setItem('citramudafc_scores_last_reset', now.toISOString());
    } else if (savedScores) {
      const scores = JSON.parse(savedScores);
      // Ensure team names are capitalized for existing data
      const capitalizedScores = scores.map((score: MatchScore) => ({
        ...score,
        homeTeam: score.homeTeam === 'Citra Muda FC' ? 'Citra Muda FC' : capitalizeInput(score.homeTeam),
        awayTeam: score.awayTeam === 'Citra Muda FC' ? 'Citra Muda FC' : capitalizeInput(score.awayTeam)
      }));
      setMatchScores(capitalizedScores);
      // Update localStorage with capitalized names if needed
      if (JSON.stringify(scores) !== JSON.stringify(capitalizedScores)) {
        localStorage.setItem('citramudafc_match_scores', JSON.stringify(capitalizedScores));
      }
    }
  }, []);

  const generateMockScores = () => {
    const savedMatches = localStorage.getItem('citramudafc_matches');
    let matches = savedMatches ? JSON.parse(savedMatches) : [];

    // If no matches saved, use mock data
    if (matches.length === 0) {
      matches = [
        { id: '1', opponent: 'Persija Jakarta', date: '2024-05-20', time: '15:30', location: 'Stadion Patriot', isHome: true },
        { id: '2', opponent: 'Persib Bandung', date: '2024-06-05', time: '19:00', location: 'Stadion GBLA', isHome: false },
        { id: '3', opponent: 'Arema FC', date: '2024-06-15', time: '16:00', location: 'Stadion Kanjuruhan', isHome: true },
      ];
    }

    const mockScores: MatchScore[] = [];

    matches.forEach((match: Match) => {
      categories.forEach(category => {
        // Generate random scores
        const homeScore = Math.floor(Math.random() * 5);
        const awayScore = Math.floor(Math.random() * 5);

        mockScores.push({
          id: `${match.id}_${category}`,
          matchId: match.id,
          category,
          homeScore,
          awayScore,
          homeTeam: match.isHome ? 'Citra Muda FC' : capitalizeInput(match.opponent),
          awayTeam: match.isHome ? capitalizeInput(match.opponent) : 'Citra Muda FC',
          date: match.date
        });
      });
    });

    setMatchScores(mockScores);
    localStorage.setItem('citramudafc_match_scores', JSON.stringify(mockScores));
  };

  const getMatchScores = (matchId: string) => {
    return matchScores.filter(score => score.matchId === matchId);
  };

  const getScoreResult = (score: MatchScore) => {
    if (score.homeScore > score.awayScore) {
      return `${score.homeTeam} menang ${score.homeScore}:${score.awayScore} melawan ${score.awayTeam}`;
    } else if (score.awayScore > score.homeScore) {
      return `${score.awayTeam} menang ${score.awayScore}:${score.homeScore} melawan ${score.homeTeam}`;
    } else {
      return `Seri ${score.homeScore}:${score.awayScore} antara ${score.homeTeam} dan ${score.awayTeam}`;
    }
  };

  const handleEditScore = (score: MatchScore) => {
    setEditingScore(score.id);
    setEditForm({ homeScore: score.homeScore, awayScore: score.awayScore });
  };

  const handleSaveScore = (scoreId: string) => {
    const updatedScores = matchScores.map(score =>
      score.id === scoreId
        ? { ...score, homeScore: editForm.homeScore, awayScore: editForm.awayScore }
        : score
    );
    setMatchScores(updatedScores);
    localStorage.setItem('citramudafc_match_scores', JSON.stringify(updatedScores));
    setEditingScore(null);
  };

  const handleDeleteScore = (scoreId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus skor ini?')) {
      const updatedScores = matchScores.filter(score => score.id !== scoreId);
      setMatchScores(updatedScores);
      localStorage.setItem('citramudafc_match_scores', JSON.stringify(updatedScores));
    }
  };

  const handleCancelEdit = () => {
    setEditingScore(null);
    setEditForm({ homeScore: 0, awayScore: 0 });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-glow">Skor Pertandingan</h2>
          <p className="text-white/50 mt-1">Hasil pertandingan dari semua kategori tim Citra Muda FC.</p>
        </div>
        {isAdmin && (
          <button
            onClick={generateMockScores}
            className="flex items-center gap-2 px-6 py-3 bg-electric-green text-black font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
          >
            <Target size={20} />
            Generate Skor Baru
          </button>
        )}
      </header>

      <div className="space-y-6">
        {matches.map((match, matchIndex) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: matchIndex * 0.1 }}
            className="glass p-6 rounded-2xl"
          >
            {/* Match Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-electric-green/20 rounded-xl flex items-center justify-center">
                  <Trophy className="text-electric-green" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {match.isHome ? 'Citra Muda FC' : match.opponent} VS {match.isHome ? match.opponent : 'Citra Muda FC'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(match.date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {match.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {match.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMatchScores(match.id).map((score, scoreIndex) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: scoreIndex * 0.05 }}
                  className="bg-white/5 p-4 rounded-xl border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-electric-green">{score.category}</h4>
                    {isAdmin && (
                      <div className="flex gap-1">
                        {editingScore === score.id ? (
                          <>
                            <button
                              onClick={() => handleSaveScore(score.id)}
                              className="p-1 text-green-400 hover:text-green-300 transition-colors"
                              title="Simpan"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                              title="Batal"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditScore(score)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteScore(score.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingScore === score.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editForm.homeScore}
                          onChange={(e) => setEditForm(prev => ({ ...prev, homeScore: parseInt(e.target.value) || 0 }))}
                          className="w-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-center text-white"
                        />
                        <span className="text-white/60">:</span>
                        <input
                          type="number"
                          min="0"
                          value={editForm.awayScore}
                          onChange={(e) => setEditForm(prev => ({ ...prev, awayScore: parseInt(e.target.value) || 0 }))}
                          className="w-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-center text-white"
                        />
                      </div>
                      <p className="text-xs text-white/50">
                        {score.homeTeam} vs {score.awayTeam}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-white/80 mb-1">
                        {score.homeScore}:{score.awayScore}
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {getScoreResult(score)}
                      </p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {matches.length === 0 && (
          <div className="glass p-12 rounded-2xl text-center">
            <Trophy className="mx-auto mb-4 text-white/30" size={48} />
            <h3 className="text-xl font-bold text-white/50 mb-2">Belum Ada Pertandingan</h3>
            <p className="text-white/40">Tambahkan jadwal pertandingan terlebih dahulu untuk melihat skor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchScores;