import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Play, Pause, Music2, Radio } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export function MiniPlayer() {
  const { isPlaying, toggle, currentSong } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on home and chat pages
  if (
    location.pathname === '/app' ||
    location.pathname === '/app/' ||
    location.pathname === '/app/chat'
  )
    return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260, delay: 0.1 }}
      className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3"
    >
      <motion.div
        className="relative flex items-center gap-3 px-3.5 py-3 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(0,12,38,0.97)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(224,176,0,0.2)',
          boxShadow:
            '0 10px 48px rgba(0,0,0,0.7), 0 0 28px rgba(224,176,0,0.06)',
        }}
        animate={
          isPlaying
            ? {
                borderColor: [
                  'rgba(224,176,0,0.18)',
                  'rgba(224,176,0,0.32)',
                  'rgba(224,176,0,0.18)',
                ],
              }
            : {}
        }
        transition={
          isPlaying ? { duration: 2.5, repeat: Infinity } : {}
        }
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(224,176,0,0.35), transparent)',
          }}
        />

        {/* Album art */}
        <motion.div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            background: isPlaying
              ? 'linear-gradient(135deg, #E0B000 0%, #8B6F00 100%)'
              : 'rgba(224,176,0,0.12)',
            border: isPlaying
              ? 'none'
              : '1px solid rgba(224,176,0,0.2)',
            boxShadow: isPlaying
              ? '0 0 20px rgba(224,176,0,0.45)'
              : 'none',
            transition: 'all 0.35s',
          }}
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5" style={{ height: 18 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`audio-bar-${i}`}
                  style={{ width: 3, background: '#000A1F', borderRadius: 2 }}
                />
              ))}
            </div>
          ) : (
            <Music2 size={18} color="rgba(224,176,0,0.7)" />
          )}
        </motion.div>

        {/* Song info */}
        <div
          className="flex-1 overflow-hidden"
          onClick={() => navigate('/app')}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Radio size={9} color={isPlaying ? '#E0B000' : 'rgba(255,255,255,0.25)'} />
            <p
              style={{
                color: isPlaying ? '#E0B000' : 'rgba(255,255,255,0.28)',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {isPlaying ? 'EN VIVO' : 'PAUSADO'}
            </p>
          </div>
          <p
            className="truncate"
            style={{
              color: 'white',
              fontSize: 13,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
            }}
          >
            {currentSong}
          </p>
        </div>

        {/* Play/Pause */}
        <motion.button
          onClick={toggle}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            background: isPlaying
              ? '#E0B000'
              : 'rgba(224,176,0,0.12)',
            border: isPlaying ? 'none' : '1px solid rgba(224,176,0,0.2)',
            boxShadow: isPlaying
              ? '0 0 20px rgba(224,176,0,0.55)'
              : '0 0 8px rgba(224,176,0,0.12)',
            transition: 'all 0.25s',
          }}
          whileTap={{ scale: 0.86 }}
          whileHover={{ scale: 1.06 }}
        >
          {isPlaying ? (
            <Pause size={16} color="#000A1F" fill="#000A1F" />
          ) : (
            <Play
              size={16}
              color="rgba(224,176,0,0.7)"
              fill="rgba(224,176,0,0.7)"
              style={{ marginLeft: 2 }}
            />
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
