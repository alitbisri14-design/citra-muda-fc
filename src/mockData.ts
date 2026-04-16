import { Player, Match, Transaction, Staff } from './types';

export const MOCK_PLAYERS: Player[] = [
  // Tim A - 13 pemain
  { id: '1', name: 'Ahmad Fauzi', position: 'GK', category: 'Tim A' },
  { id: '2', name: 'Budi Santoso', position: 'DF', category: 'Tim A' },
  { id: '3', name: 'Candra Wijaya', position: 'DF', category: 'Tim A' },
  { id: '4', name: 'Dedi Kurniawan', position: 'DF', category: 'Tim A' },
  { id: '5', name: 'Eko Prasetyo', position: 'DF', category: 'Tim A' },
  { id: '6', name: 'Fajar Ramadhan', position: 'MF', category: 'Tim A' },
  { id: '7', name: 'Gani Hardianto', position: 'MF', category: 'Tim A' },
  { id: '8', name: 'Haris Wijaya', position: 'MF', category: 'Tim A' },
  { id: '9', name: 'Irfan Susanto', position: 'MF', category: 'Tim A' },
  { id: '10', name: 'Jamal Wiranata', position: 'FW', category: 'Tim A' },
  { id: '11', name: 'Kasim Hartawan', position: 'FW', category: 'Tim A' },
  { id: '12', name: 'Luthfan Raihan', position: 'FW', category: 'Tim A' },
  { id: '13', name: 'Malik Subagja', position: 'GK', category: 'Tim A' },

  // Tim B - 13 pemain
  { id: '14', name: 'Nasir Ridho', position: 'GK', category: 'Tim B' },
  { id: '15', name: 'Oding Manurung', position: 'DF', category: 'Tim B' },
  { id: '16', name: 'Prabowo Subianto', position: 'DF', category: 'Tim B' },
  { id: '17', name: 'Rangga Pamungkas', position: 'DF', category: 'Tim B' },
  { id: '18', name: 'Satrio Handoko', position: 'DF', category: 'Tim B' },
  { id: '19', name: 'Taufan Nugraha', position: 'MF', category: 'Tim B' },
  { id: '20', name: 'Udin Hasibuan', position: 'MF', category: 'Tim B' },
  { id: '21', name: 'Vino Hermawan', position: 'MF', category: 'Tim B' },
  { id: '22', name: 'Wahyu Suryanto', position: 'MF', category: 'Tim B' },
  { id: '23', name: 'Xander Kirana', position: 'FW', category: 'Tim B' },
  { id: '24', name: 'Yoga Pratama', position: 'FW', category: 'Tim B' },
  { id: '25', name: 'Zaki Irfandi', position: 'FW', category: 'Tim B' },
  { id: '26', name: 'Andri Purnomo', position: 'GK', category: 'Tim B' },

  // Tim C - 13 pemain
  { id: '27', name: 'Bambang Suryanto', position: 'GK', category: 'Tim C' },
  { id: '28', name: 'Cahyo Hermanto', position: 'DF', category: 'Tim C' },
  { id: '29', name: 'Darmawan Kusuma', position: 'DF', category: 'Tim C' },
  { id: '30', name: 'Edi Sumarno', position: 'DF', category: 'Tim C' },
  { id: '31', name: 'Fuad Anwari', position: 'DF', category: 'Tim C' },
  { id: '32', name: 'Giri Sumarwoto', position: 'MF', category: 'Tim C' },
  { id: '33', name: 'Hendra Kusuma', position: 'MF', category: 'Tim C' },
  { id: '34', name: 'Imam Santoso', position: 'MF', category: 'Tim C' },
  { id: '35', name: 'Joko Susilo', position: 'MF', category: 'Tim C' },
  { id: '36', name: 'Karim Fadilah', position: 'FW', category: 'Tim C' },
  { id: '37', name: 'Lexi Anggara', position: 'FW', category: 'Tim C' },
  { id: '38', name: 'Marson Wijaya', position: 'FW', category: 'Tim C' },
  { id: '39', name: 'Nino Setiawan', position: 'GK', category: 'Tim C' },

  // Tim D - 13 pemain
  { id: '40', name: 'Okto Gunawan', position: 'GK', category: 'Tim D' },
  { id: '41', name: 'Pendra Wijaya', position: 'DF', category: 'Tim D' },
  { id: '42', name: 'Quit Hartono', position: 'DF', category: 'Tim D' },
  { id: '43', name: 'Roby Setiawan', position: 'DF', category: 'Tim D' },
  { id: '44', name: 'Sardi Hermawan', position: 'DF', category: 'Tim D' },
  { id: '45', name: 'Tedi Kurniawan', position: 'MF', category: 'Tim D' },
  { id: '46', name: 'Uji Prasetyo', position: 'MF', category: 'Tim D' },
  { id: '47', name: 'Vady Susanto', position: 'MF', category: 'Tim D' },
  { id: '48', name: 'Wendi Purnama', position: 'MF', category: 'Tim D' },
  { id: '49', name: 'Xian Hidayah', position: 'FW', category: 'Tim D' },
  { id: '50', name: 'Yusuf Abdillah', position: 'FW', category: 'Tim D' },
  { id: '51', name: 'Zamri Anwar', position: 'FW', category: 'Tim D' },
  { id: '52', name: 'Ardiansah Putra', position: 'GK', category: 'Tim D' },

  // Ladies - 13 pemain
  { id: '53', name: 'Siti Aminah', position: 'GK', category: 'Ladies' },
  { id: '54', name: 'Dewi Lestari', position: 'DF', category: 'Ladies' },
  { id: '55', name: 'Eka Putri', position: 'DF', category: 'Ladies' },
  { id: '56', name: 'Fifi Nurhayati', position: 'DF', category: 'Ladies' },
  { id: '57', name: 'Gita Setiawan', position: 'DF', category: 'Ladies' },
  { id: '58', name: 'Hana Kurnia', position: 'MF', category: 'Ladies' },
  { id: '59', name: 'Ira Marpaung', position: 'MF', category: 'Ladies' },
  { id: '60', name: 'Jini Wijayanti', position: 'MF', category: 'Ladies' },
  { id: '61', name: 'Karina Saptiana', position: 'MF', category: 'Ladies' },
  { id: '62', name: 'Lara Maharani', position: 'FW', category: 'Ladies' },
  { id: '63', name: 'Mita Kusuma', position: 'FW', category: 'Ladies' },
  { id: '64', name: 'Nani Pratiwi', position: 'FW', category: 'Ladies' },
  { id: '65', name: 'Oki Puspita', position: 'GK', category: 'Ladies' },

  // Remako A - 13 pemain
  { id: '66', name: 'Haji Lulung', position: 'GK', category: 'Remako A' },
  { id: '67', name: 'Pak Adi', position: 'DF', category: 'Remako A' },
  { id: '68', name: 'Pak Bambang', position: 'DF', category: 'Remako A' },
  { id: '69', name: 'Pak Catur', position: 'DF', category: 'Remako A' },
  { id: '70', name: 'Pak Dodi', position: 'DF', category: 'Remako A' },
  { id: '71', name: 'Pak Erfan', position: 'MF', category: 'Remako A' },
  { id: '72', name: 'Pak Fahri', position: 'MF', category: 'Remako A' },
  { id: '73', name: 'Pak Gunawan', position: 'MF', category: 'Remako A' },
  { id: '74', name: 'Pak Hadi', position: 'MF', category: 'Remako A' },
  { id: '75', name: 'Pak Irwin', position: 'FW', category: 'Remako A' },
  { id: '76', name: 'Pak Joko', position: 'FW', category: 'Remako A' },
  { id: '77', name: 'Pak Karyanto', position: 'FW', category: 'Remako A' },
  { id: '78', name: 'Pak Lesmono', position: 'GK', category: 'Remako A' },

  // Remako B - 13 pemain
  { id: '79', name: 'Pak RT', position: 'GK', category: 'Remako B' },
  { id: '80', name: 'Pak Mulyono', position: 'DF', category: 'Remako B' },
  { id: '81', name: 'Pak Nugroho', position: 'DF', category: 'Remako B' },
  { id: '82', name: 'Pak Ongko', position: 'DF', category: 'Remako B' },
  { id: '83', name: 'Pak Priyanto', position: 'DF', category: 'Remako B' },
  { id: '84', name: 'Pak Qurniawan', position: 'MF', category: 'Remako B' },
  { id: '85', name: 'Pak Rustam', position: 'MF', category: 'Remako B' },
  { id: '86', name: 'Pak Sutrisno', position: 'MF', category: 'Remako B' },
  { id: '87', name: 'Pak Taufiq', position: 'MF', category: 'Remako B' },
  { id: '88', name: 'Pak Usman', position: 'FW', category: 'Remako B' },
  { id: '89', name: 'Pak Vandi', position: 'FW', category: 'Remako B' },
  { id: '90', name: 'Pak Wantri', position: 'FW', category: 'Remako B' },
  { id: '91', name: 'Pak Yono', position: 'GK', category: 'Remako B' },
];

