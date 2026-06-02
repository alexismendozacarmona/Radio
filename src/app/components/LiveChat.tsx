import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, Play, Pause, Smile, Pencil, Check, X, User, Lock, Trash2 } from 'lucide-react';
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
  gender?: UserProfile['gender'];
  isAdmin?: boolean;
  edited?: boolean;
  reactions?: Record<string, string[]>;
  deviceId?: string;
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

/* Color por género (RGB sin alfa, para construir variantes) */
const GENDER_RGB: Record<UserProfile['gender'], string> = {
  hombre: '90,160,255',   // azul
  mujer: '255,110,170',   // rosa
  otro: '190,120,255',    // morado
};
const ADMIN_RGB = '224,176,0'; // dorado

const ADMIN_FLAG_KEY = 'cr_chat_admin';
const ADMIN_PIN = '1717';
const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😮'];

/* Devuelve el RGB que corresponde a un mensaje (admin > género) */
function rgbForMessage(m: { isAdmin?: boolean; gender?: UserProfile['gender'] }): string {
  if (m.isAdmin) return ADMIN_RGB;
  return (m.gender && GENDER_RGB[m.gender]) || GENDER_RGB.otro;
}

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
   PIN MODAL (desbloqueo admin del chat)
═══════════════════════════════════════════════════════════ */
function ChatPinModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ADMIN_PIN) onSuccess();
        else { setShake(true); setError(true); setTimeout(() => { setPin(''); setShake(false); }, 600); }
      }, 120);
    }
  };

  const DIGITS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '⌫']];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-[200] px-8"
      style={{ background: 'rgba(0,5,18,0.94)', backdropFilter: 'blur(14px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full rounded-3xl px-6 py-7"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.22)', maxWidth: 300 }}
        initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, background: 'rgba(224,176,0,0.08)', border: '1.5px solid rgba(224,176,0,0.3)' }}>
            <Lock size={22} color="#E0B000" />
          </div>
        </div>
        <p style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
          Acceso Admin
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>
          Ingresa tu PIN para moderar el chat
        </p>
        <motion.div className="flex justify-center gap-3 mb-7"
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.35 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: error ? 'rgba(255,80,80,0.8)' : i < pin.length ? '#E0B000' : 'rgba(255,255,255,0.1)',
              border: `2px solid ${error ? 'rgba(255,80,80,0.5)' : i < pin.length ? '#E0B000' : 'rgba(255,255,255,0.15)'}`,
              transition: 'all 0.15s',
            }} />
          ))}
        </motion.div>
        <div className="flex flex-col gap-2.5">
          {DIGITS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4">
              {row.map((digit, di) => (
                <motion.button key={di}
                  onClick={() => digit === '⌫' ? setPin(p => p.slice(0, -1)) : digit ? handleDigit(digit) : undefined}
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: 64, height: 52,
                    background: digit ? (digit === '⌫' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)') : 'rgba(0,0,0,0)',
                    border: digit ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: 'white', fontFamily: 'Montserrat, sans-serif',
                    fontWeight: digit === '⌫' ? 400 : 700, fontSize: digit === '⌫' ? 18 : 20,
                    cursor: digit ? 'pointer' : 'default',
                  }}
                  whileTap={digit ? { scale: 0.88 } : {}}
                >{digit}</motion.button>
              ))}
            </div>
          ))}
        </div>
        <motion.button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl" whileTap={{ scale: 0.97 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}>Cancelar</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOJA DE ACCIONES (long-press: reaccionar / editar / borrar)
