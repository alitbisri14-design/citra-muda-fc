type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface SubscribeOptions {
  onChange: () => void;
  onStatus?: (status: string) => void;
}

export const subscribeAttendanceRealtime = ({ onChange, onStatus }: SubscribeOptions) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const table = import.meta.env.VITE_SUPABASE_ATTENDANCE_TABLE ?? 'attendances';
  const schema = import.meta.env.VITE_SUPABASE_SCHEMA ?? 'public';

  if (!supabaseUrl || !supabaseAnonKey) {
    onStatus?.('Supabase Realtime belum dikonfigurasi.');
    return () => undefined;
  }

  const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  const socket = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${supabaseAnonKey}&vsn=1.0.0`);
  const topic = `realtime:${schema}:${table}`;

  const push = (payload: unknown) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  };

  socket.addEventListener('open', () => {
    onStatus?.('Realtime terhubung.');
    push({
      topic,
      event: 'phx_join',
      payload: {
        config: {
          postgres_changes: (['INSERT', 'UPDATE', 'DELETE'] as ChangeEvent[]).map((event) => ({
            event,
            schema,
            table,
          })),
          broadcast: { ack: false, self: false },
          presence: { key: '' },
        },
      },
      ref: '1',
    });
  });

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data) as { event?: string };
      if (data.event === 'postgres_changes') {
        onChange();
      }
    } catch {
      onStatus?.('Pesan realtime tidak bisa diproses.');
    }
  });

  socket.addEventListener('close', () => {
    onStatus?.('Realtime terputus.');
  });

  socket.addEventListener('error', () => {
    onStatus?.('Koneksi realtime error.');
  });

  const heartbeat = window.setInterval(() => {
    push({
      topic: 'phoenix',
      event: 'heartbeat',
      payload: {},
      ref: String(Date.now()),
    });
  }, 30000);

  return () => {
    window.clearInterval(heartbeat);
    push({
      topic,
      event: 'phx_leave',
      payload: {},
      ref: '2',
    });
    socket.close();
  };
};
