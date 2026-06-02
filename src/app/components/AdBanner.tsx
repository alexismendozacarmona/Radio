import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ChevronRight, Check, Shield, Megaphone, X } from 'lucide-react';
import { apiFetch } from '../lib/api';

/* ─────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────── */
export interface AdSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  image: string;        // URL de imagen (vacío = sin imagen, usa fondo degradado)
  accentColor: string;  // color hex para acentos del slide
  active: boolean;      // si está activo se muestra; si no, se omite
}

const ADMIN_PIN = '1717'; // ← mismo PIN que Noticias
const AD_STORAGE_KEY = 'cr_ad_banner';
const AUTOPLAY_MS = 8000;

const DEFAULT_SLIDES: AdSlide[] = [
  {
    id: 1,
    badge: '⭐ AQUÍ TU ANUNCIO',
    title: '¡Tu marca en la radio #1!',
    subtitle: '+1 millón de oyentes en Latinoamérica te están escuchando ahora mismo.',
    ctaText: 'Pautar ya',
    ctaUrl: 'https://api.whatsapp.com/send/?phone=573017637182',
    image: '',
    accentColor: '#E0B000',
    active: true,
  },
  {
    id: 2,
    badge: '📢 PAUTA CON NOSOTROS',
    title: '¡Tu marca frente a +1M oyentes!',
    subtitle: 'Llegamos a toda Latinoamérica 24/7. Haz crecer tu negocio con nosotros.',
    ctaText: 'Más info',
    ctaUrl: 'https://api.whatsapp.com/send/?phone=573017637182',
    image: '',
    accentColor: '#E0B000',
    active: true,
  },
  {
    id: 3,
    badge: '🎙️ MENCIONES EN VIVO',
    title: 'Tu marca suena en nuestra radio',
    subtitle: 'Cuñas comerciales con producción profesional incluida. Reserva tu espacio.',
    ctaText: 'Contactar',
    ctaUrl: 'https://api.whatsapp.com/send/?phone=573017637182',
    image: '',
    accentColor: '#E0B000',
    active: true,
  },
  {
    id: 4,
    badge: '🏆 PUBLICIDAD DIGITAL',
    title: 'Banner en clasicosdelreggaeton.com',
    subtitle: 'Visibilidad premium en nuestra web y app. Paquetes desde tu presupuesto.',
    ctaText: 'Ver paquetes',
    ctaUrl: 'https://api.whatsapp.com/send/?phone=573017637182',
    image: '',
    accentColor: '#E0B000',
    active: true,
  },
];

/* ─────────────────────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────────────────────── */
function loadSlides(): AdSlide[] {
  return DEFAULT_SLIDES;
}

function saveSlides(slides: AdSlide[]) {
  localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(slides));
}

