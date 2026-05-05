import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, Play, Pause, Smile, Pencil, Check, X, User } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { apiFetch, BASE } from '../lib/api';

/* ─── Types ──────────────────────────────────────────────── */
interface UserProfile {
  name: string;
  gender: 'hombre' | 'mujer' | 'otro';
}

interface Message {
  id: string;
  user: string;
  text: string;
  isOwn: boolean;
  time: string;
  avatar: string;
  color: string;
}

/* ─── Constants ──────────────────────────────────────────── */
const STORAGE_KEY = 'cr_chat_profile';
const DEVICE_KEY  = 'cr_device_id';

const AVATAR_COLORS = [
  'rgba(224,176,0,0.9)',
  'rgba(100,165,255,0.9)',
  'rgba(255,100,130,0.9)',
  'rgba(70,220,155,0.9)',
  'rgba(200,100,255,0.9)',
  'rgba(255,160,60,0.9)',
];

const GENDER_OPTIONS: { value: UserProfile['gender']; label: string; emoji: string }[] = [
  { value: 'hombre', label: 'Hombre', emoji: '👨' },
  { value: 'mujer', label: 'Mujer', emoji: '👩' },
  { value: 'otro', label: 'Otro', emoji: '🧑' },
];

const initialMessages: Message[] = [
  {
    id: '1',
    user: 'JuanMX 🇲🇽',
    text: '🔥 Qué tema más clásico! Nos recuerda los 2000!',
    isOwn: false,
    time: '21:02',
    avatar: 'J',
    color: AVATAR_COLORS[0],
  },
  {
    id: '2',
    user: 'MariaCR 🇨🇷',
    text: 'Gasolina siempre pegando duro 🎵 saludos desde Costa Rica',
    isOwn: false,
    time: '21:04',
    avatar: 'M',
    color: AVATAR_COLORS[1],
  },
  {
    id: '3',
    user: 'CarlosRD 🇩🇴',
    text: 'Buenas noches desde República Dominicana! La mejor radio 🏆',
    isOwn: false,
    time: '21:06',
    avatar: 'C',
    color: AVATAR_COLORS[2],
  },
  {
    id: '5',
    user: 'SofíaCO 🇨🇴',
    text: 'Wisin & Yandel los reyes del perreo 👑👑',
    isOwn: false,
    time: '21:09',
    avatar: 'S',
    color: AVATAR_COLORS[4],
  },
  {
    id: '6',
    user: 'PedroVE 🇻🇪',
    text: 'Estos temas me llevan de vuelta a la infancia bro, pura nostalgia 🥺',
    isOwn: false,
    time: '21:11',
    avatar: 'P',
    color: AVATAR_COLORS[0],
  },
  {
    id: '7',
    user: 'AnaMX 🇲🇽',
    text: 'Daddy Yankee es el Big Boss para siempre ❤️‍🔥',
    isOwn: false,
    time: '21:13',
    avatar: 'A',
    color: AVATAR_COLORS[2],
  },
  {
    id: '8',
    user: 'LuisPR 🇵🇷',
    text: 'Desde Puerto Rico escuchando la mejor radio! 🎶🌴',
    isOwn: false,
    time: '21:15',
    avatar: 'L',
    color: AVATAR_COLORS[5],
  },
];

const QUICK_REACTIONS = ['🔥', '💛', '🎵', '👑', '❤️', '🙌'];

