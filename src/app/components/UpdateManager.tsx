import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { APP_VERSION, isNewer, type AppVersionInfo } from '../lib/version';

const DISMISS_KEY = 'cr_update_dismissed';

/**
 * Consulta /version en el server. Si hay una versión más nueva que la que
 * trae este build (APP_VERSION), muestra un aviso de actualización con link
 * de descarga. Si `mandatory` es true, no se puede cerrar.
 */
export function UpdateManager() {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    apiFetch('/version')
      .then((d) => { if (d && d.latest) setInfo(d as AppVersionInfo); })
      .catch(() => { /* sin red: no molestamos */ });
  }, []);

  if (!info || !info.latest || !isNewer(info.latest, APP_VERSION)) return null;

  const mandatory = !!info.mandatory;
  let alreadyDismissed = false;
  try { alreadyDismissed = localStorage.getItem(DISMISS_KEY) === info.latest; } catch { /**/ }
  if (!mandatory && (dismissed || alreadyDismissed)) return null;

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, info.latest); } catch { /**/ }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-[300] px-8"
        style={{ background: 'rgba(0,5,18,0.92)', backdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={mandatory ? undefined : close}
      >
        <motion.div
          className="w-full rounded-3xl px-6 py-7 relative overflow-hidden"
          style={{ background: '#000D24', border: '1px solid rgba(224,176,0,0.22)', maxWidth: 320 }}
          initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow superior */}
          <div className="absolute top-0 left-0 right-0" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(224,176,0,0.6), transparent)' }} />

          {!mandatory && (
            <button onClick={close} className="absolute flex items-center justify-center rounded-full"
              style={{ top: 14, right: 14, width: 28, height: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          )}

          <div className="flex justify-center mb-4">
            <motion.div className="flex items-center justify-center rounded-2xl"
              style={{ width: 58, height: 58, background: 'rgba(224,176,0,0.1)', border: '1.5px solid rgba(224,176,0,0.3)' }}
              animate={{ boxShadow: ['0 0 0px rgba(224,176,0,0)', '0 0 24px rgba(224,176,0,0.3)', '0 0 0px rgba(224,176,0,0)'] }}
              transition={{ duration: 2.4, repeat: Infinity }}>
              <Sparkles size={26} color="#E0B000" />
            </motion.div>
          </div>

          <p style={{ color: 'white', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, textAlign: 'center', marginBottom: 6 }}>
            ¡Nueva versión disponible!
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Montserrat, sans-serif', fontSize: 12, textAlign: 'center', marginBottom: 4 }}>
            Versión {info.latest} · tienes la {APP_VERSION}
          </p>
          {info.notes ? (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat, sans-serif', fontSize: 12, textAlign: 'center', lineHeight: 1.5, marginTop: 8, marginBottom: 4 }}>
              {info.notes}
            </p>
          ) : null}

          <a
            href={info.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl mt-6"
            style={{ background: 'linear-gradient(135deg, #E0B000 0%, #C49800 60%, #A07B00 100%)', boxShadow: '0 6px 24px rgba(224,176,0,0.35)', textDecoration: 'none' }}
          >
            <Download size={17} color="#000A1F" />
            <span style={{ color: '#000A1F', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14 }}>
              Actualizar ahora
            </span>
          </a>

          {!mandatory && (
            <button onClick={close} className="w-full mt-3 py-2.5 rounded-xl" style={{ background: 'transparent' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}>Más tarde</span>
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
