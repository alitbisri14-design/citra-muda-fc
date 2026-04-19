import { Attendance } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const loadAttendances = async (): Promise<Attendance[] | null> => {
  const response = await fetch(`${apiBaseUrl}/attendance`);
  if (!response.ok) return null;

  return (await response.json()) as Attendance[];
};

export const saveAttendance = async (attendance: Attendance): Promise<boolean> => {
  const response = await fetch(`${apiBaseUrl}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attendance),
  });

  return response.ok;
};

export const deleteAttendance = async (id: string): Promise<boolean> => {
  const response = await fetch(`${apiBaseUrl}/attendance/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  return response.ok;
};
