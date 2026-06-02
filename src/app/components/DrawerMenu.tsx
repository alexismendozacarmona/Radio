import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import {
  Home,
  MessageCircle,
  Newspaper,
  Megaphone,
  Phone,
  Globe,
  X,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { VersionAdmin } from './VersionAdmin';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home,          label: 'Inicio',           path: '/app',           desc: 'Player en vivo' },
  { icon: MessageCircle, label: 'Chat en Vivo',      path: '/app/chat',      desc: 'Comunidad activa' },
  { icon: Newspaper,     label: 'Noticias',          path: '/app/news',      desc: 'Lo más reciente' },
  { icon: Megaphone,     label: 'Paute con Nosotros', path: '/app/advertise', desc: 'Crece con nosotros' },
  { icon: Phone,         label: 'Contacto',          path: '/app/contact',   desc: 'Escríbenos' },
  { icon: Globe,         label: 'Visitar Sitio Web', path: '/app/website',   desc: 'clasicosdelreggaeton.com' },
];

const LOGO_URL =
  'https://clasicosdelreggaeton.com/sitepad-data/uploads/2023/03/logopagina_Mesa-de-trabajo-1.png';

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 298,
              background: 'linear-gradient(180deg, #000E2A 0%, #000A1F 55%, #000714 100%)',
              borderRight: '1px solid rgba(224,176,0,0.15)',
              boxShadow: '16px 0 60px rgba(0,0,0,0.95)',
            }}
            initial={{ x: -298 }}
            animate={{ x: 0 }}
            exit={{ x: -298 }}
            transition={{ type: 'spring', damping: 30, stiffness: 290 }}
          >
            {/* Top gold shimmer line */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(224,176,0,0.7), rgba(224,176,0,0.3), transparent)',
              }}
            />

            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: -40,
                left: -40,
                width: 240,
                height: 240,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(224,176,0,0.08) 0%, transparent 65%)',
                filter: 'blur(24px)',
              }}
            />

            {/* Header */}
            <div
              className="relative flex items-center justify-between p-5 pb-5"
              style={{ borderBottom: '1px solid rgba(224,176,0,0.1)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at top left, rgba(224,176,0,0.08) 0%, transparent 65%)',
                }}
              />
              <div className="relative z-10">
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  style={{
                    height: 50,
                    width: 'auto',
                    filter:
                      'drop-shadow(0 0 12px rgba(224,176,0,0.5)) drop-shadow(0 0 30px rgba(224,176,0,0.15))',
                  }}
                />
              </div>
              <motion.button
                onClick={onClose}
                className="relative z-10 flex items-center justify-center rounded-xl"
                style={{
                  width: 38,
                  height: 38,
                  background: 'rgba(224,176,0,0.08)',
                  border: '1px solid rgba(224,176,0,0.18)',
                }}
                whileTap={{ scale: 0.88 }}
                whileHover={{
                  background: 'rgba(224,176,0,0.15)',
                  borderColor: 'rgba(224,176,0,0.35)',
                }}
              >
                <X size={16} color="#E0B000" />
              </motion.button>
            </div>

            {/* Live status bar */}
            <div className="px-5 pt-4 pb-3">
              <motion.div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(224,176,0,0.055)',
                  border: '1px solid rgba(224,176,0,0.12)',
                }}
                animate={{
                  borderColor: [
                    'rgba(224,176,0,0.1)',
                    'rgba(224,176,0,0.22)',
                    'rgba(224,176,0,0.1)',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Radio size={13} color="#E0B000" />
                <span
                  style={{
                    color: 'rgba(224,176,0,0.8)',
                    fontSize: 10,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    flex: 1,
                  }}
                >
                  TRANSMITIENDO EN VIVO
                </span>
                <motion.div
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: '#E0B000' }}
                  animate={{ opacity: [1, 0.15, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Menu items */}
            <div className="flex-1 py-2 overflow-auto">
              {menuItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/app' && location.pathname === '/app/');
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className="w-full flex items-center gap-3.5 px-4 py-3 text-left relative overflow-hidden"
                    style={{
                      background: isActive
                        ? 'rgba(224,176,0,0.07)'
                        : 'rgba(0,0,0,0)',
                      borderLeft: `3px solid ${isActive ? '#E0B000' : 'rgba(0,0,0,0)'}`,
                    }}
                    initial={{ opacity: 0, x: -28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.32 }}
                    whileHover={{ x: 4, background: 'rgba(224,176,0,0.05)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(224,176,0,0.06) 0%, transparent 60%)',
                        }}
                        layoutId="activeMenuBg"
                      />
                    )}

                    <div
                      className="flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        background: isActive
                          ? 'rgba(224,176,0,0.16)'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${
                          isActive
                            ? 'rgba(224,176,0,0.35)'
                            : 'rgba(255,255,255,0.06)'
                        }`,
                        boxShadow: isActive
                          ? '0 0 16px rgba(224,176,0,0.18)'
                          : 'none',
                        transition: 'all 0.22s',
                      }}
                    >
                      <item.icon
                        size={17}
                        color={isActive ? '#E0B000' : 'rgba(255,255,255,0.55)'}
                      />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <span
                        style={{
                          color: isActive
                            ? '#E0B000'
                            : 'rgba(255,255,255,0.8)',
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: 14,
                          letterSpacing: '0.2px',
                          display: 'block',
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.28)',
                          fontSize: 10,
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {item.desc}
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      color={
                        isActive
                          ? 'rgba(224,176,0,0.5)'
                          : 'rgba(255,255,255,0.12)'
                      }
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-5"
              style={{ borderTop: '1px solid rgba(224,176,0,0.07)' }}
            >
              <div
                className="flex items-center gap-2 mb-2"
                style={{ justifyContent: 'center' }}
              >
                <div
                  style={{
                    width: 24,
                    height: 1,
                    background:
                      'linear-gradient(90deg, transparent, rgba(224,176,0,0.3))',
                  }}
                />
                <div
                  className="rounded-full"
                  style={{ width: 4, height: 4, background: 'rgba(224,176,0,0.4)' }}
                />
                <div
                  style={{
                    width: 24,
                    height: 1,
                    background:
                      'linear-gradient(90deg, rgba(224,176,0,0.3), transparent)',
                  }}
                />
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.22)',
                  fontSize: 10,
                  fontFamily: 'Montserrat, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.7,
                }}
              >
                © Clásicos del Reggaetón
                <br />
                <span style={{ color: 'rgba(224,176,0,0.38)' }}>
                  Radio Online · En Vivo 24/7
                </span>
              </p>
              {/* Versión (mantener presionado = panel admin de actualización) */}
              <div className="flex justify-center mt-1">
                <VersionAdmin />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}