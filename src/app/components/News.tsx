import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Clock,
  TrendingUp,
  ArrowRight,
  Lock,
  Pencil,
  X,
  Check,
  Shield,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface FeaturedNews {
  title: string;
  excerpt: string;
  image: string;
  url: string;
  category: string;
  time: string;
  hot: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  url: string;
  category: string;
  time: string;
}

interface NewsContent {
  featured: FeaturedNews;
  items: [NewsItem, NewsItem];
}

/* ─────────────────────────────────────────────────────────
   DEFAULTS (shown if no localStorage data yet)
───────────────────────────────────────────────────────── */
const DEFAULT_CONTENT: NewsContent = {
  featured: {
    title: 'Bad Bunny anuncia nueva gira por Latinoamérica',
    excerpt:
      'El artista puertorriqueño sorprende a sus fans con nuevas fechas en Colombia, México y República Dominicana que prometen ser épicas.',
    image:
      'https://images.unsplash.com/photo-1615932051741-fe742a3baec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHMlMjBsYXRpbiUyMG11c2ljfGVufDF8fHx8MTc3MjE0MTY3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    url: 'https://clasicosdelreggaeton.com',
    category: 'EXCLUSIVO',
    time: 'Hace 2 horas',
    hot: true,
  },
  items: [
    {
      id: 1,
      title: 'Daddy Yankee: 20 años de "Gasolina" que cambiaron la música',
      excerpt:
        'Un repaso al tema que puso al reggaetón en el mapa mundial y convirtió al Big Boss en leyenda del género urbano.',
      image:
        'https://images.unsplash.com/photo-1696628564626-0abdac479366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbiUyMG11c2ljJTIwYXJ0aXN0JTIwbWljcm9waG9uZSUyMHBlcmZvcm1hbmNlJTIwdXJiYW58ZW58MXx8fHwxNzcyMTQxNjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      url: 'https://clasicosdelreggaeton.com',
      category: 'ESPECIAL',
      time: 'Hace 5 horas',
    },
    {
      id: 2,
      title: 'Los 10 clásicos del reggaetón que nunca pasan de moda',
      excerpt:
        'Repasamos los temas que marcaron una generación y que suenan igual de frescos como el primer día.',
      image:
        'https://images.unsplash.com/photo-1615932051741-fe742a3baec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHMlMjBsYXRpbiUyMG11c2ljfGVufDF8fHx8MTc3MjE0MTY3MHww&ixlib=rb-4.1.0&q=80&w=1080',
      url: 'https://clasicosdelreggaeton.com',
      category: 'TOP 10',
      time: 'Hace 8 horas',
    },
  ],
};

/* ─────────────────────────────────────────────────────────
   ADMIN CONFIG — change ADMIN_PIN here to your own PIN
───────────────────────────────────────────────────────── */
const ADMIN_PIN = '1717'; // ← Cambia este PIN a uno que solo tú conozcas
const NEWS_STORAGE_KEY = 'cr_news_content';

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function loadContent(): NewsContent {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NewsContent;
  } catch { /**/ }
  return DEFAULT_CONTENT;
}

function saveContent(c: NewsContent) {
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(c));
  } catch { /**/ }
}

/* ─────────────────────────────────────────────────────────
   INLINE FIELD COMPONENT
───────────────────────────────────────────────────────── */
function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span style={{ color: 'rgba(224,176,0,0.6)' }}>{icon}</span>}
        <span
          style={{
            color: 'rgba(255,255,255,0.38)',
            fontSize: 9,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.9px',
          }}
        >
          {label}
        </span>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(224,176,0,0.16)',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            lineHeight: 1.55,
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(224,176,0,0.16)',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ADMIN EDIT SHEET
───────────────────────────────────────────────────────── */
interface AdminSheetProps {
  content: NewsContent;
  onSave: (c: NewsContent) => void;
  onClose: () => void;
}

