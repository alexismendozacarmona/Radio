import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Check, Rocket } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { APP_VERSION, type AppVersionInfo } from '../lib/version';

const ADMIN_PIN = '1717';

/* ── PIN (compacto) ─────────────────────────────────────── */
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
        if (next === ADMIN_PIN) onSuccess();
        else { setShake(true); setError(true); setTimeout(() => { setPin(''); setShake(false); }, 600); }
      }, 120);
    }
  };

  const DIGITS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '⌫']];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[210] px-8"
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
          Gestionar actualización de la app
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

/* ── Editor de versión ──────────────────────────────────── */
function VersionEditor({ onClose }: { onClose: () => void }) {
  const [latest, setLatest] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prefill con lo que haya guardado
  useEffect(() => {
    apiFetch('/version')
      .then((d: AppVersionInfo | null) => {
        if (d) {
          setLatest(d.latest ?? '');
          setUrl(d.url ?? '');
          setNotes(d.notes ?? '');
          setMandatory(!!d.mandatory);
        }
      })
      .catch(() => { /**/ });
  }, []);

  const save = async () => {
    const payload = { latest: latest.trim(), url: url.trim(), notes: notes.trim(), mandatory, adminPin: ADMIN_PIN };
    try {
      await apiFetch('/version', { method: 'PUT', body: JSON.stringify(payload) });
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (err) {
      console.log('Error saving version:', err);
    }
  };

  const labelStyle = { color: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.9px', marginBottom: 6, display: 'block' } as const;
  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(224,176,0,0.16)', color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat, sans-serif', fontSize: 13 } as const;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col justify-end z-[210]"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.16)', maxHeight: '88vh', overflowY: 'auto' }}
        initial={{ y: 480 }} animate={{ y: 0 }} exit={{ y: 480 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 rounded-full" style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: 'rgba(224,176,0,0.1)', border: '1px solid rgba(224,176,0,0.3)' }}>
              <Rocket size={13} color="#E0B000" />
            </div>
            <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 16 }}>Publicar actualización</span>
          </div>
          <motion.button onClick={onClose} className="flex items-center justify-center rounded-full"
            style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.88 }}>
            <X size={14} color="rgba(255,255,255,0.5)" />
          </motion.button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', fontSize: 10, marginBottom: 16 }}>
          Esta app es la v{APP_VERSION}. A quien tenga una versión menor a "última versión" le saldrá el aviso.
        </p>

        <label style={labelStyle}>ÚLTIMA VERSIÓN (ej: 3.2.0)</label>
        <input type="text" value={latest} onChange={(e) => setLatest(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 outline-none mb-3" style={inputStyle} placeholder="3.2.0" />

        <label style={labelStyle}>LINK DE DESCARGA DEL APK</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 outline-none mb-3" style={inputStyle} placeholder="https://..." />

        <label style={labelStyle}>NOVEDADES (opcional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full rounded-xl px-3 py-2.5 outline-none resize-none mb-3" style={inputStyle} placeholder="Qué hay de nuevo…" />

        <div className="flex items-center justify-between py-3 mb-2" style={{ borderTop: '1px solid rgba(224,176,0,0.08)', borderBottom: '1px solid rgba(224,176,0,0.08)' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600 }}>Actualización obligatoria</span>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif', fontSize: 10 }}>No se puede cerrar el aviso</span>
          </div>
          <motion.button onClick={() => setMandatory(m => !m)} className="rounded-full"
            style={{ width: 42, height: 24, background: mandatory ? 'rgba(224,176,0,0.22)' : 'rgba(255,255,255,0.07)', border: mandatory ? '1px solid rgba(224,176,0,0.45)' : '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
            whileTap={{ scale: 0.9 }}>
            <motion.div animate={{ x: mandatory ? 19 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ width: 18, height: 18, borderRadius: '50%', background: mandatory ? '#E0B000' : 'rgba(255,255,255,0.35)', position: 'absolute', top: 2, left: 0 }} />
          </motion.button>
        </div>

        <motion.button onClick={save} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-3"
          style={{ background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)', boxShadow: '0 6px 24px rgba(224,176,0,0.35)' }} whileTap={{ scale: 0.97 }}>
          <Check size={16} color="#000A1F" />
          <span style={{ color: '#000A1F', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14 }}>{saved ? 'Publicado ✓' : 'Publicar'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── Etiqueta de versión + gesto admin (va en el footer del menú) ── */
export function VersionAdmin() {
  const [showPin, setShowPin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const start = () => { cancel(); timer.current = setTimeout(() => setShowPin(true), 900); };

  return (
    <>
      <button
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onTouchMove={cancel}
        style={{ background: 'transparent', border: 'none', padding: '4px 8px', cursor: 'default' }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
          v{APP_VERSION}
        </span>
      </button>

      <AnimatePresence>
        {showPin && <PinModal onSuccess={() => { setShowPin(false); setShowEditor(true); }} onClose={() => setShowPin(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showEditor && <VersionEditor onClose={() => setShowEditor(false)} />}
      </AnimatePresence>
    </>
  );
}
