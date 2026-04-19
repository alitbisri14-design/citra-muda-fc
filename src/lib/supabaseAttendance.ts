import { Attendance } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const attendanceTable = import.meta.env.VITE_SUPABASE_ATTENDANCE_TABLE ?? 'attendances';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const getHeaders = () => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

export const saveAttendanceToSupabase = async (attendance: Attendance): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;

  const response = await fetch(`${supabaseUrl}/rest/v1/${attendanceTable}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(attendance),
  });

  return response.ok;
};

export const loadAttendancesFromSupabase = async (): Promise<Attendance[] | null> => {
  if (!isSupabaseConfigured) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${attendanceTable}?select=id,name,timestamp&order=timestamp.desc`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Attendance[];
  return data;
};
