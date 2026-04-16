import React, { useState, useEffect } from 'react';
import { ClipboardCheck, User, Send, Clock, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Attendance } from '../types';
import { cn, titleCase } from '../lib/utils';

interface AttendanceFormProps {
  isAdmin: boolean;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ isAdmin }) => {
  const [name, setName] = useState('');
  const [attendees, setAttendees] = useState<Attendance[]>(() => {
    try {
      const saved = localStorage.getItem('citramudafc_attendees');
      return saved ? JSON.parse(saved) as Attendance[] : [
        { id: '1', name: 'Ahmad Fauzi', timestamp: '2024-05-15 15:30' },
        { id: '2', name: 'Budi Santoso', timestamp: '2024-05-15 15:35' },
      ];
    } catch {
      return [
        { id: '1', name: 'Ahmad Fauzi', timestamp: '2024-05-15 15:30' },
        { id: '2', name: 'Budi Santoso', timestamp: '2024-05-15 15:35' },
      ];
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingSchedule, setTrainingSchedule] = useState<{ days: string; time: string }>(() => {
    try {
      const saved = localStorage.getItem('citramudafc_training_schedule');
      return saved ? JSON.parse(saved) : { days: 'Selasa & Kamis', time: '16:00 - 18:00 WIB' };
    } catch {
      return { days: 'Selasa & Kamis', time: '16:00 - 18:00 WIB' };
    }
  });
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState({ days: trainingSchedule.days, time: trainingSchedule.time });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAttendance: Attendance = {
        id: Date.now().toString(),
        name: titleCase(name.trim()),
        timestamp: new Date().toLocaleString('id-ID', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setAttendees([newAttendance, ...attendees]);
      setName('');
      setIsSubmitting(false);
    }, 800);
  };

  const removeAttendance = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const handleEditSchedule = () => {
    setEditSchedule({ days: trainingSchedule.days, time: trainingSchedule.time });
    setIsEditScheduleOpen(true);
  };

  const handleUpdateSchedule = () => {
    if (editSchedule.days.trim() && editSchedule.time.trim()) {
      setTrainingSchedule({ days: editSchedule.days.trim(), time: editSchedule.time.trim() });
      setIsEditScheduleOpen(false);
    }
  };

  const handleDeleteSchedule = () => {
    setTrainingSchedule({ days: '', time: '' });
  };

  useEffect(() => {
    localStorage.setItem('citramudafc_attendees', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('citramudafc_training_schedule', JSON.stringify(trainingSchedule));
  }, [trainingSchedule]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <header>
          <h2 className="text-3xl font-bold text-glow">Presensi Latihan</h2>
          <p className="text-white/50 mt-1">Silakan isi nama lengkap Anda untuk konfirmasi kehadiran latihan hari ini.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-3xl relative overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-electric-green/50 transition-colors text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                isSubmitting 
                  ? "bg-white/10 text-white/40 cursor-not-allowed" 
                  : "bg-electric-green text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Kirim Kehadiran
                </>
              )}
            </button>
          </form>
          <div className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none">
            <ClipboardCheck size={200} />
          </div>
        </motion.div>

        <div className="glass p-6 rounded-2xl flex items-center justify-between gap-4 border-l-4 border-electric-green group relative">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 bg-electric-green/10 rounded-xl">
              <Clock className="text-electric-green" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Waktu Latihan</p>
              {trainingSchedule.days && trainingSchedule.time ? (
                <p className="text-white/50 text-xs">{trainingSchedule.days}, {trainingSchedule.time}</p>
              ) : (
                <p className="text-white/30 text-xs italic">Belum ada jadwal latihan</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEditSchedule}
                className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDeleteSchedule}
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Edit Schedule Modal */}
        <AnimatePresence>
          {isEditScheduleOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsEditScheduleOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass p-6 rounded-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-glow">Edit Waktu Latihan</h3>
                  <button
                    onClick={() => setIsEditScheduleOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Hari Latihan</label>
                    <input
                      type="text"
                      value={editSchedule.days}
                      onChange={(e) => setEditSchedule({...editSchedule, days: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                      placeholder="Contoh: Senin & Rabu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Jam Latihan</label>
                    <input
                      type="text"
                      value={editSchedule.time}
                      onChange={(e) => setEditSchedule({...editSchedule, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                      placeholder="Contoh: 17:00 - 19:00 WIB"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditScheduleOpen(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleUpdateSchedule}
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Daftar Hadir Hari Ini</h3>
          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-white/40">
            {attendees.length} Orang
          </span>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
          <AnimatePresence initial={false}>
            {attendees.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass p-4 rounded-2xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white/30">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold group-hover:text-electric-green transition-colors">{a.name}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{a.timestamp}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => removeAttendance(a.id)}
                    className="p-2 text-white/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {attendees.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-white/20 italic">Belum ada yang mengisi presensi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