/* ─────────────────────────────────────────────────────────
   PIN MODAL
───────────────────────────────────────────────────────── */
function PinModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
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
          setTimeout(() => { setPin(''); setShake(false); }, 600);
        }
      }, 120);
    }
  };

  const DIGITS = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','']];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[200] px-8"
      style={{ background: 'rgba(0,5,18,0.94)', backdropFilter: 'blur(14px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full rounded-3xl px-6 py-7"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.22)', maxWidth: 300 }}
        initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 20 }}
        onClick={e => e.stopPropagation()}
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
          Ingresa tu PIN de 4 dígitos
        </p>
        <motion.div className="flex justify-center gap-3 mb-7"
          animate={shake ? { x: [-8,8,-8,8,0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: error ? 'rgba(255,80,80,0.8)' : i < pin.length ? '#E0B000' : 'rgba(255,255,255,0.1)',
              border: `2px solid ${error ? 'rgba(255,80,80,0.5)' : i < pin.length ? '#E0B000' : 'rgba(255,255,255,0.15)'}`,
              transition: 'all 0.15s',
              boxShadow: i < pin.length && !error ? '0 0 8px rgba(224,176,0,0.5)' : 'none',
            }} />
          ))}
        </motion.div>
        <div className="flex flex-col gap-2.5">
          {DIGITS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4">
              {row.map((digit, di) => (
                <motion.button key={di}
                  onClick={() => digit === '⌫' ? setPin(p => p.slice(0,-1)) : digit ? handleDigit(digit) : undefined}
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: 64, height: 52,
                    background: digit ? digit === '⌫' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0)',
                    border: digit ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: 'white', fontFamily: 'Montserrat, sans-serif',
                    fontWeight: digit === '⌫' ? 400 : 700, fontSize: digit === '⌫' ? 18 : 20,
                    cursor: digit ? 'pointer' : 'default',
                  }}
                  whileTap={digit ? { scale: 0.88, background: 'rgba(224,176,0,0.12)' } : {}}
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

/* ─────────────────────────────────────────────────────────
   CAMPO DE EDICIÓN
   A nivel de módulo (NO dentro de AdminEditor) para que React
   no remonte el input en cada tecla y el teclado del móvil no
   se cierre letra por letra.
───────────────────────────────────────────────────────── */
function BannerField({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div className="mb-3">
      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.9px', marginBottom: 6 }}>{label}</p>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
          className="w-full rounded-xl px-3 py-2.5 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(224,176,0,0.16)', color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat, sans-serif', fontSize: 12 }} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(224,176,0,0.16)', color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat, sans-serif', fontSize: 12 }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ADMIN EDITOR
───────────────────────────────────────────────────────── */
function AdminEditor({ slides, onSave, onClose }: { slides: AdSlide[]; onSave: (s: AdSlide[]) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<AdSlide[]>(JSON.parse(JSON.stringify(slides)));
  const [activeTab, setActiveTab] = useState(0);

  const update = (idx: number, key: keyof AdSlide, val: string | boolean) => {
    setDraft(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col justify-end z-[200]"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex flex-col rounded-t-3xl"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.16)', maxHeight: '90vh' }}
        initial={{ y: 700 }} animate={{ y: 0 }} exit={{ y: 700 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="mx-auto mb-4 rounded-full" style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full"
                style={{ width: 28, height: 28, background: 'rgba(224,176,0,0.1)', border: '1px solid rgba(224,176,0,0.3)' }}>
                <Shield size={13} color="#E0B000" />
              </div>
              <span style={{ color: '#ffffff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 16 }}>Editor de Publicidad</span>
            </div>
            <motion.button onClick={onClose} className="flex items-center justify-center rounded-full"
              style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.88 }}>
              <X size={14} color="rgba(255,255,255,0.5)" />
            </motion.button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'Montserrat, sans-serif', fontSize: 10, marginBottom: 14 }}>
            Edita los 3 slides del banner • Desactiva los que no uses
          </p>

          {/* Tab selector */}
          <div className="flex gap-2">
            {draft.map((slide, i) => (
              <motion.button key={i} onClick={() => setActiveTab(i)}
                className="flex-1 py-2 rounded-xl"
                style={{
                  background: activeTab === i ? 'rgba(224,176,0,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeTab === i ? 'rgba(224,176,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.18s',
                }}
                whileTap={{ scale: 0.94 }}
              >
                <span style={{ color: activeTab === i ? '#E0B000' : 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11 }}>
                  Slide {i + 1}
                </span>
                {!slide.active && (
                  <span style={{ color: 'rgba(255,100,100,0.7)', fontSize: 8, display: 'block', fontFamily: 'Montserrat, sans-serif' }}>OFF</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Active toggle */}
              <div className="flex items-center justify-between py-3 mb-2"
                style={{ borderBottom: '1px solid rgba(224,176,0,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600 }}>
                  Mostrar este slide
                </span>
                <motion.button onClick={() => update(activeTab, 'active', !draft[activeTab].active)}
                  className="rounded-full"
                  style={{
                    width: 42, height: 24,
                    background: draft[activeTab].active ? 'rgba(224,176,0,0.22)' : 'rgba(255,255,255,0.07)',
                    border: draft[activeTab].active ? '1px solid rgba(224,176,0,0.45)' : '1px solid rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'all 0.2s',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={{ x: draft[activeTab].active ? 19 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ width: 18, height: 18, borderRadius: '50%', background: draft[activeTab].active ? '#E0B000' : 'rgba(255,255,255,0.35)', position: 'absolute', top: 2, left: 0 }}
                  />
                </motion.button>
              </div>

              <BannerField label="BADGE (ej: 📢 PAUTA CON NOSOTROS)" value={draft[activeTab].badge} onChange={v => update(activeTab, 'badge', v)} />
              <BannerField label="TÍTULO" value={draft[activeTab].title} onChange={v => update(activeTab, 'title', v)} multiline />
              <BannerField label="SUBTÍTULO" value={draft[activeTab].subtitle} onChange={v => update(activeTab, 'subtitle', v)} multiline />
              <BannerField label="TEXTO DEL BOTÓN (ej: Más info)" value={draft[activeTab].ctaText} onChange={v => update(activeTab, 'ctaText', v)} />
              <BannerField label="ENLACE DEL BOTÓN (URL)" value={draft[activeTab].ctaUrl} onChange={v => update(activeTab, 'ctaUrl', v)} />
              <BannerField label="IMAGEN DE FONDO (URL — dejar vacío para fondo degradado)" value={draft[activeTab].image} onChange={v => update(activeTab, 'image', v)} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Save */}
        <div className="px-5 pb-7 pt-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(224,176,0,0.09)' }}>
          <motion.button onClick={() => {
            onSave(draft);
            // Persist to server
            apiFetch('/ads', { method: 'PUT', body: JSON.stringify(draft) })
              .catch((err) => console.log('Error saving ads:', err));
          }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)', boxShadow: '0 6px 24px rgba(224,176,0,0.35)' }}
            whileTap={{ scale: 0.97 }}>
            <Check size={16} color="#000A1F" />
            <span style={{ color: '#000A1F', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14 }}>Guardar Cambios</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN AD BANNER
───────────────────────────────────────────────────────── */
export function AdBanner() {
  const [slides] = useState<AdSlide[]>(() => loadSlides());
  const [allSlides, setAllSlides] = useState<AdSlide[]>(slides);
  const activeSlides = allSlides.filter(s => s.active);

  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Load from server on mount
  useEffect(() => {
    apiFetch('/ads')
      .then((data) => { if (Array.isArray(data) && data.length > 0) setAllSlides(data); })
      .catch((err) => console.log('Error loading ads:', err));
  }, []);

  // Long-press detection
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance
  useEffect(() => {
    if (activeSlides.length <= 1 || dismissed) return;
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % activeSlides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [activeSlides.length, dismissed]);

  const startPress = useCallback(() => {
    setPressing(true);
    setPressProgress(0);
    progressInterval.current = setInterval(() => {
      setPressProgress(p => Math.min(p + 2, 100));
    }, 30);
    pressTimer.current = setTimeout(() => {
      clearInterval(progressInterval.current!);
      setPressing(false);
      setPressProgress(0);
      setShowPin(true);
    }, 1500);
  }, []);

  const endPress = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    setPressing(false);
    setPressProgress(0);
  }, []);

  if (dismissed || activeSlides.length === 0) return null;

  const slide = activeSlides[current % activeSlides.length];
  const hasImage = !!slide.image?.trim();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        style={{ marginTop: 16 }}
      >
        {/* Card */}
        <div
          className={`relative rounded-2xl overflow-hidden select-none${hasImage ? ' flex flex-col justify-end' : ''}`}
          style={{
            minHeight: hasImage ? 224 : undefined,
            background: 'linear-gradient(120deg, #000E2C 0%, #00132E 100%)',
            border: '1px solid rgba(224,176,0,0.2)',
            boxShadow: '0 8px 36px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(224,176,0,0.08)',
            cursor: 'default',
          }}
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
        >
          {/* Imagen protagonista (nítida, a toda la tarjeta) */}
          {hasImage && (
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'saturate(1.05)' }}
            />
          )}
          {/* Scrim: transparente arriba (la imagen luce) → oscuro abajo (texto legible) */}
          <div className="absolute inset-0" style={{
            background: hasImage
              ? 'linear-gradient(180deg, rgba(0,8,28,0.28) 0%, rgba(0,8,28,0) 18%, rgba(0,8,28,0) 42%, rgba(0,8,28,0.52) 64%, rgba(0,8,28,0.87) 83%, rgba(0,10,32,0.97) 100%)'
              : 'linear-gradient(120deg, rgba(0,14,44,0.98) 0%, rgba(0,20,54,0.95) 55%, rgba(0,10,32,0.99) 100%)',
          }} />
          {/* Golden shimmer top */}
          <div className="absolute top-0 left-0 right-0" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(224,176,0,0.5), transparent)' }} />
          {/* Glow blob */}
          <div className="absolute pointer-events-none" style={{
            top: -30, right: -20, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(224,176,0,0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }} />

          {/* Long-press progress arc */}
          {pressing && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div style={{
                width: '100%', height: '100%', position: 'absolute',
                background: `rgba(224,176,0,${pressProgress / 500})`,
                transition: 'background 0.05s',
              }} />
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div key={slide.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className={
                hasImage
                  ? 'relative z-10 flex flex-col px-4 pt-5 pb-4 gap-2.5'
                  : 'relative z-10 flex flex-col px-4 pt-5 pb-4 gap-3'
              }
            >
              {/* Top row: icon + badge */}
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 36, height: 36, background: 'rgba(224,176,0,0.12)', border: '1px solid rgba(224,176,0,0.28)' }}
                  animate={{ boxShadow: ['0 0 8px rgba(224,176,0,0.0)', '0 0 18px rgba(224,176,0,0.35)', '0 0 8px rgba(224,176,0,0.0)'] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <Megaphone size={17} color="#E0B000" />
                </motion.div>
                <span style={{ color: '#E0B000', fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase' }}>
                  {slide.badge}
                </span>
              </div>

              {/* Title + subtitle */}
              <div>
                <p style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 800, lineHeight: 1.25, marginBottom: 5 }}>
                  {slide.title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Montserrat, sans-serif', fontSize: 11, lineHeight: 1.45 }}>
                  {slide.subtitle}
                </p>
              </div>

              {/* CTA + dots row */}
              <div className="flex items-center justify-between">
                <motion.a
                  href={slide.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #E0B000 0%, #C49800 100%)',
                    boxShadow: '0 4px 18px rgba(224,176,0,0.4)',
                    textDecoration: 'none',
                  }}
                  whileTap={{ scale: 0.9 }}
                  onMouseDown={e => e.stopPropagation()}
                  onTouchStart={e => e.stopPropagation()}
                >
                  <span style={{ color: '#000A1F', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 11.5, whiteSpace: 'nowrap' }}>
                    {slide.ctaText}
                  </span>
                  <ChevronRight size={12} color="#000A1F" strokeWidth={2.5} />
                </motion.a>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {activeSlides.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setCurrent(i)}
                      style={{
                        width: current % activeSlides.length === i ? 18 : 6,
                        height: 4,
                        borderRadius: 2,
                        background: current % activeSlides.length === i ? '#E0B000' : 'rgba(255,255,255,0.18)',
                        transition: 'all 0.3s',
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => e.stopPropagation()}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Overlays */}
      <AnimatePresence>
        {showPin && <PinModal onSuccess={() => { setShowPin(false); setShowEditor(true); }} onClose={() => setShowPin(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showEditor && (
          <AdminEditor
            slides={allSlides}
            onSave={updated => { setAllSlides(updated); setCurrent(0); setShowEditor(false); }}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}