export const MOCK_MATCHES: Match[] = [
  { id: '1', opponent: 'Persija Jakarta', date: '2024-05-20', time: '15:30', location: 'Stadion Patriot', isHome: true },
  { id: '2', opponent: 'Persib Bandung', date: '2024-06-05', time: '19:00', location: 'Stadion GBLA', isHome: false },
  { id: '3', opponent: 'Arema FC', date: '2024-06-15', time: '16:00', location: 'Stadion Kanjuruhan', isHome: true },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-05-01', description: 'Iuran Bulanan Mei', amount: 2500000, type: 'income' },
  { id: '2', date: '2024-05-05', description: 'Sewa Lapangan Latihan', amount: 500000, type: 'expense' },
  { id: '3', date: '2024-05-10', description: 'Sponsor Apparel', amount: 10000000, type: 'income' },
  { id: '4', date: '2024-05-12', description: 'Beli Bola Baru', amount: 1200000, type: 'expense' },
];

export const MOCK_STAFF: Staff[] = [
  { id: '1', name: 'H. Mulyadi', role: 'Ketua Umum', level: 0 },
  { id: '2', name: 'Drs. Bambang', role: 'Wakil Ketua', level: 1 },
  { id: '3', name: 'Iwan Setiawan', role: 'Sekretaris', level: 2 },
  { id: '4', name: 'Rina Melati', role: 'Bendahara', level: 2 },
  { id: '5', name: 'Coach Jajang', role: 'Pelatih Kepala', level: 2 },
];
