export type NewOrderInfo = {
  id: string;
  total: number;
  customerName: string;
  itemCount: number;
};

const STORAGE_KEY = 'iii_monks_seen_order_ids';
const MAX_SEEN = 400;

export const notificationsSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

const loadSeen = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveSeen = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-MAX_SEEN)));
  } catch {}
};

export const markOrdersSeen = (ids: string[]) => {
  const seen = loadSeen();
  const merged = Array.from(new Set([...seen, ...ids]));
  saveSeen(merged);
};

export const findNewOrders = (orders: NewOrderInfo[]): NewOrderInfo[] => {
  const seen = new Set(loadSeen());
  return orders.filter(o => !seen.has(o.id));
};

let audioCtx: AudioContext | null = null;

const playBeep = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx!.state === 'suspended') audioCtx!.resume();
    const now = audioCtx!.currentTime;
    [0, 0.18].forEach((offset, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 0 ? 880 : 1180;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.17);
    });
  } catch {}
};

const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const notifyNewOrder = (order: NewOrderInfo) => {
  playBeep();

  if (notificationPermission() !== 'granted') return;

  const body = `${order.customerName || 'Customer'} • ${inr(order.total)} • ${order.itemCount} item${order.itemCount === 1 ? '' : 's'}`;

  try {
    const n = new Notification(`New order ${order.id}`, {
      body,
      tag: order.id,
      icon: '/logo.png',
      badge: '/logo.png',
      silent: true,
    } as NotificationOptions);
    n.onclick = () => {
      window.focus();
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin';
      }
      n.close();
    };
    return;
  } catch {}

  try {
    const sw = (navigator as any).serviceWorker;
    if (sw?.ready) {
      sw.ready.then((reg: any) =>
        reg.showNotification(`New order ${order.id}`, {
          body,
          tag: order.id,
          icon: '/logo.png',
          badge: '/logo.png',
          silent: true,
        })
      );
    }
  } catch {}
};