function AdminEditSheet({ content, onSave, onClose }: AdminSheetProps) {
  const [draft, setDraft] = useState<NewsContent>(JSON.parse(JSON.stringify(content)));
  const [openSection, setOpenSection] = useState<'banner' | 'news1' | 'news2' | null>('banner');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setFeatured = (key: keyof FeaturedNews, val: string | boolean) => {
    setDraft((prev) => ({ ...prev, featured: { ...prev.featured, [key]: val } }));
  };

  const setItem = (idx: 0 | 1, key: keyof NewsItem, val: string) => {
    setDraft((prev) => {
      const items = [...prev.items] as [NewsItem, NewsItem];
      items[idx] = { ...items[idx], [key]: val };
      return { ...prev, items };
    });
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    saveContent(draft);
    try {
      await apiFetch('/news', { method: 'PUT', body: JSON.stringify(draft) });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSave(draft);
      }, 900);
    } catch (err) {
      console.log('Error saving news:', err);
      // Even if server fails, local save succeeded — close anyway
      onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({
    id,
    label,
    sub,
  }: {
    id: 'banner' | 'news1' | 'news2';
    label: string;
    sub: string;
  }) => (
    <button
      onClick={() => setOpenSection(openSection === id ? null : id)}
      className="w-full flex items-center justify-between py-3 px-1"
      style={{ borderBottom: '1px solid rgba(224,176,0,0.1)' }}
    >
      <div className="text-left">
        <p
          style={{
            color: '#E0B000',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            marginTop: 1,
          }}
        >
          {sub}
        </p>
      </div>
      {openSection === id ? (
        <ChevronUp size={14} color="rgba(224,176,0,0.55)" />
      ) : (
        <ChevronDown size={14} color="rgba(255,255,255,0.25)" />
      )}
    </button>
  );

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-end z-50"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex flex-col rounded-t-3xl"
        style={{
          background: '#000D24',
          border: '1px solid rgba(224,176,0,0.16)',
          maxHeight: '88vh',
        }}
        initial={{ y: 600 }}
        animate={{ y: 0 }}
        exit={{ y: 600 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div
            className="mx-auto mb-4 rounded-full"
            style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.1)' }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(224,176,0,0.1)',
                  border: '1px solid rgba(224,176,0,0.3)',
                }}
              >
                <Shield size={13} color="#E0B000" />
              </div>
              <span
                style={{
                  color: '#ffffff',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                Editor de Noticias
              </span>
            </div>
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
              <X size={14} color="rgba(255,255,255,0.5)" />
            </motion.button>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Modo Administrador • Los cambios se guardan localmente
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* ── BANNER ── */}
          <SectionHeader id="banner" label="🖼️ Banner Principal" sub={draft.featured.title.slice(0, 38) + '…'} />
          <AnimatePresence initial={false}>
            {openSection === 'banner' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
                transition={{ duration: 0.22 }}
              >
                <div className="pt-3">
                  <AdminField
                    label="TÍTULO"
                    value={draft.featured.title}
                    onChange={(v) => setFeatured('title', v)}
                    multiline
                  />
                  <AdminField
                    label="DESCRIPCIÓN"
                    value={draft.featured.excerpt}
                    onChange={(v) => setFeatured('excerpt', v)}
                    multiline
                  />
                  <AdminField
                    label="URL DE LA IMAGEN"
                    value={draft.featured.image}
                    onChange={(v) => setFeatured('image', v)}
                    icon={<ImageIcon size={11} />}
                  />
                  <AdminField
                    label="ENLACE (URL al artículo)"
                    value={draft.featured.url}
                    onChange={(v) => setFeatured('url', v)}
                    icon={<LinkIcon size={11} />}
                  />
                  <AdminField
                    label="CATEGORÍA (ej: EXCLUSIVO)"
                    value={draft.featured.category}
                    onChange={(v) => setFeatured('category', v)}
                  />
                  <AdminField
                    label="TIEMPO (ej: Hace 2 horas)"
                    value={draft.featured.time}
                    onChange={(v) => setFeatured('time', v)}
                  />
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      style={{
                        color: 'rgba(255,255,255,0.38)',
                        fontSize: 9,
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '0.9px',
                      }}
                    >
                      MOSTRAR ÍCONO 🔥
                    </span>
                    <motion.button
                      onClick={() => setFeatured('hot', !draft.featured.hot)}
                      className="rounded-full"
                      style={{
                        width: 38,
                        height: 22,
                        background: draft.featured.hot
                          ? 'rgba(224,176,0,0.25)'
                          : 'rgba(255,255,255,0.07)',
                        border: draft.featured.hot
                          ? '1px solid rgba(224,176,0,0.4)'
                          : '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ x: draft.featured.hot ? 17 : 2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: draft.featured.hot ? '#E0B000' : 'rgba(255,255,255,0.35)',
                          position: 'absolute',
                          top: 2,
                          left: 0,
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── NOTICIA 1 ── */}
          <SectionHeader id="news1" label="📰 Noticia 1" sub={draft.items[0].title.slice(0, 38) + '…'} />
          <AnimatePresence initial={false}>
            {openSection === 'news1' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
                transition={{ duration: 0.22 }}
              >
                <div className="pt-3">
                  <AdminField
                    label="TÍTULO"
                    value={draft.items[0].title}
                    onChange={(v) => setItem(0, 'title', v)}
                    multiline
                  />
                  <AdminField
                    label="DESCRIPCIÓN"
                    value={draft.items[0].excerpt}
                    onChange={(v) => setItem(0, 'excerpt', v)}
                    multiline
                  />
                  <AdminField
                    label="URL DE LA IMAGEN"
                    value={draft.items[0].image}
                    onChange={(v) => setItem(0, 'image', v)}
                    icon={<ImageIcon size={11} />}
                  />
                  <AdminField
                    label="ENLACE (URL al artículo)"
                    value={draft.items[0].url}
                    onChange={(v) => setItem(0, 'url', v)}
                    icon={<LinkIcon size={11} />}
                  />
                  <AdminField
                    label="CATEGORÍA"
                    value={draft.items[0].category}
                    onChange={(v) => setItem(0, 'category', v)}
                  />
                  <AdminField
                    label="TIEMPO"
                    value={draft.items[0].time}
                    onChange={(v) => setItem(0, 'time', v)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── NOTICIA 2 ── */}
          <SectionHeader id="news2" label="📰 Noticia 2" sub={draft.items[1].title.slice(0, 38) + '…'} />
          <AnimatePresence initial={false}>
            {openSection === 'news2' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
                transition={{ duration: 0.22 }}
              >
                <div className="pt-3">
                  <AdminField
                    label="TÍTULO"
                    value={draft.items[1].title}
                    onChange={(v) => setItem(1, 'title', v)}
                    multiline
                  />
                  <AdminField
                    label="DESCRIPCIÓN"
                    value={draft.items[1].excerpt}
                    onChange={(v) => setItem(1, 'excerpt', v)}
                    multiline
                  />
                  <AdminField
                    label="URL DE LA IMAGEN"
                    value={draft.items[1].image}
                    onChange={(v) => setItem(1, 'image', v)}
                    icon={<ImageIcon size={11} />}
                  />
                  <AdminField
                    label="ENLACE (URL al artículo)"
                    value={draft.items[1].url}
                    onChange={(v) => setItem(1, 'url', v)}
                    icon={<LinkIcon size={11} />}
                  />
                  <AdminField
                    label="CATEGORÍA"
                    value={draft.items[1].category}
                    onChange={(v) => setItem(1, 'category', v)}
                  />
                  <AdminField
                    label="TIEMPO"
                    value={draft.items[1].time}
                    onChange={(v) => setItem(1, 'time', v)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save button */}
        <div
          className="px-5 pb-6 pt-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(224,176,0,0.09)' }}
        >
          <motion.button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)',
              boxShadow: '0 6px 24px rgba(224,176,0,0.35)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {saving ? (
              <div className="animate-spin">
                <Check size={16} color="#000A1F" />
              </div>
            ) : (
              <Check size={16} color="#000A1F" />
            )}
            <span
              style={{
                color: '#000A1F',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {saved ? 'Guardado' : 'Guardar Cambios'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PIN MODAL
───────────────────────────────────────────────────────── */
function PinModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
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
        if (next === ADMIN_PIN) {
          onSuccess();
        } else {
          setShake(true);
          setError(true);
          setTimeout(() => {
            setPin('');
            setShake(false);
          }, 600);
        }
      }, 120);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const DIGITS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50 px-8"
      style={{ background: 'rgba(0,5,18,0.92)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full rounded-3xl px-6 py-7"
        style={{
          background: '#000D24',
          border: '1px solid rgba(224,176,0,0.2)',
          maxWidth: 300,
        }}
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              background: 'rgba(224,176,0,0.08)',
              border: '1.5px solid rgba(224,176,0,0.28)',
            }}
          >
            <Lock size={22} color="#E0B000" />
          </div>
        </div>
        <p
          style={{
            color: 'white',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 800,
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          Acceso Admin
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Ingresa tu PIN de 4 dígitos
        </p>

        {/* Dots */}
        <motion.div
          className="flex justify-center gap-3 mb-7"
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: error
                  ? 'rgba(255,80,80,0.8)'
                  : i < pin.length
                  ? '#E0B000'
                  : 'rgba(255,255,255,0.1)',
                border: `2px solid ${
                  error
                    ? 'rgba(255,80,80,0.5)'
                    : i < pin.length
                    ? '#E0B000'
                    : 'rgba(255,255,255,0.15)'
                }`,
                transition: 'all 0.15s',
                boxShadow: i < pin.length && !error ? '0 0 8px rgba(224,176,0,0.5)' : 'none',
              }}
            />
          ))}
        </motion.div>

        {/* Keypad */}
        <div className="flex flex-col gap-2.5">
          {DIGITS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4">
              {row.map((digit, di) => (
                <motion.button
                  key={di}
                  onClick={() =>
                    digit === '⌫' ? handleDelete() : digit ? handleDigit(digit) : undefined
                  }
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: 64,
                    height: 52,
                    background: digit
                      ? digit === '⌫'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0)',
                    border: digit ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: 'white',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: digit === '⌫' ? 400 : 700,
                    fontSize: digit === '⌫' ? 18 : 20,
                    cursor: digit ? 'pointer' : 'default',
                  }}
                  whileTap={digit ? { scale: 0.88, background: 'rgba(224,176,0,0.12)' } : {}}
                >
                  {digit}
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        <motion.button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0)' }}
          whileTap={{ scale: 0.97 }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 12,
            }}
          >
            Cancelar
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export function News() {
  const [content, setContent] = useState<NewsContent>(() => loadContent());
  const [showPin, setShowPin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Load from server on mount
  useEffect(() => {
    apiFetch('/news')
      .then((data) => { if (data) setContent(data as NewsContent); })
      .catch((err) => console.log('Error loading news:', err));
  }, []);

  // Secret tap counter on title (5 taps in 2 seconds)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setShowPin(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPin(false);
    setShowEditor(true);
  };

  const handleContentSave = (updated: NewsContent) => {
    setContent(updated);
    setShowEditor(false);
    // Persist to server (fire-and-forget)
    apiFetch('/news', { method: 'PUT', body: JSON.stringify(updated) })
      .catch((err) => console.log('Error saving news:', err));
  };

  const { featured, items } = content;

  return (
    <div
      className="relative min-h-full px-4 py-4"
      style={{ background: '#000A1F', paddingBottom: 100 }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-4 px-1"
      >
        {/* Title — 5 taps secretos activan el panel admin */}
        <button
          onClick={handleTitleTap}
          className="flex items-center gap-2"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <div style={{ width: 3, height: 18, background: '#E0B000', borderRadius: 2 }} />
          <span
            style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.2px',
            }}
          >
            Noticias
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Admin edit hint (only visible if editor was recently used — otherwise invisible) */}
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} color="#E0B000" />
            <span
              style={{
                color: '#E0B000',
                fontSize: 10,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.8px',
              }}
            >
              TENDENCIAS
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Featured banner ── */}
      <motion.a
        href={featured.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="block rounded-3xl overflow-hidden mb-5"
        style={{
          border: '1px solid rgba(224,176,0,0.18)',
          boxShadow: '0 14px 50px rgba(0,0,0,0.55)',
          textDecoration: 'none',
        }}
        whileHover={{ boxShadow: '0 18px 60px rgba(0,0,0,0.6), 0 0 30px rgba(224,176,0,0.08)' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        <div className="relative" style={{ height: 210 }}>
          <img
            src={featured.image}
            alt={featured.title}
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.85)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgba(0,10,31,1) 0%, rgba(0,10,31,0.5) 45%, rgba(0,10,31,0.1) 80%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,5,18,0.5) 100%)',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(224,176,0,0.4), transparent)',
            }}
          />
          {/* Category badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: '#E0B000', boxShadow: '0 4px 16px rgba(224,176,0,0.45)' }}
          >
            {featured.hot && <span style={{ fontSize: 10 }}>🔥</span>}
            <span
              style={{
                color: '#000A1F',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                letterSpacing: '1.5px',
              }}
            >
              {featured.category}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div
          className="p-4"
          style={{ background: 'rgba(0,14,44,0.9)', backdropFilter: 'blur(16px)' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={11} color="rgba(224,176,0,0.55)" />
            <span
              style={{
                color: 'rgba(224,176,0,0.55)',
                fontSize: 10,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
              }}
            >
              {featured.time}
            </span>
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: 17,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {featured.title}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.58,
              marginBottom: 12,
            }}
          >
            {featured.excerpt}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                color: '#E0B000',
                fontSize: 11,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
              }}
            >
              Leer más
            </span>
            <ArrowRight size={13} color="#E0B000" />
          </div>
        </div>
      </motion.a>

      {/* ── Section label ── */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div style={{ width: 3, height: 14, background: '#E0B000', borderRadius: 2 }} />
        <span
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            letterSpacing: '1.8px',
          }}
        >
          MÁS NOTICIAS
        </span>
      </div>

      {/* ── News list (only 2) ── */}
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.07, duration: 0.42 }}
            className="flex gap-3 p-3 rounded-2xl"
            style={{
              background: 'rgba(0,16,50,0.6)',
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              textDecoration: 'none',
            }}
            whileHover={{
              borderColor: 'rgba(224,176,0,0.18)',
              background: 'rgba(0,20,58,0.7)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Thumbnail */}
            <div
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{ width: 90, height: 84 }}
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(224,176,0,0.06) 0%, transparent 55%)',
                }}
              />
              <div
                className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,10,31,0.75)', backdropFilter: 'blur(6px)' }}
              >
                <span
                  style={{
                    color: '#E0B000',
                    fontSize: 7.5,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                  }}
                >
                  {item.category}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-hidden flex flex-col justify-between py-0.5">
              <h3
                className="line-clamp-2"
                style={{
                  color: 'white',
                  fontSize: 13,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  lineHeight: 1.35,
                  marginBottom: 6,
                }}
              >
                {item.title}
              </h3>
              <p
                className="line-clamp-2"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.45,
                  marginBottom: 6,
                }}
              >
                {item.excerpt}
              </p>
              <div className="flex items-center gap-1">
                <Clock size={9} color="rgba(255,255,255,0.24)" />
                <span
                  style={{
                    color: 'rgba(255,255,255,0.26)',
                    fontSize: 9.5,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {item.time}
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* ── Ver más CTA ── */}
      <motion.a
        href="https://clasicosdelreggaeton.com"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex items-center justify-center gap-2 mt-5 py-4 rounded-2xl"
        style={{
          background: 'rgba(224,176,0,0.06)',
          border: '1px solid rgba(224,176,0,0.2)',
          textDecoration: 'none',
        }}
        whileHover={{ background: 'rgba(224,176,0,0.1)', borderColor: 'rgba(224,176,0,0.35)' }}
        whileTap={{ scale: 0.97 }}
      >
        <ExternalLink size={14} color="#E0B000" />
        <span
          style={{
            color: '#E0B000',
            fontSize: 12,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
          }}
        >
          Ver más en clasicosdelreggaeton.com
        </span>
      </motion.a>

      {/* ── Admin edit floating hint (tiny, only shown after 3 taps) ── */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1.5 opacity-0 pointer-events-none select-none">
          <Pencil size={9} color="rgba(224,176,0,0.2)" />
          <span
            style={{
              color: 'rgba(224,176,0,0.2)',
              fontSize: 8,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            admin
          </span>
        </div>
      </div>

      {/* ── Overlays ── */}
      <AnimatePresence>
        {showPin && (
          <PinModal onSuccess={handlePinSuccess} onClose={() => setShowPin(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditor && (
          <AdminEditSheet
            content={content}
            onSave={handleContentSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}