═══════════════════════════════════════════════════════════ */
function MessageActionSheet({ msg, myDeviceId, isAdmin, onReact, onEdit, onDelete, onClose }: {
  msg: Message; myDeviceId: string; isAdmin: boolean;
  onReact: (emoji: string) => void; onEdit: () => void; onDelete: () => void; onClose: () => void;
}) {
  const canEdit = msg.isOwn;               // editas lo tuyo
  const canDelete = isAdmin || msg.isOwn;  // admin borra todo; dueño borra lo suyo

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-end z-[200]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-t-3xl px-5 pt-4 pb-7"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.16)' }}
        initial={{ y: 340 }} animate={{ y: 0 }} exit={{ y: 340 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 rounded-full" style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.12)' }} />

        {/* Reacciones */}
        <div className="flex justify-around mb-4">
          {REACTION_EMOJIS.map((emoji) => {
            const mine = (msg.reactions?.[emoji] ?? []).includes(myDeviceId);
            return (
              <motion.button key={emoji} onClick={() => onReact(emoji)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 52, height: 52, fontSize: 26,
                  background: mine ? 'rgba(224,176,0,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mine ? 'rgba(224,176,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
                whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
                {emoji}
              </motion.button>
            );
          })}
        </div>

        {/* Preview del mensaje */}
        <div className="rounded-xl px-3 py-2 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="truncate" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Montserrat, sans-serif' }}>
            {msg.text}
          </p>
        </div>

        {/* Acciones */}
        {canEdit && (
          <motion.button onClick={onEdit} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.04)' }} whileTap={{ scale: 0.98 }}>
            <Pencil size={16} color="#E0B000" />
            <span style={{ color: 'white', fontSize: 13, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Editar mensaje</span>
          </motion.button>
        )}
        {canDelete && (
          <motion.button onClick={onDelete} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)' }} whileTap={{ scale: 0.98 }}>
            <Trash2 size={16} color="rgba(255,100,100,0.9)" />
            <span style={{ color: 'rgba(255,120,120,0.95)', fontSize: 13, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Eliminar mensaje
            </span>
          </motion.button>
        )}
        <motion.button onClick={onClose} className="w-full flex items-center justify-center px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }} whileTap={{ scale: 0.98 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>Cerrar</span>
        </motion.button>
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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try { return localStorage.getItem(ADMIN_FLAG_KEY) === '1'; } catch { return false; }
  });
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [actionMsg, setActionMsg] = useState<Message | null>(null);   // mensaje bajo long-press
  const [editing, setEditing] = useState<Message | null>(null);       // mensaje en edición
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { isPlaying, toggle } = useAudio();
  const deviceId = useRef(getDeviceId());
  const lastCountRef = useRef(0);
  const lastSigRef = useRef('');
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adminPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    gender: raw.gender,
    isAdmin: !!raw.isAdmin,
    edited: !!raw.edited,
    reactions: raw.reactions ?? {},
    deviceId: raw.deviceId,
  }), []);

  // Fetch messages and update state (only scroll if new messages arrived)
  const fetchMessages = useCallback(async () => {
    try {
      const data: any[] = await apiFetch('/chat/messages');
      // Firma de contenido: detecta nuevos mensajes, ediciones y reacciones
      const sig = JSON.stringify(
        data.map((d) => [
          d.id,
          d.text,
          d.edited,
          Object.entries(d.reactions ?? {}).map(([k, v]) => k + (Array.isArray(v) ? v.length : 0)),
        ])
      );
      if (sig !== lastSigRef.current) {
        lastSigRef.current = sig;
        setMessages(data.map(toMessage));
      }
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
  const myRgb = isAdmin ? ADMIN_RGB : GENDER_RGB[profile.gender];

  // ── Guardar edición ──────────────────────────────────────
  const saveEdit = async (msg: Message, text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, text: t, edited: true } : m)));
    try {
      await apiFetch(`/chat/messages/${msg.id}`, {
        method: 'PUT',
        body: JSON.stringify({ deviceId: deviceId.current, text: t }),
      });
      fetchMessages();
    } catch (err) {
      console.log('Error editing:', err);
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;

    // Si estamos editando (y no es un quick-reaction con texto fijo) → guardar edición
    if (editing && !text) {
      const target = editing;
      setEditing(null);
      setInput('');
      await saveEdit(target, msgText);
      return;
    }

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
      color: `rgba(${myRgb},0.95)`,
      gender: profile.gender,
      isAdmin,
      edited: false,
      reactions: {},
      deviceId: deviceId.current,
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
          color: `rgba(${myRgb},0.95)`,
          gender: profile.gender,
          isAdmin,
          deviceId: deviceId.current,
        }),
      });
      // Refresh so real ID replaces optimistic
      fetchMessages();
    } catch (err) {
      console.log('Error sending message:', err);
    }
  };

  // ── Reaccionar (toggle) ──────────────────────────────────
  const toggleReaction = async (msg: Message, emoji: string) => {
    if (msg.id.startsWith('opt_')) return; // aún no existe en el server
    setMessages(prev => prev.map(m => {
      if (m.id !== msg.id) return m;
      const reactions = { ...(m.reactions ?? {}) };
      const list = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
      const i = list.indexOf(deviceId.current);
      if (i >= 0) list.splice(i, 1); else list.push(deviceId.current);
      if (list.length) reactions[emoji] = list; else delete reactions[emoji];
      return { ...m, reactions };
    }));
    try {
      await apiFetch(`/chat/messages/${msg.id}/react`, {
        method: 'POST',
        body: JSON.stringify({ deviceId: deviceId.current, emoji }),
      });
    } catch (err) {
      console.log('Error reacting:', err);
    }
  };

  // ── Borrar (admin o dueño) ───────────────────────────────
  const deleteMessage = async (msg: Message) => {
    setActionMsg(null);
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    if (msg.id.startsWith('opt_')) return;
    try {
      await apiFetch(`/chat/messages/${msg.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ deviceId: deviceId.current, adminPin: isAdmin ? ADMIN_PIN : undefined }),
      });
    } catch (err) {
      console.log('Error deleting:', err);
    }
  };

  const startEditing = (msg: Message) => {
    setActionMsg(null);
    setEditing(msg);
    setInput(msg.text);
    setShowReactions(false);
  };

  // ── Long-press en un mensaje → hoja de acciones ──────────
  const cancelMsgPress = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };
  const startMsgPress = (msg: Message) => {
    if (msg.id.startsWith('opt_')) return;
    cancelMsgPress();
    pressTimer.current = setTimeout(() => setActionMsg(msg), 480);
  };

  // ── Long-press en el encabezado → desbloqueo / salida admin ──
  const cancelAdminPress = () => {
    if (adminPressTimer.current) { clearTimeout(adminPressTimer.current); adminPressTimer.current = null; }
  };
  const startAdminPress = () => {
    cancelAdminPress();
    adminPressTimer.current = setTimeout(() => {
      if (isAdmin) {
        setIsAdmin(false);
        try { localStorage.removeItem(ADMIN_FLAG_KEY); } catch { /**/ }
      } else {
        setShowAdminPin(true);
      }
    }, 900);
  };

  const enableAdmin = () => {
    setIsAdmin(true);
    try { localStorage.setItem(ADMIN_FLAG_KEY, '1'); } catch { /**/ }
    setShowAdminPin(false);
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
        <div
          className="flex items-center gap-2.5"
          onPointerDown={startAdminPress}
          onPointerUp={cancelAdminPress}
          onPointerLeave={cancelAdminPress}
          onTouchMove={cancelAdminPress}
          style={{ cursor: 'default' }}
        >
          <motion.div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              background: isAdmin ? 'rgba(224,176,0,0.16)' : 'rgba(224,176,0,0.1)',
              border: `1px solid ${isAdmin ? 'rgba(224,176,0,0.4)' : 'rgba(224,176,0,0.22)'}`,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div
                className="rounded-full"
                style={{ width: 7, height: 7, background: '#3DDC84' }}
                animate={{ opacity: [1, 0.25, 1], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <span
                style={{
                  color: '#3DDC84',
                  fontSize: 12,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                }}
              >
                En línea
              </span>
              {isAdmin && (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(224,176,0,0.16)', border: '1px solid rgba(224,176,0,0.4)' }}
                >
                  <span style={{ fontSize: 9 }}>👑</span>
                  <span style={{ color: '#E0B000', fontSize: 8, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, letterSpacing: '0.5px' }}>
                    ADMIN
                  </span>
                </span>
              )}
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
          {messages.map((msg) => {
            const rgb = rgbForMessage(msg);
            const own = msg.isOwn;
            const admin = !!msg.isAdmin;
            const reactionEntries = Object.entries(msg.reactions ?? {}).filter(
              ([, list]) => Array.isArray(list) && list.length > 0
            );
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className={`flex items-end gap-2 ${own ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar (solo de los demás) */}
                {!own && (
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0 mb-5"
                    style={{
                      width: 30,
                      height: 30,
                      background: `rgba(${rgb},0.14)`,
                      border: `1.5px solid rgba(${rgb},0.5)`,
                      color: `rgba(${rgb},0.95)`,
                      fontSize: 11,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 800,
                    }}
                  >
                    {admin ? '👑' : msg.avatar}
                  </div>
                )}

                <div style={{ maxWidth: '76%' }}>
                  {/* Nombre */}
                  <p
                    style={{
                      color: `rgba(${rgb},0.95)`,
                      fontSize: 10,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      marginBottom: 4,
                      paddingLeft: own ? 0 : 4,
                      paddingRight: own ? 4 : 0,
                      textAlign: own ? 'right' : 'left',
                    }}
                  >
                    {admin ? '👑 ' : ''}{own ? userDisplayName : msg.user}
                  </p>

                  {/* Burbuja (long-press para reaccionar / editar / borrar) */}
                  <motion.div
                    className="px-4 py-2.5"
                    onPointerDown={() => startMsgPress(msg)}
                    onPointerUp={cancelMsgPress}
                    onPointerLeave={cancelMsgPress}
                    onTouchMove={cancelMsgPress}
                    style={{
                      background: admin
                        ? 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)'
                        : own
                        ? `linear-gradient(135deg, rgba(${rgb},0.92) 0%, rgba(${rgb},0.6) 100%)`
                        : 'rgba(255,255,255,0.058)',
                      border: own || admin ? 'none' : '1px solid rgba(255,255,255,0.075)',
                      borderRadius: 18,
                      borderBottomRightRadius: own ? 4 : 18,
                      borderBottomLeftRadius: own ? 18 : 4,
                      boxShadow: admin
                        ? '0 4px 20px rgba(224,176,0,0.32), 0 1px 4px rgba(0,0,0,0.3)'
                        : own
                        ? `0 4px 18px rgba(${rgb},0.28), 0 1px 4px rgba(0,0,0,0.25)`
                        : '0 2px 8px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <p
                      style={{
                        color: admin ? '#000A1F' : own ? '#ffffff' : 'rgba(255,255,255,0.88)',
                        fontSize: 13,
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: own || admin ? 600 : 400,
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </p>
                  </motion.div>

                  {/* Reacciones */}
                  {reactionEntries.length > 0 && (
                    <div
                      className="flex flex-wrap gap-1 mt-1.5"
                      style={{ justifyContent: own ? 'flex-end' : 'flex-start' }}
                    >
                      {reactionEntries.map(([emoji, list]) => {
                        const mine = list.includes(deviceId.current);
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg, emoji)}
                            className="flex items-center gap-1 rounded-full"
                            style={{
                              padding: '2px 7px',
                              background: mine ? 'rgba(224,176,0,0.18)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${mine ? 'rgba(224,176,0,0.45)' : 'rgba(255,255,255,0.1)'}`,
                            }}
                          >
                            <span style={{ fontSize: 11 }}>{emoji}</span>
                            <span
                              style={{
                                color: mine ? '#E0B000' : 'rgba(255,255,255,0.55)',
                                fontSize: 10,
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 700,
                              }}
                            >
                              {list.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Hora + editado */}
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.18)',
                      fontSize: 9,
                      fontFamily: 'Montserrat, sans-serif',
                      textAlign: own ? 'right' : 'left',
                      marginTop: 4,
                      paddingLeft: own ? 0 : 4,
                      paddingRight: own ? 4 : 0,
                    }}
                  >
                    {msg.time}{msg.edited ? ' · editado' : ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
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

      {/* ── Banner de edición ── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{ overflow: 'hidden', background: 'rgba(224,176,0,0.08)', borderTop: '1px solid rgba(224,176,0,0.18)' }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Pencil size={12} color="#E0B000" />
              <span style={{ color: '#E0B000', fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, flexShrink: 0 }}>
                Editando
              </span>
              <span className="truncate" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>
                — {editing.text}
              </span>
            </div>
            <button
              onClick={() => { setEditing(null); setInput(''); }}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={12} color="rgba(255,255,255,0.55)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div
        className="flex gap-2.5 items-center px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(0,8,26,0.98)',
          backdropFilter: 'blur(28px)',
          borderTop: editing ? 'none' : '1px solid rgba(224,176,0,0.09)',
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
            placeholder={editing ? 'Edita tu mensaje…' : 'Escribe un mensaje...'}
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

      {/* ── PIN admin ── */}
      <AnimatePresence>
        {showAdminPin && (
          <ChatPinModal onSuccess={enableAdmin} onClose={() => setShowAdminPin(false)} />
        )}
      </AnimatePresence>

      {/* ── Hoja de acciones (long-press en un mensaje) ── */}
      <AnimatePresence>
        {actionMsg && (
          <MessageActionSheet
            msg={actionMsg}
            myDeviceId={deviceId.current}
            isAdmin={isAdmin}
            onReact={(emoji) => { toggleReaction(actionMsg, emoji); setActionMsg(null); }}
            onEdit={() => startEditing(actionMsg)}
            onDelete={() => deleteMessage(actionMsg)}
            onClose={() => setActionMsg(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}