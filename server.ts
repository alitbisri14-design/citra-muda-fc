import * as express from 'express';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ALLOWED_ORIGIN = 'http://localhost:3000';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  next();
});

const adminEmail = 'cmudafc@gmail.com';
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAttendanceTable = process.env.SUPABASE_ATTENDANCE_TABLE ?? 'attendances';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

interface AttendancePayload {
  id: string;
  name: string;
  timestamp: string;
}

const getSupabaseHeaders = () => ({
  apikey: supabaseServiceRoleKey as string,
  Authorization: `Bearer ${supabaseServiceRoleKey}`,
  'Content-Type': 'application/json',
});

app.options('*', (req, res) => {
  res.sendStatus(204);
});

app.get('/attendance', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(500).json({ message: 'Supabase belum dikonfigurasi di server.' });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${supabaseAttendanceTable}?select=id,name,timestamp&order=timestamp.desc`,
      {
        method: 'GET',
        headers: getSupabaseHeaders(),
      }
    );

    if (!response.ok) {
      return res.status(500).json({ message: 'Gagal mengambil data presensi dari Supabase.' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Load attendance failed:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil presensi.' });
  }
});

app.post('/attendance', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(500).json({ message: 'Supabase belum dikonfigurasi di server.' });
  }

  const payload = req.body as AttendancePayload;
  if (!payload?.id || !payload?.name || !payload?.timestamp) {
    return res.status(400).json({ message: 'Payload presensi tidak valid.' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseAttendanceTable}`, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(500).json({ message: 'Gagal menyimpan presensi ke Supabase.' });
    }

    return res.status(201).json({ message: 'Presensi berhasil disimpan.' });
  } catch (error) {
    console.error('Save attendance failed:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan presensi.' });
  }
});

app.delete('/attendance/:id', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(500).json({ message: 'Supabase belum dikonfigurasi di server.' });
  }

  const attendanceId = req.params.id;
  if (!attendanceId) {
    return res.status(400).json({ message: 'ID presensi tidak valid.' });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${supabaseAttendanceTable}?id=eq.${encodeURIComponent(attendanceId)}`,
      {
        method: 'DELETE',
        headers: {
          ...getSupabaseHeaders(),
          Prefer: 'return=minimal',
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({ message: 'Gagal menghapus presensi di Supabase.' });
    }

    return res.json({ message: 'Presensi berhasil dihapus.' });
  } catch (error) {
    console.error('Delete attendance failed:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat menghapus presensi.' });
  }
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email tidak valid.' });
  }

  if (email.trim().toLowerCase() !== adminEmail) {
    return res.status(400).json({ message: `Hanya email admin ${adminEmail} yang diizinkan.` });
  }

  if (!isSmtpConfigured) {
    return res.status(500).json({ message: 'SMTP belum dikonfigurasi. Periksa variabel lingkungan.' });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(email.trim().toLowerCase(), { otp, expiresAt });

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: email,
      subject: 'Kode OTP Reset Password Citra Muda FC',
      text: `Kode OTP Anda: ${otp}. Kode ini berlaku selama 5 menit.`,
      html: `<p>Kode OTP Anda: <strong>${otp}</strong></p><p>Kode ini berlaku selama 5 menit.</p>`,
    });

    return res.json({ message: 'OTP berhasil dikirim.' });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ message: 'Gagal mengirim OTP. Periksa konfigurasi SMTP.' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  const stored = email && typeof email === 'string' ? otpStore.get(email.trim().toLowerCase()) : undefined;

  if (!stored || !otp || typeof otp !== 'string') {
    return res.status(400).json({ message: 'Kode OTP tidak valid.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.trim().toLowerCase());
    return res.status(400).json({ message: 'Kode OTP sudah kedaluwarsa.' });
  }

  if (stored.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Kode OTP salah.' });
  }

  otpStore.delete(email.trim().toLowerCase());
  return res.json({ message: 'OTP valid.' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`OTP server running at http://localhost:${PORT}`);
  if (!isSmtpConfigured) {
    console.warn('Warning: SMTP environment variables are not set. OTP email sending will fail until configured.');
  }
  if (!isSupabaseConfigured) {
    console.warn('Warning: Supabase environment variables are not set. Attendance sync API will fail until configured.');
  }
});