/* ─── Helpers ────────────────────────────────────────────── */
function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(p: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `d_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function genderEmoji(gender: UserProfile['gender']) {
  const found = GENDER_OPTIONS.find((g) => g.value === gender);
  return found?.emoji ?? '🧑';
}

/* ═══════════════════════════════════════════════════════════
   REGISTRATION SCREEN
═══════════════════════════════════════════════��══════════ */
interface RegistrationProps {
  onComplete: (profile: UserProfile) => void;
}

function RegistrationScreen({ onComplete }: RegistrationProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<UserProfile['gender'] | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    if (!gender) {
      setError('Por favor selecciona tu género');
      return;
    }
    const profile: UserProfile = { name: trimmed, gender: gender as UserProfile['gender'] };
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ height: 'calc(100dvh - 70px)', background: '#000A1F' }}
    >
      {/* Glow BG */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 30%, rgba(224,176,0,0.08) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="relative w-full"
        style={{ maxWidth: 360 }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: 'rgba(224,176,0,0.08)',
              border: '1.5px solid rgba(224,176,0,0.28)',
            }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(224,176,0,0)',
                '0 0 28px rgba(224,176,0,0.25)',
                '0 0 0px rgba(224,176,0,0)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <User size={32} color="#E0B000" />
          </motion.div>
        </div>

        {/* Title */}
        <h2
          style={{
            color: '#ffffff',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 800,
            fontSize: 22,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          ¡Únete al Chat!
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.42)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 1.6,
          }}
        >
          Regístrate una sola vez con tu nombre y género para chatear con la comunidad Clásicos.
        </p>

        {/* Name input */}
        <label
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            display: 'block',
            marginBottom: 8,
          }}
        >
          NOMBRE
        </label>
        <div
          className="flex items-center px-4 py-3 rounded-2xl mb-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(224,176,0,0.18)',
          }}
        >
          <input
            type="text"
            value={name}
            maxLength={22}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="¿Cómo te llamas?"
            className="w-full bg-transparent outline-none"
            style={{
              color: 'white',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
            }}
          />
        </div>

        {/* Gender selector */}
        <label
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            display: 'block',
            marginBottom: 10,
          }}
        >
          GÉNERO
        </label>
        <div className="flex gap-3 mb-7">
          {GENDER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => {
                setGender(opt.value);
                setError('');
              }}
              className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl gap-1"
              style={{
                background:
                  gender === opt.value
                    ? 'rgba(224,176,0,0.12)'
                    : 'rgba(255,255,255,0.04)',
                border:
                  gender === opt.value
                    ? '1.5px solid rgba(224,176,0,0.55)'
                    : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.18s',
              }}
              whileTap={{ scale: 0.93 }}
            >
              <span style={{ fontSize: 22 }}>{opt.emoji}</span>
              <span
                style={{
                  color: gender === opt.value ? '#E0B000' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 11,
                  fontWeight: gender === opt.value ? 700 : 400,
                  transition: 'all 0.18s',
                }}
              >
                {opt.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                color: 'rgba(255,100,100,0.85)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)',
            boxShadow: '0 6px 28px rgba(224,176,0,0.38)',
          }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
        >
          <span
            style={{
              color: '#000A1F',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.5px',
            }}
          >
            Entrar al Chat
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT PROFILE SHEET
═══════════════════════════════════════════════════════════ */
interface EditProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

function EditProfileSheet({ profile, onSave, onClose }: EditProfileProps) {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<UserProfile['gender']>(profile.gender);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('El nombre no puede estar vacío');
      return;
    }
    const updated: UserProfile = { name: trimmed, gender };
    saveProfile(updated);
    onSave(updated);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-end z-50"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-t-3xl px-6 pt-6 pb-8"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.14)' }}
        initial={{ y: 340 }}
        animate={{ y: 0 }}
        exit={{ y: 340 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-5 rounded-full"
          style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)' }}
        />

        <div className="flex items-center justify-between mb-5">
          <h3
            style={{
              color: '#ffffff',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: 17,
            }}
          >
            Editar Perfil
          </h3>
          <motion.button
            onClick={onClose}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.88 }}
          >
            <X size={14} color="rgba(255,255,255,0.55)" />
          </motion.button>
        </div>

        {/* Name */}
        <label
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            display: 'block',
            marginBottom: 8,
          }}
        >
          NOMBRE
        </label>
        <div
          className="flex items-center px-4 py-3 rounded-2xl mb-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(224,176,0,0.18)',
          }}
        >
          <input
            type="text"
            value={name}
            maxLength={22}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            className="w-full bg-transparent outline-none"
            style={{
              color: 'white',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
            }}
          />
        </div>

        {/* Gender */}
        <label
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            display: 'block',
            marginBottom: 10,
          }}
        >
          GÉNERO
        </label>
        <div className="flex gap-3 mb-5">
          {GENDER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setGender(opt.value)}
              className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl gap-1"
              style={{
                background:
                  gender === opt.value
                    ? 'rgba(224,176,0,0.12)'
                    : 'rgba(255,255,255,0.04)',
                border:
                  gender === opt.value
                    ? '1.5px solid rgba(224,176,0,0.55)'
                    : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.18s',
              }}
              whileTap={{ scale: 0.93 }}
            >
              <span style={{ fontSize: 20 }}>{opt.emoji}</span>
              <span
                style={{
                  color: gender === opt.value ? '#E0B000' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 11,
                  fontWeight: gender === opt.value ? 700 : 400,
                  transition: 'all 0.18s',
                }}
              >
                {opt.label}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                color: 'rgba(255,100,100,0.85)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <motion.button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
            whileTap={{ scale: 0.96 }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Cancelar
            </span>
          </motion.button>
          <motion.button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)',
              boxShadow: '0 4px 18px rgba(224,176,0,0.32)',
            }}
            whileTap={{ scale: 0.96 }}
          >
            <Check size={14} color="#000A1F" />
            <span
              style={{
                color: '#000A1F',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Guardar
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LIVE CHAT
═══════════════════════════════════════════════════════════ */
export function LiveChat() {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { isPlaying, toggle } = useAudio();
  const deviceId = useRef(getDeviceId());
  const lastCountRef = useRef(0);

  // ── Presence: ping server to register as online ──────────
  const pingPresence = useCallback(async () => {
    try {
      await apiFetch('/presence/ping', {
        method: 'POST',
        body: JSON.stringify({ deviceId: deviceId.current }),
      });
    } catch (err) {
      console.log('Error pinging presence:', err);
    }
  }, []);

  const removePresence = useCallback(() => {
    // Use sendBeacon so it fires even when the page is closing
    const url = `${(apiFetch as any).__BASE__ ?? ''}`;
    try {
      apiFetch('/presence/ping', {
        method: 'DELETE',
        body: JSON.stringify({ deviceId: deviceId.current }),
      }).catch(() => {});
    } catch {}
  }, []);

  const fetchOnlineCount = useCallback(async () => {
    try {
      const data = await apiFetch('/presence/count');
      setOnlineCount(data.count ?? 0);
    } catch (err) {
      console.log('Error fetching presence count:', err);
    }
  }, []);

  // Register presence + heartbeat every 30s + count poll every 10s
  useEffect(() => {
    pingPresence();
    fetchOnlineCount();

    const heartbeat = setInterval(pingPresence, 30_000);
    const countPoll = setInterval(fetchOnlineCount, 10_000);

    // Remove presence when tab/app goes background or closes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        apiFetch('/presence/ping', {
          method: 'DELETE',
          body: JSON.stringify({ deviceId: deviceId.current }),
        }).catch(() => {});
      } else {
        pingPresence();
        fetchOnlineCount();
      }
    };
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `${BASE}/presence/ping`,
        new Blob(
          [JSON.stringify({ deviceId: deviceId.current })],
          { type: 'application/json' }
        )
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      clearInterval(countPoll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Remove presence on component unmount
      apiFetch('/presence/ping', {
        method: 'DELETE',
        body: JSON.stringify({ deviceId: deviceId.current }),
      }).catch(() => {});
    };
  }, [pingPresence, fetchOnlineCount]);

  // Convert raw server message to local Message format
  const toMessage = useCallback((raw: any): Message => ({
    id: raw.id,
    user: raw.user,
    text: raw.text,
    isOwn: raw.deviceId === deviceId.current,
    time: new Date(raw.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    avatar: raw.avatar ?? raw.user.charAt(0).toUpperCase(),
    color: raw.color ?? AVATAR_COLORS[0],
  }), []);

  // Fetch messages and update state (only scroll if new messages arrived)
  const fetchMessages = useCallback(async () => {
    try {
      const data: any[] = await apiFetch('/chat/messages');
      setMessages(prev => {
        if (data.length === prev.length && data.length > 0) return prev;
        return data.map(toMessage);
      });
      if (data.length > lastCountRef.current) {
        lastCountRef.current = data.length;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    } catch (err) {
      console.log('Error loading messages:', err);
    }
  }, [toMessage]);

  // Load on mount + poll every 5s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // If no profile yet → show registration
  if (!profile) {
    return <RegistrationScreen onComplete={(p) => setProfile(p)} />;
  }

  const userAvatar = profile.name.charAt(0).toUpperCase();
  const userDisplayName = `${profile.name} ${genderEmoji(profile.gender)}`;

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;
    if (!text) setInput('');
    setShowReactions(false);

    // Optimistic local add
    const optimisticId = `opt_${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      user: userDisplayName,
      text: msgText,
      isOwn: true,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      avatar: userAvatar,
      color: AVATAR_COLORS[3],
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);

    try {
      await apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          user: userDisplayName,
          text: msgText,
          avatar: userAvatar,
          color: AVATAR_COLORS[3],
          deviceId: deviceId.current,
        }),
      });
      // Refresh so real ID replaces optimistic
      fetchMessages();
    } catch (err) {
      console.log('Error sending message:', err);
    }
  };

  const handleProfileSave = (updated: UserProfile) => {
    setProfile(updated);
    setShowEditSheet(false);
  };

  return (
    <div
      className="relative flex flex-col h-full"
      style={{ background: '#000A1F' }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(0,12,36,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(224,176,0,0.09)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              background: 'rgba(224,176,0,0.1)',
              border: '1px solid rgba(224,176,0,0.22)',
            }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(224,176,0,0)',
                '0 0 10px rgba(224,176,0,0.2)',
                '0 0 0px rgba(224,176,0,0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users size={13} color="#E0B000" />
          </motion.div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  color: '#E0B000',
                  fontSize: 13,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                }}
              >
                {onlineCount}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                en línea
              </span>
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.22)',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.8px',
              }}
            >
              Comunidad Clásicos
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit profile button */}
          <motion.button
            onClick={() => setShowEditSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(224,176,0,0.07)',
              border: '1px solid rgba(224,176,0,0.18)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 18,
                height: 18,
                background: 'rgba(224,176,0,0.15)',
                border: '1px solid rgba(224,176,0,0.35)',
                color: '#E0B000',
                fontSize: 8,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
              }}
            >
              {userAvatar}
            </div>
            <Pencil size={9} color="#E0B000" />
          </motion.button>

          {/* Mini player toggle */}
          <motion.button
            onClick={toggle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: isPlaying ? 'rgba(224,176,0,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                isPlaying ? 'rgba(224,176,0,0.28)' : 'rgba(255,255,255,0.07)'
              }`,
            }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause size={11} color="#E0B000" fill="#E0B000" />
            ) : (
              <Play size={11} color="rgba(255,255,255,0.4)" fill="rgba(255,255,255,0.4)" />
            )}
            <span
              style={{
                color: isPlaying ? '#E0B000' : 'rgba(255,255,255,0.35)',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.8px',
              }}
            >
              {isPlaying ? 'EN VIVO' : 'PAUSADO'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className={`flex items-end gap-2 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!msg.isOwn && (
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0 mb-5"
                  style={{
                    width: 30,
                    height: 30,
                    background: msg.color.replace('0.9', '0.12'),
                    border: `1.5px solid ${msg.color.replace('0.9', '0.45')}`,
                    color: msg.color,
                    fontSize: 11,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 800,
                  }}
                >
                  {msg.avatar}
                </div>
              )}

              <div style={{ maxWidth: '76%' }}>
                {!msg.isOwn && (
                  <p
                    style={{
                      color: msg.color,
                      fontSize: 10,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      marginBottom: 4,
                      paddingLeft: 4,
                    }}
                  >
                    {msg.user}
                  </p>
                )}
                {msg.isOwn && (
                  <p
                    style={{
                      color: 'rgba(224,176,0,0.65)',
                      fontSize: 10,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      marginBottom: 4,
                      paddingRight: 4,
                      textAlign: 'right',
                    }}
                  >
                    {userDisplayName}
                  </p>
                )}
                <motion.div
                  className="px-4 py-2.5"
                  style={{
                    background: msg.isOwn
                      ? 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)'
                      : 'rgba(255,255,255,0.058)',
                    border: msg.isOwn
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.075)',
                    borderRadius: 18,
                    borderBottomRightRadius: msg.isOwn ? 4 : 18,
                    borderBottomLeftRadius: msg.isOwn ? 18 : 4,
                    boxShadow: msg.isOwn
                      ? '0 4px 20px rgba(224,176,0,0.3), 0 1px 4px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <p
                    style={{
                      color: msg.isOwn ? '#000A1F' : 'rgba(255,255,255,0.88)',
                      fontSize: 13,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: msg.isOwn ? 600 : 400,
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.text}
                  </p>
                </motion.div>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.18)',
                    fontSize: 9,
                    fontFamily: 'Montserrat, sans-serif',
                    textAlign: msg.isOwn ? 'right' : 'left',
                    marginTop: 4,
                    paddingLeft: msg.isOwn ? 0 : 4,
                    paddingRight: msg.isOwn ? 4 : 0,
                  }}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Quick reactions ── */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex gap-2 px-4 pb-2"
            style={{ overflow: 'hidden' }}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => sendMessage(emoji)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 38,
                  height: 38,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  fontSize: 18,
                }}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.12 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div
        className="flex gap-2.5 items-center px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(0,8,26,0.98)',
          backdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(224,176,0,0.09)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)',
        }}
      >
        {/* Emoji button */}
        <motion.button
          onClick={() => setShowReactions((p) => !p)}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            background: showReactions ? 'rgba(224,176,0,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${
              showReactions ? 'rgba(224,176,0,0.25)' : 'rgba(255,255,255,0.07)'
            }`,
          }}
          whileTap={{ scale: 0.88 }}
        >
          <Smile size={18} color={showReactions ? '#E0B000' : 'rgba(255,255,255,0.35)'} />
        </motion.button>

        {/* Text input */}
        <div
          className="flex-1 flex items-center px-4 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="w-full bg-transparent outline-none"
            style={{
              color: 'white',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
            }}
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={() => sendMessage()}
          className="flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{
            width: 46,
            height: 46,
            background: input.trim() ? '#E0B000' : 'rgba(224,176,0,0.1)',
            border: `1px solid ${input.trim() ? '#E0B000' : 'rgba(224,176,0,0.18)'}`,
            boxShadow: input.trim() ? '0 4px 18px rgba(224,176,0,0.38)' : 'none',
            transition: 'all 0.2s',
          }}
          whileTap={{ scale: 0.86 }}
        >
          <Send
            size={17}
            color={input.trim() ? '#000A1F' : 'rgba(224,176,0,0.3)'}
            style={{ marginLeft: -1, marginTop: -1 }}
          />
        </motion.button>
      </div>

      {/* ── Edit profile sheet ── */}
      <AnimatePresence>
        {showEditSheet && (
          <EditProfileSheet
            profile={profile}
            onSave={handleProfileSave}
            onClose={() => setShowEditSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}