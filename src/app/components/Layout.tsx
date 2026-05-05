import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { DrawerMenu } from './DrawerMenu';
import { MiniPlayer } from './MiniPlayer';

const LOGO_URL =
  'https://clasicosdelreggaeton.com/sitepad-data/uploads/2023/03/logopagina_Mesa-de-trabajo-1.png';

const pageTitles: Record<string, string> = {
  '/app/chat': 'Chat en Vivo',
  '/app/news': 'Noticias',
  '/app/advertise': 'Paute con Nosotros',
  '/app/contact': 'Contacto',
  '/app/website': 'Sitio Web',
};

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/app' || location.pathname === '/app/';
  const isChat = location.pathname === '/app/chat';
  const pageTitle = pageTitles[location.pathname] || '';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#000005' }}
    >
      {/* Phone frame */}
      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 430,
          height: '100dvh',
          background: '#000A1F',
        }}
      >
        {/* Ambient corner glows */}
        <div
          className="absolute top-0 left-0 pointer-events-none z-0"
          style={{
            width: 220,
            height: 220,
            background:
              'radial-gradient(circle at top left, rgba(224,176,0,0.055) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-0 right-0 pointer-events-none z-0"
          style={{
            width: 180,
            height: 180,
            background:
              'radial-gradient(circle at top right, rgba(224,176,0,0.035) 0%, transparent 65%)',
          }}
        />

        {/* Header */}
        <div
          className="relative z-20 flex items-center justify-between px-4 shrink-0"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            paddingBottom: 12,
            background: isHome
              ? 'transparent'
              : 'rgba(0,8,24,0.88)',
            backdropFilter: isHome ? 'none' : 'blur(28px)',
            borderBottom: isHome
              ? 'none'
              : '1px solid rgba(224,176,0,0.07)',
          }}
        >
          {/* Menu button */}
          <motion.button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 42,
              height: 42,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
            whileTap={{ scale: 0.88 }}
            whileHover={{
              background: 'rgba(224,176,0,0.08)',
              borderColor: 'rgba(224,176,0,0.25)',
            }}
            transition={{ duration: 0.15 }}
          >
            <Menu size={20} color="rgba(255,255,255,0.8)" />
          </motion.button>

          {/* Center: logo or page title */}
          <AnimatePresence mode="wait">
            {isHome ? (
              <motion.img
                key="logo"
                src={LOGO_URL}
                alt="Logo"
                initial={{ opacity: 0, scale: 0.85, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 4 }}
                transition={{ duration: 0.28 }}
                style={{
                  height: 38,
                  width: 'auto',
                  filter:
                    'drop-shadow(0 0 10px rgba(224,176,0,0.4)) drop-shadow(0 0 24px rgba(224,176,0,0.12))',
                }}
              />
            ) : (
              <motion.span
                key="title"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22 }}
                style={{
                  color: 'white',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: '0.3px',
                }}
              >
                {pageTitle}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Live badge */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(224,176,0,0.09)',
              border: '1px solid rgba(224,176,0,0.26)',
              backdropFilter: 'blur(8px)',
            }}
            animate={{
              boxShadow: [
                '0 0 8px rgba(224,176,0,0.0)',
                '0 0 12px rgba(224,176,0,0.18)',
                '0 0 8px rgba(224,176,0,0.0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.div
              className="rounded-full"
              style={{ width: 6, height: 6, background: '#E0B000' }}
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span
              style={{
                color: '#E0B000',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                letterSpacing: '1.5px',
              }}
            >
              LIVE
            </span>
          </motion.div>
        </div>

        {/* Main content */}
        <div
          className={`relative flex-1 overflow-x-hidden ${
            isChat ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              style={{ minHeight: '100%', height: isChat ? '100%' : undefined }}
              className={isChat ? 'flex flex-col' : ''}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mini player */}
        <MiniPlayer />

        {/* Drawer */}
        <DrawerMenu
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
}