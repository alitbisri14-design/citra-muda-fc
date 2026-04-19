import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Trophy, Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MATCHES } from '../mockData';
import { Match } from '../types';
import { cn, capitalizeInput } from '../lib/utils';
import { loadMatches, saveMatches } from '../lib/syncApi';

interface MatchScheduleProps {
  isAdmin: boolean;
}

const MatchSchedule: React.FC<MatchScheduleProps> = ({ isAdmin }) => {
  const sortMatchesByDate = (matchesToSort: Match[]) => {
    return [...matchesToSort].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem('citramudafc_matches');
      const data = saved ? JSON.parse(saved) as Match[] : MOCK_MATCHES;
      return sortMatchesByDate(data);
    } catch {
      return sortMatchesByDate(MOCK_MATCHES);
    }
  });
  const [syncMessage, setSyncMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    date: '',
    time: '',
    location: '',
    isHome: true
  });
  const [editMatch, setEditMatch] = useState({
    opponent: '',
    date: '',
    time: '',
    location: '',
    isHome: true
  });

  const handleAddMatch = () => {
    if (newMatch.opponent.trim() && newMatch.date && newMatch.time && newMatch.location.trim()) {
      const match: Match = {
        id: Date.now().toString(),
        opponent: newMatch.opponent.trim(),
        date: newMatch.date,
        time: newMatch.time,
        location: newMatch.location.trim(),
        isHome: newMatch.isHome
      };
      const updatedMatches = sortMatchesByDate([...matches, match]);
      setMatches(updatedMatches);
      saveMatches(updatedMatches).then((ok) =>
        setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
      );
      setNewMatch({ opponent: '', date: '', time: '', location: '', isHome: true });
      setIsAddModalOpen(false);
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setEditMatch({
      opponent: match.opponent,
      date: match.date,
      time: match.time,
      location: match.location,
      isHome: match.isHome
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMatch = () => {
    if (editingMatch && editMatch.opponent.trim() && editMatch.date && editMatch.time && editMatch.location.trim()) {
      const updatedMatches = sortMatchesByDate(matches.map(m => 
        m.id === editingMatch.id 
          ? { ...m, opponent: editMatch.opponent.trim(), date: editMatch.date, time: editMatch.time, location: editMatch.location.trim(), isHome: editMatch.isHome }
          : m
      ));
      setMatches(updatedMatches);
      saveMatches(updatedMatches).then((ok) =>
        setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
      );
      setIsEditModalOpen(false);
      setEditingMatch(null);
    }
  };

  const removeMatch = (id: string) => {
    const updatedMatches = matches.filter(m => m.id !== id);
    setMatches(updatedMatches);
    saveMatches(updatedMatches).then((ok) =>
      setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
    );
  };

  useEffect(() => {
    localStorage.setItem('citramudafc_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    const syncFromServer = async () => {
      const serverData = await loadMatches();
      if (serverData) {
        setMatches(sortMatchesByDate(serverData));
        setSyncMessage(`Sinkron server: ${new Date().toLocaleTimeString('id-ID')}`);
      }
    };

    syncFromServer();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-glow">Jadwal Pertandingan</h2>
          <p className="text-white/50 mt-1">Daftar agenda pertandingan mendatang Citra Muda FC.</p>
          {syncMessage && <p className="text-[11px] text-white/40 mt-2">{syncMessage}</p>}
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-electric-green text-black font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
          >
            <Plus size={20} />
            Tambah Jadwal
          </button>
        )}
      </header>

      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 md:p-8 rounded-3xl group relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <span className="text-electric-green font-black text-4xl leading-none">
                  {match.date.split('-')[2]}
                </span>
                <span className="text-white/40 text-xs uppercase tracking-[0.3em] mt-1">
                  {new Date(match.date).toLocaleString('id-ID', { month: 'short' }).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                <div className="text-center md:text-right flex-1">
                  <h4 className="text-2xl font-black italic tracking-tighter">CITRA MUDA FC</h4>
                  <p className="text-white/30 text-xs uppercase font-bold tracking-widest">Tuan Rumah</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/20 font-black italic">
                    VS
                  </div>
                </div>

                <div className="text-center md:text-left flex-1">
                  <h4 className="text-2xl font-black italic tracking-tighter text-white/80">{match.opponent.toUpperCase()}</h4>
                  <p className="text-white/30 text-xs uppercase font-bold tracking-widest">Lawan</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Clock size={16} className="text-electric-green" />
                  <span>{match.time} WIB</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin size={16} className="text-electric-green" />
                  <span className="truncate max-w-[150px]">{match.location}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Trophy size={16} className="text-electric-green" />
                  <span>{match.isHome ? 'Kandang' : 'Tandang'}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditMatch(match)}
                    className="p-3 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => removeMatch(match.id)}
                    className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-electric-green/5 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Add Match Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-glow">Tambah Jadwal Pertandingan</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Lawan</label>
                  <input
                    type="text"
                    value={newMatch.opponent}
                    onChange={(e) => setNewMatch({...newMatch, opponent: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Nama tim lawan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Waktu</label>
                  <input
                    type="time"
                    value={newMatch.time}
                    onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={newMatch.location}
                    onChange={(e) => setNewMatch({...newMatch, location: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Stadion atau lapangan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipe Pertandingan</label>
                  <select
                    value={newMatch.isHome ? 'home' : 'away'}
                    onChange={(e) => setNewMatch({...newMatch, isHome: e.target.value === 'home'})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    <option value="home">Kandang</option>
                    <option value="away">Tandang</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddMatch}
                    className="flex-1 py-3 bg-electric-green text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Match Modal */}
        {isEditModalOpen && editingMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-glow">Edit Jadwal Pertandingan</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Lawan</label>
                  <input
                    type="text"
                    value={editMatch.opponent}
                    onChange={(e) => setEditMatch({...editMatch, opponent: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Nama tim lawan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={editMatch.date}
                    onChange={(e) => setEditMatch({...editMatch, date: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Waktu</label>
                  <input
                    type="time"
                    value={editMatch.time}
                    onChange={(e) => setEditMatch({...editMatch, time: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={editMatch.location}
                    onChange={(e) => setEditMatch({...editMatch, location: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Stadion atau lapangan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipe Pertandingan</label>
                  <select
                    value={editMatch.isHome ? 'home' : 'away'}
                    onChange={(e) => setEditMatch({...editMatch, isHome: e.target.value === 'home'})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    <option value="home">Kandang</option>
                    <option value="away">Tandang</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateMatch}
                    className="flex-1 py-3 bg-electric-green text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchSchedule;
