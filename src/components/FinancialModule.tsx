import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_TRANSACTIONS } from '../mockData';
import { Transaction } from '../types';
import { cn, titleCase } from '../lib/utils';

interface FinancialModuleProps {
  isAdmin: boolean;
}

const FinancialModule: React.FC<FinancialModuleProps> = ({ isAdmin }) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [newTransaction, setNewTransaction] = useState({
    date: '',
    description: '',
    amount: 0,
    type: 'income' as 'income' | 'expense'
  });

  const [editTransaction, setEditTransaction] = useState({
    date: '',
    description: '',
    amount: 0,
    type: 'income' as 'income' | 'expense'
  });

  // Sort transactions by date (newest first)
  const sortTransactionsByDate = (transactionsToSort: Transaction[]) => {
    return [...transactionsToSort].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // State for transactions with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('citramudafc_transactions');
    const data = saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
    return sortTransactionsByDate(data);
  });

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('citramudafc_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handlers
  const handleAddTransaction = () => {
    if (newTransaction.description.trim() && newTransaction.date && newTransaction.amount > 0) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: newTransaction.date,
        description: titleCase(newTransaction.description.trim()),
        amount: newTransaction.amount,
        type: newTransaction.type
      };

      const updatedTransactions = sortTransactionsByDate([...transactions, transaction]);
      setTransactions(updatedTransactions);

      // Reset form
      setNewTransaction({
        date: '',
        description: '',
        amount: 0,
        type: 'income'
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = () => {
    if (editingTransaction && editTransaction.description.trim() && editTransaction.date && editTransaction.amount > 0) {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        date: editTransaction.date,
        description: titleCase(editTransaction.description.trim()),
        amount: editTransaction.amount,
        type: editTransaction.type
      };

      const updatedTransactions = sortTransactionsByDate(
        transactions.map(tx => tx.id === editingTransaction.id ? updatedTransaction : tx)
      );
      setTransactions(updatedTransactions);

      setIsEditModalOpen(false);
      setEditingTransaction(null);
    }
  };

  const removeTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(tx => tx.id !== id);
    setTransactions(updatedTransactions);
  };

  const handleResetTransactions = () => {
    if (!isAdmin) return;
    const confirmReset = window.confirm('Reset semua riwayat transaksi? Ini akan menghapus semua pemasukan dan pengeluaran sebelumnya.');
    if (confirmReset) {
      setTransactions([]);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t =>
    filter === 'all' || t.type === filter
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-glow">Kas Keuangan</h2>
          <p className="text-white/50 mt-1">Laporan pemasukan dan pengeluaran Citra Muda FC.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-electric-green text-black font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
          >
            <Plus size={20} />
            Catat Transaksi
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-sm font-medium">Total Pemasukan</p>
            <ArrowUpRight className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-400">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-sm font-medium">Total Pengeluaran</p>
            <ArrowDownLeft className="text-red-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-400">Rp {totalExpense.toLocaleString('id-ID')}</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-electric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-sm font-medium">Saldo Akhir</p>
            <Wallet className="text-electric-green" size={20} />
          </div>
          <p className="text-2xl font-bold text-electric-green">Rp {balance.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg">Riwayat Transaksi</h3>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                {f === 'all' ? 'Semua' : f === 'income' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={handleResetTransactions}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Deskripsi</th>
                <th className="px-6 py-4 font-bold">Tipe</th>
                <th className="px-6 py-4 font-bold text-right">Jumlah</th>
                {isAdmin && <th className="px-6 py-4 font-bold text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm text-white/60">{tx.date}</td>
                  <td className="px-6 py-4 font-medium">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter",
                      tx.type === 'income' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-bold text-right",
                    tx.type === 'income' ? "text-green-400" : "text-red-400"
                  )}>
                    {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          className="p-2 text-white/20 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => removeTransaction(tx.id)}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
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
                <h3 className="text-xl font-bold text-glow">Catat Transaksi Baru</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Deskripsi</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Deskripsi transaksi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Jumlah (Rp)</label>
                  <input
                    type="number"
                    value={newTransaction.amount || ''}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipe Transaksi</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
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
                    onClick={handleAddTransaction}
                    className="flex-1 py-3 bg-electric-green text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Catat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Transaction Modal */}
        {isEditModalOpen && editingTransaction && (
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
                <h3 className="text-xl font-bold text-glow">Edit Transaksi</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={editTransaction.date}
                    onChange={(e) => setEditTransaction({...editTransaction, date: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Deskripsi</label>
                  <input
                    type="text"
                    value={editTransaction.description}
                    onChange={(e) => setEditTransaction({...editTransaction, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="Deskripsi transaksi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Jumlah (Rp)</label>
                  <input
                    type="number"
                    value={editTransaction.amount || ''}
                    onChange={(e) => setEditTransaction({...editTransaction, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Tipe Transaksi</label>
                  <select
                    value={editTransaction.type}
                    onChange={(e) => setEditTransaction({...editTransaction, type: e.target.value as 'income' | 'expense'})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-electric-green/50 transition-colors"
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
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
                    onClick={handleUpdateTransaction}
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

export default FinancialModule;
