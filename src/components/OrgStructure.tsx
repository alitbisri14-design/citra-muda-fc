import React, { useState, useEffect } from "react";
import { User, Shield, Briefcase, Edit2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_STAFF } from "../mockData";
import { Staff } from "../types";
import { titleCase } from "../lib/utils";

interface OrgStructureProps {
  isAdmin: boolean;
}

const OrgStructure: React.FC<OrgStructureProps> = ({ isAdmin }) => {
  const [staff, setStaff] = useState<Staff[]>(() => {
    try {
      const saved = localStorage.getItem("citramudafc_staff");
      return saved ? (JSON.parse(saved) as Staff[]) : MOCK_STAFF;
    } catch {
      return MOCK_STAFF;
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "" });

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "" });

  const ketua = staff.find((s) => s.level === 0);
  const wakil = staff.find((s) => s.level === 1);
  const staffMembers = staff.filter((s) => s.level === 2);

  const handleEditStaff = (person: Staff) => {
    setEditingStaff(person);
    setEditForm({ name: person.name, role: person.role });
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = () => {
    if (editingStaff && editForm.name.trim() && editForm.role.trim()) {
      setStaff(
        staff.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                name: titleCase(editForm.name.trim()),
                role: titleCase(editForm.role.trim()),
              }
            : s,
        ),
      );
      setIsEditModalOpen(false);
      setEditingStaff(null);
    }
  };

  const handleAddStaff = () => {
    if (newStaff.name.trim() && newStaff.role.trim()) {
      const addedStaff: Staff = {
        id: Date.now().toString(),
        name: titleCase(newStaff.name.trim()),
        role: titleCase(newStaff.role.trim()),
        level: 2,
      };
      setStaff([...staff, addedStaff]);
      setNewStaff({ name: "", role: "" });
      setIsAddStaffOpen(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("citramudafc_staff", JSON.stringify(staff));
  }, [staff]);

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-3xl font-bold text-glow">Struktur Organisasi</h2>
        <p className="text-white/50 mt-1">
          Hierarki kepengurusan Citra Muda FC periode 2024-2026.
        </p>
      </header>

      <div className="flex flex-col items-center gap-12">
        {isAdmin && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-electric-green text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Tambah Anggota
            </button>
          </div>
        )}

        {/* Ketua Section */}
        {ketua && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="glass p-8 rounded-3xl border-2 border-electric-green/50 shadow-lg text-center w-64 relative group">
              {isAdmin && (
                <button
                  onClick={() => handleEditStaff(ketua)}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 size={16} className="text-electric-green" />
                </button>
              )}
              <div className="w-20 h-20 bg-electric-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-electric-green/30 group-hover:border-electric-green/60 transition-colors">
                <Shield
                  className="text-white/60 group-hover:text-electric-green group-hover:scale-110 transition-all"
                  size={40}
                />
              </div>
              <h3 className="text-xl font-bold text-electric-green">
                {ketua.name}
              </h3>
              <p className="text-white/40 text-sm uppercase tracking-widest mt-1">
                {ketua.role}
              </p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-electric-green to-white/10" />
          </motion.div>
        )}

        {/* Wakil Section */}
        {wakil && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="glass p-6 rounded-3xl border border-white/20 text-center w-56 relative group">
              {isAdmin && (
                <button
                  onClick={() => handleEditStaff(wakil)}
                  className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 size={14} className="text-white/60" />
                </button>
              )}
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-electric-green/30 transition-colors">
                <User
                  className="text-white/60 group-hover:text-electric-green transition-colors"
                  size={32}
                />
              </div>
              <h3 className="text-lg font-bold text-electric-green">
                {wakil.name}
              </h3>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
                {wakil.role}
              </p>
            </div>
            <div className="w-px h-12 bg-white/10" />
          </motion.div>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {staffMembers.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass p-6 rounded-2xl text-center relative group"
            >
              {isAdmin && (
                <button
                  onClick={() => handleEditStaff(s)}
                  className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 size={14} className="text-white/40" />
                </button>
              )}
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-electric-green/30 transition-colors">
                <Briefcase
                  className="text-white/40 group-hover:text-electric-green group-hover:scale-110 transition-all"
                  size={24}
                />
              </div>
              <h4 className="font-bold text-electric-green">{s.name}</h4>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
                {s.role}
              </p>

              {index === 0 && (
                <div className="hidden md:block absolute -top-12 left-1/2 w-px h-12 bg-white/10" />
              )}
              {index === 1 && (
                <div className="hidden md:block absolute -top-12 left-1/2 w-px h-12 bg-white/10" />
              )}
              {index === 2 && (
                <div className="hidden md:block absolute -top-12 left-1/2 w-px h-12 bg-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingStaff && (
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
                <h3 className="text-xl font-bold text-glow">
                  Edit{" "}
                  {editingStaff.level === 0
                    ? "Ketua"
                    : editingStaff.level === 1
                      ? "Wakil Ketua"
                      : "Staff"}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50"
                    placeholder="Masukkan jabatan"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateStaff}
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

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddStaffOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-glow">
                  Tambah Anggota Organisasi
                </h3>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, role: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50"
                    placeholder="Misal: Sekretaris"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddStaffOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddStaff}
                    className="flex-1 py-3 bg-electric-green text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Tambah
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

export default OrgStructure;
