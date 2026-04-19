import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Trash2, Edit2, Users, X, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PLAYERS } from '../mockData';
import { TeamCategory, Position, Player, Formation } from '../types';
import { cn, titleCase, capitalizeInput } from '../lib/utils';
import { loadPlayers, savePlayers } from '../lib/syncApi';

interface PlayerRosterProps {
  isAdmin: boolean;
}

const PlayerRoster: React.FC<PlayerRosterProps> = ({ isAdmin }) => {
  const categories: (TeamCategory | 'Semua')[] = [
    'Semua', 'Tim A', 'Tim B', 'Tim C', 'Tim D', 'Ladies', 'Remako A', 'Remako B'
  ];

  const positions: Position[] = ['GK', 'DF', 'MF', 'FW'];

  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'formation'>('list');
  const [formations, setFormations] = useState<Formation[]>(() => {
    const saved = localStorage.getItem('citramudafc_formations');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize formations for each category
    return categories.slice(1).map(category => ({
      id: category,
      category: category as TeamCategory,
      coach: '',
      startingPlayers: [],
      substitutes: [],
      lastUpdated: new Date().toISOString()
    }));
  });
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('citramudafc_players');
      return saved ? JSON.parse(saved) as Player[] : MOCK_PLAYERS;
    } catch {
      return MOCK_PLAYERS;
    }
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'GK' as Position,
    category: 'Tim A' as TeamCategory
  });
  const [editPlayer, setEditPlayer] = useState({
    name: '',
    position: 'GK' as Position,
    category: 'Tim A' as TeamCategory
  });

  const filteredPlayers = players.filter(player => {
    const matchesCategory = selectedCategory === 'Semua' || player.category === selectedCategory;
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPositionColor = (pos: Position) => {
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const handleAddPlayer = () => {
    if (newPlayer.name.trim()) {
      const player: Player = {
        id: Date.now().toString(),
        name: titleCase(newPlayer.name.trim()),
        position: newPlayer.position,
        category: newPlayer.category
      };
      const updatedPlayers = [...players, player];
      setPlayers(updatedPlayers);
      savePlayers(updatedPlayers).then((ok) =>
        setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
      );
      setNewPlayer({ name: '', position: 'GK', category: 'Tim A' });
      setIsAddModalOpen(false);
      window.dispatchEvent(new Event('playersUpdated'));
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditPlayer({
      name: player.name,
      position: player.position,
      category: player.category
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer && editPlayer.name.trim()) {
      const updatedPlayer = {
        ...editingPlayer,
        name: titleCase(editPlayer.name.trim()),
        position: editPlayer.position,
        category: editPlayer.category
      };

      const updatedPlayers = players.map(p =>
        p.id === editingPlayer.id ? updatedPlayer : p
      );
      setPlayers(updatedPlayers);
      savePlayers(updatedPlayers).then((ok) =>
        setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
      );

      // Update formations if category changed
      if (editingPlayer.category !== editPlayer.category) {
        // Remove from old category formation
        const oldFormation = getFormationForCategory(editingPlayer.category);
        updateFormation(editingPlayer.category, {
          startingPlayers: oldFormation.startingPlayers.filter(p => p.id !== editingPlayer.id),
          substitutes: oldFormation.substitutes.filter(p => p.id !== editingPlayer.id)
        });
      } else {
        // Update name in current formation
        const formation = getFormationForCategory(editPlayer.category);
        updateFormation(editPlayer.category, {
          startingPlayers: formation.startingPlayers.map(p =>
            p.id === editingPlayer.id ? updatedPlayer : p
          ),
          substitutes: formation.substitutes.map(p =>
            p.id === editingPlayer.id ? updatedPlayer : p
          )
        });
      }

      setIsEditModalOpen(false);
      setEditingPlayer(null);
      window.dispatchEvent(new Event('playersUpdated'));
    }
  };

  const handleDeletePlayer = (id: string) => {
    const playerToDelete = players.find(p => p.id === id);
    if (playerToDelete) {
      // Remove from formations
      const formation = getFormationForCategory(playerToDelete.category);
      updateFormation(playerToDelete.category, {
        startingPlayers: formation.startingPlayers.filter(p => p.id !== id),
        substitutes: formation.substitutes.filter(p => p.id !== id)
      });
    }

    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers).then((ok) =>
      setSyncMessage(ok ? `Sinkron server: ${new Date().toLocaleTimeString('id-ID')}` : 'Sinkron server gagal, data tersimpan lokal.')
    );
    window.dispatchEvent(new Event('playersUpdated'));
  };

  // Formation functions
  const getFormationForCategory = (category: TeamCategory) => {
    return formations.find(f => f.category === category) || {
      id: category,
      category,
      coach: '',
      startingPlayers: [],
      substitutes: [],
      lastUpdated: new Date().toISOString()
    };
  };

  const updateFormation = (category: TeamCategory, updates: Partial<Formation>) => {
    setFormations(prev => {
      const updated = prev.map(f =>
        f.category === category ? { ...f, ...updates, lastUpdated: new Date().toISOString() } : f
      );
      localStorage.setItem('citramudafc_formations', JSON.stringify(updated));
      return updated;
    });
  };

  const addStarter = (category: TeamCategory, player: Player) => {
    const formation = getFormationForCategory(category);
    if (formation.startingPlayers.some(p => p.id === player.id)) return;

    updateFormation(category, {
      startingPlayers: [...formation.startingPlayers, player],
      substitutes: formation.substitutes.filter(p => p.id !== player.id)
    });
  };

  const addSubstitute = (category: TeamCategory, player: Player) => {
    const formation = getFormationForCategory(category);
    if (formation.substitutes.some(p => p.id === player.id)) return;

    updateFormation(category, {
      substitutes: [...formation.substitutes, player],
      startingPlayers: formation.startingPlayers.filter(p => p.id !== player.id)
    });
  };

  const getFormationCoordinates = (position: Position, count: number) => {
    const rows =
      count === 1 ? ['50%'] :
      count === 2 ? ['40%', '60%'] :
      count === 3 ? ['25%', '50%', '75%'] :
      ['20%', '40%', '60%', '80%'];

    const x = position === 'GK'
      ? '10%'
      : position === 'DF'
      ? '28%'
      : position === 'MF'
      ? '50%'
      : '75%';

    return rows.map(top => ({ top, left: x }));
  };

  const renderFieldFormation = (category: TeamCategory) => {
    const formation = getFormationForCategory(category);
    const categoryPlayers = players.filter(p => p.category === category);
    const gkPlayers = formation.startingPlayers.filter(p => p.position === 'GK');
    const dfPlayers = formation.startingPlayers.filter(p => p.position === 'DF');
    const mfPlayers = formation.startingPlayers.filter(p => p.position === 'MF');
    const fwPlayers = formation.startingPlayers.filter(p => p.position === 'FW');
    const positions = [
      ...gkPlayers.map((player, index) => ({ player, pos: getFormationCoordinates('GK', gkPlayers.length)[index] || { top: '50%', left: '10%' } })),
      ...dfPlayers.map((player, index) => ({ player, pos: getFormationCoordinates('DF', dfPlayers.length)[index] || { top: '50%', left: '28%' } })),
      ...mfPlayers.map((player, index) => ({ player, pos: getFormationCoordinates('MF', mfPlayers.length)[index] || { top: '50%', left: '50%' } })),
      ...fwPlayers.map((player, index) => ({ player, pos: getFormationCoordinates('FW', fwPlayers.length)[index] || { top: '50%', left: '75%' } })),
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Formation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-glow">{category} - Formasi</h3>
            <p className="text-white/50 mt-1">Susunan pemain dan formasi lapangan</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Coach"
                value={formation.coach}
                onChange={(e) => updateFormation(category, { coach: capitalizeInput(e.target.value) })}
                className="bg-white/10 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
              />
              <button
                onClick={() => updateFormation(category, { startingPlayers: [], substitutes: [], coach: '' })}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors"
                title="Reset Formasi"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Coach Display */}
        {formation.coach && (
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-electric-green/20 rounded-full flex items-center justify-center">
                <span className="text-electric-green font-bold">C</span>
              </div>
              <div>
                <p className="text-sm text-white/60">Pelatih</p>
                <p className="font-bold text-electric-green">{formation.coach}</p>
              </div>
            </div>
          </div>
        )}

        {/* Soccer Field */}
        <div className="relative">
          <div className="aspect-[3/2] bg-green-600 rounded-2xl border-4 border-white/20 overflow-hidden relative">
            {/* Field markings */}
            <div className="absolute inset-0">
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>

              {/* Center line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-white/30"></div>

              {/* Penalty areas */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-24 h-48 border-2 border-white/30"></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-48 border-2 border-white/30"></div>

              {/* Goal areas */}
              <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-28 border-2 border-white/30"></div>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-12 h-28 border-2 border-white/30"></div>
            </div>

            {/* Starting Players Positions */}
            {positions.map(({ player, pos }) => (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold cursor-pointer transition-all text-red-400",
                  getPositionColor(player.position)
                )}>
                  {player.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Substitutes */}
        <div className="glass p-6 rounded-2xl">
          <h4 className="text-lg font-bold mb-4">Pemain Cadangan</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formation.substitutes.map((player) => (
              <div key={player.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                <div className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold",
                  getPositionColor(player.position)
                )}>
                  {player.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-white/40">{player.position}</p>
                </div>
              </div>
            ))}
          </div>
          {formation.substitutes.length === 0 && (
            <p className="text-white/40 text-center py-4">Belum ada pemain cadangan</p>
          )}
        </div>

        {/* Formation Management */}
        {isAdmin && (
          <div className="glass p-6 rounded-2xl">
            <h4 className="text-lg font-bold mb-4">Kelola Formasi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-3">Pemain Tersedia ({categoryPlayers.length})</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categoryPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <span className="text-sm">{player.name} ({player.position})</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => addStarter(category, player)}
                          className={cn(
                            "text-xs px-2 py-1 rounded",
                            formation.startingPlayers.some(p => p.id === player.id)
                              ? "bg-white/10 text-white cursor-not-allowed"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          )}
                          disabled={formation.startingPlayers.length >= 11 || formation.startingPlayers.some(p => p.id === player.id)}
                        >
                          Starter
                        </button>
                        <button
                          onClick={() => addSubstitute(category, player)}
                          className={cn(
                            "text-xs px-2 py-1 rounded",
                            formation.substitutes.some(p => p.id === player.id)
                              ? "bg-white/10 text-white cursor-not-allowed"
                              : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          )}
                          disabled={formation.substitutes.some(p => p.id === player.id)}
                        >
                          Cadangan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Formasi Saat Ini</h5>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-green-400 mb-1">Starter ({formation.startingPlayers.length}/11)</p>
                    <div className="flex flex-wrap gap-1">
                      {formation.startingPlayers.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            updateFormation(category, {
                              startingPlayers: formation.startingPlayers.filter(p => p.id !== player.id),
                              substitutes: [...formation.substitutes, player]
                            });
                          }}
                          className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded"
                        >
                          {player.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-400 mb-1">Cadangan ({formation.substitutes.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {formation.substitutes.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            updateFormation(category, {
                              substitutes: formation.substitutes.filter(p => p.id !== player.id),
                              startingPlayers: [...formation.startingPlayers, player]
                            });
                          }}
                          className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                        >
                          {player.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  useEffect(() => {
    localStorage.setItem('citramudafc_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    const syncFromServer = async () => {
      const serverPlayers = await loadPlayers();
      if (serverPlayers) {
        setPlayers(serverPlayers);
        setSyncMessage(`Sinkron server: ${new Date().toLocaleTimeString('id-ID')}`);
      }
    };

    syncFromServer();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-glow">Daftar Pemain</h2>
          <p className="text-white/50 mt-1">Manajemen roster pemain Citra Muda FC lintas kategori.</p>
          {syncMessage && <p className="text-[11px] text-white/40 mt-2">{syncMessage}</p>}
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-electric-green text-black font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
          >
            <UserPlus size={20} />
            Tambah Pemain
          </button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input
            type="text"
            placeholder="Cari nama pemain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-electric-green/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border",
                selectedCategory === cat 
                  ? "bg-electric-green/20 text-electric-green border-electric-green/30" 
                  : "bg-white/10 text-white/60 border-white/10 hover:bg-white/15"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* View Toggle */}
        {selectedCategory !== 'Semua' && (
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                viewMode === 'list' ? "bg-electric-green/20 text-electric-green" : "text-white/60 hover:text-white"
              )}
            >
              <List size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode('formation')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                viewMode === 'formation' ? "bg-electric-green/20 text-electric-green" : "text-white/60 hover:text-white"
              )}
            >
              <Grid3X3 size={16} />
              Formasi
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {selectedCategory === 'Semua' || viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player, index) => (
              <motion.div
                layout
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="glass p-6 rounded-2xl group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-black tracking-tighter border",
                    getPositionColor(player.position)
                  )}>
                    {player.position}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditPlayer(player)}
                        className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/20">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-electric-green transition-colors">{player.name}</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{player.category}</p>
                  </div>
                </div>

                <div className="absolute -right-2 -bottom-2 text-white/5 font-black text-6xl italic pointer-events-none">
                  {player.position}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        renderFieldFormation(selectedCategory as TeamCategory)
      )}

      {filteredPlayers.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl">
          <Users size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40">Tidak ada pemain yang ditemukan.</p>
        </div>
      )}

      {/* Add Player Modal */}
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
                <h3 className="text-xl font-bold text-glow">Tambah Pemain Baru</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nama Pemain</label>
                  <input
                    type="text"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({...newPlayer, name: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Masukkan nama pemain"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Posisi</label>
                  <select
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value as Position})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Kategori Tim</label>
                  <select
                    value={newPlayer.category}
                    onChange={(e) => setNewPlayer({...newPlayer, category: e.target.value as TeamCategory})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    {categories.filter(cat => cat !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                    onClick={handleAddPlayer}
                    className="flex-1 py-3 bg-electric-green text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Player Modal */}
        {isEditModalOpen && editingPlayer && (
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
                <h3 className="text-xl font-bold text-glow">Edit Pemain</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nama Pemain</label>
                  <input
                    type="text"
                    value={editPlayer.name}
                    onChange={(e) => setEditPlayer({...editPlayer, name: capitalizeInput(e.target.value)})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Masukkan nama pemain"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Posisi</label>
                  <select
                    value={editPlayer.position}
                    onChange={(e) => setEditPlayer({...editPlayer, position: e.target.value as Position})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Kategori Tim</label>
                  <select
                    value={editPlayer.category}
                    onChange={(e) => setEditPlayer({...editPlayer, category: e.target.value as TeamCategory})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    {categories.filter(cat => cat !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                    onClick={handleUpdatePlayer}
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

export default PlayerRoster;
