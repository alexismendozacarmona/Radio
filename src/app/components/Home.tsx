import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Radio, Loader, Heart, Share2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { AdBanner } from './AdBanner';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1771959453900-13eda5b0875c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBjb25jZXJ0JTIwbGF0aW4lMjB1cmJhbiUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3MjEzNTEwN3ww&ixlib=rb-4.1.0&q=80&w=1080';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.77a4.85 4.85 0 01-1-.08z" />
  </svg>
);

const barHeights = [0.55, 0.9, 0.42, 0.78, 0.65, 0.5, 0.88, 0.45, 0.72, 0.6, 0.85];

export function Home() {
  const { isPlaying, toggle, currentSong, isLoading } = useAudio();
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: 'calc(100dvh - 70px)', background: '#000A1F' }}
    >
      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={BG_IMAGE}
          alt=""
          className="w-full h-full object-cover"
          style={{
            opacity: 0.22,
            filter: 'saturate(0.5) blur(1px)',
            transform: 'scale(1.06)',
          }}
        />
        {/* Layered cinematic gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,10,31,0.75) 0%, rgba(0,10,31,0.2) 30%, rgba(0,10,31,0.65) 60%, rgba(0,10,31,1) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(0,5,18,0.75) 100%)',
          }}
        />
      </div>

      {/* ── Golden top haze ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 320,
          height: 220,
          background:
            'radial-gradient(ellipse at top, rgba(224,176,0,0.09) 0%, transparent 65%)',
          filter: 'blur(12px)',
        }}
      />

      {/* ── Subtle horizontal scan line ── */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(224,176,0,0.15) 30%, rgba(224,176,0,0.3) 50%, rgba(224,176,0,0.15) 70%, transparent 100%)',
        }}
        animate={{ top: ['15%', '80%', '15%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-5 pb-8">

        {/* EN VIVO badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-7"
          style={{
            background: 'rgba(224,176,0,0.08)',
            border: '1px solid rgba(224,176,0,0.26)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            className="rounded-full"
            style={{ width: 7, height: 7, background: '#E0B000' }}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span
            style={{
              color: '#E0B000',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '2.5px',
            }}
          >
            EN VIVO 24/7
          </span>
          <Radio size={13} color="#E0B000" />
        </motion.div>

        {/* ── BIG PLAY BUTTON ─ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center mb-7"
        >
          {/* Ripple rings when playing */}
          <AnimatePresence>
            {isPlaying && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 164,
                      height: 164,
                      border: `1.5px solid rgba(224,176,0,${0.3 - i * 0.08})`,
                    }}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1 + 0.22 * (i + 1), opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.65,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Decorative outer rings */}
          <div
            className="absolute rounded-full"
            style={{
              width: 238,
              height: 238,
              border: '1px solid rgba(224,176,0,0.09)',
              background:
                'radial-gradient(circle, rgba(224,176,0,0.02) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 196,
              height: 196,
              border: '1px solid rgba(224,176,0,0.06)',
            }}
          />

          {/* Play button core */}
          <motion.button
            onClick={toggle}
            className="relative flex items-center justify-center rounded-full z-10"
            style={{
              width: 152,
              height: 152,
              background: isPlaying
                ? 'linear-gradient(140deg, #F5CC00 0%, #E0B000 45%, #C49800 100%)'
                : 'linear-gradient(140deg, #E0B000 0%, #B8900B 55%, #7A5E00 100%)',
              boxShadow: isPlaying
                ? '0 0 0 3px rgba(224,176,0,0.2), 0 0 55px rgba(224,176,0,0.55), 0 0 110px rgba(224,176,0,0.2)'
                : '0 0 0 2px rgba(224,176,0,0.1), 0 0 30px rgba(224,176,0,0.28)',
            }}
            animate={
              isPlaying
                ? {
                    boxShadow: [
                      '0 0 0 3px rgba(224,176,0,0.2), 0 0 45px rgba(224,176,0,0.45), 0 0 90px rgba(224,176,0,0.15)',
                      '0 0 0 3px rgba(224,176,0,0.28), 0 0 75px rgba(224,176,0,0.72), 0 0 150px rgba(224,176,0,0.28)',
                      '0 0 0 3px rgba(224,176,0,0.2), 0 0 45px rgba(224,176,0,0.45), 0 0 90px rgba(224,176,0,0.15)',
                    ],
                  }
                : {}
            }
            transition={isPlaying ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : {}}
            whileTap={{ scale: 0.91 }}
            whileHover={{ scale: 1.04 }}
          >
            {/* Glass highlight */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.26) 0%, transparent 55%)',
              }}
            />
            {/* Bottom shadow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 62% 72%, rgba(0,0,0,0.22) 0%, transparent 50%)',
              }}
            />

            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader size={46} color="#000A1F" strokeWidth={2.5} />
              </motion.div>
            ) : isPlaying ? (
              <Pause size={48} color="#000A1F" strokeWidth={2.5} fill="#000A1F" />
            ) : (
              <Play
                size={48}
                color="#000A1F"
                strokeWidth={2.5}
                fill="#000A1F"
                style={{ marginLeft: 5 }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Audio bars visualizer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-end gap-[3px] mb-6"
          style={{ height: 42 }}
        >
          {barHeights.map((intensity, i) => (
            <div
              key={i}
              className={isPlaying ? `audio-bar-${(i % 5) + 1}` : ''}
              style={{
                width: 4,
                height: isPlaying ? undefined : Math.floor(intensity * 10) + 4,
                background: isPlaying
                  ? `rgba(224,176,0,${0.5 + intensity * 0.5})`
                  : `rgba(224,176,0,${0.1 + intensity * 0.12})`,
                borderRadius: 3,
                transition: 'background 0.5s',
              }}
            />
          ))}
        </motion.div>

        {/* Now playing card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full rounded-2xl p-4 mb-4"
          style={{
            background: 'rgba(0,16,50,0.72)',
            backdropFilter: 'blur(22px)',
            border: '1px solid rgba(224,176,0,0.14)',
            boxShadow:
              '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(224,176,0,0.07), inset 0 -1px 0 rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Album art placeholder */}
            <motion.div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background:
                  'linear-gradient(135deg, rgba(224,176,0,0.28) 0%, rgba(224,176,0,0.06) 100%)',
                border: '1px solid rgba(224,176,0,0.32)',
                boxShadow: isPlaying
                  ? '0 0 18px rgba(224,176,0,0.22)'
                  : 'none',
                transition: 'box-shadow 0.4s',
              }}
              animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
              transition={
                isPlaying
                  ? { duration: 20, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.3 }
              }
            >
              {isPlaying ? (
                <div className="flex items-end gap-[3px]" style={{ height: 22 }}>
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className={`audio-bar-${j}`}
                      style={{ width: 3, background: '#E0B000', borderRadius: 2 }}
                    />
                  ))}
                </div>
              ) : (
                <Radio size={22} color="#E0B000" />
              )}
            </motion.div>

            <div className="overflow-hidden flex-1">
              <p
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 9,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}
              >
                Ahora Suena
              </p>
              <p
                className="truncate"
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                }}
              >
                {currentSong}
              </p>
            </div>

            {/* Like & status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                onClick={() => setLiked((p) => !p)}
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                style={{ padding: 4 }}
              >
                <Heart
                  size={18}
                  color={liked ? '#E0B000' : 'rgba(255,255,255,0.3)'}
                  fill={liked ? '#E0B000' : 'transparent'}
                  style={{ transition: 'all 0.25s' }}
                />
              </motion.button>
              <div
                className="px-2 py-1 rounded-lg"
                style={{
                  background: isPlaying
                    ? 'rgba(224,176,0,0.14)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isPlaying ? 'rgba(224,176,0,0.28)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <span
                  style={{
                    color: isPlaying ? '#E0B000' : 'rgba(255,255,255,0.28)',
                    fontSize: 9,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  {isPlaying ? '▶ LIVE' : '⏸ OFF'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social + Share row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex gap-3 w-full"
        >
          {/* Instagram */}
          <a
            href="https://www.instagram.com/clasicosdelreggaetonradio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <motion.div
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl"
              style={{
                background: 'rgba(0,16,50,0.75)',
                border: '1px solid rgba(224,176,0,0.14)',
                backdropFilter: 'blur(14px)',
              }}
              whileTap={{ scale: 0.93 }}
              whileHover={{
                borderColor: 'rgba(224,176,0,0.38)',
                background: 'rgba(0,20,60,0.9)',
                boxShadow: '0 4px 20px rgba(224,176,0,0.1)',
              }}
              transition={{ duration: 0.18 }}
            >
              <div style={{ color: '#E0B000' }}>
                <InstagramIcon />
              </div>
              <span
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                }}
              >
                Instagram
              </span>
            </motion.div>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@clasicosdelreggaetonrd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <motion.div
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl"
              style={{
                background: 'rgba(0,16,50,0.75)',
                border: '1px solid rgba(224,176,0,0.14)',
                backdropFilter: 'blur(14px)',
              }}
              whileTap={{ scale: 0.93 }}
              whileHover={{
                borderColor: 'rgba(224,176,0,0.38)',
                background: 'rgba(0,20,60,0.9)',
                boxShadow: '0 4px 20px rgba(224,176,0,0.1)',
              }}
              transition={{ duration: 0.18 }}
            >
              <div style={{ color: '#E0B000' }}>
                <TikTokIcon />
              </div>
              <span
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                }}
              >
                TikTok
              </span>
            </motion.div>
          </a>

          {/* Share */}
          <motion.button
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52,
              background: 'rgba(0,16,50,0.75)',
              border: '1px solid rgba(224,176,0,0.14)',
              backdropFilter: 'blur(14px)',
            }}
            whileTap={{ scale: 0.93 }}
            whileHover={{
              borderColor: 'rgba(224,176,0,0.38)',
              background: 'rgba(0,20,60,0.9)',
            }}
            transition={{ duration: 0.18 }}
          >
            <Share2 size={18} color="rgba(224,176,0,0.7)" />
          </motion.button>
        </motion.div>

        {/* Ad Banner */}
        <div className="w-full mt-7">
          <AdBanner />
        </div>

        {/* Bottom decorative bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-2"
        >
          <div
            style={{
              width: 32,
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(224,176,0,0.3))',
            }}
          />
          <span
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: 9,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Clásicos del Reggaetón
          </span>
          <div
            style={{
              width: 32,
              height: 1,
              background:
                'linear-gradient(90deg, rgba(224,176,0,0.3), transparent)',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}