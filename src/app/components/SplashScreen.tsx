import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

const LOGO_URL =
  'https://clasicosdelreggaeton.com/sitepad-data/uploads/2023/03/logopagina_Mesa-de-trabajo-1.png';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/app'), 3400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: '#000A1F' }}
    >
      {/* Stars / particle field */}
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 4 === 0 ? 2.5 : 1.5,
            height: i % 4 === 0 ? 2.5 : 1.5,
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            background: i % 3 === 0 ? 'rgba(224,176,0,0.5)' : 'rgba(255,255,255,0.2)',
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2.5 + (i % 5) * 0.6,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Deep cinematic background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(224,176,0,0.06) 0%, rgba(0,5,18,0.3) 45%, rgba(0,0,0,0) 65%)',
        }}
      />

      {/* Vertical light beam */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 120,
          height: '60%',
          background:
            'linear-gradient(180deg, rgba(224,176,0,0) 0%, rgba(224,176,0,0.12) 40%, rgba(224,176,0,0.05) 70%, rgba(224,176,0,0) 100%)',
          filter: 'blur(22px)',
        }}
        initial={{ opacity: 0, scaleX: 0.3 }}
        animate={{ opacity: [0, 1, 0.7, 1], scaleX: [0.3, 1, 0.8, 1] }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
      />

      {/* Wide ambient glow — bottom pool */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 360,
          height: 160,
          background:
            'radial-gradient(ellipse at bottom, rgba(224,176,0,0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Outer rings */}
      {[340, 270, 205].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(224,176,0,${0.08 + i * 0.04})`,
          }}
          animate={{
            scale: [1, 1.08 + i * 0.06, 1],
            opacity: [0.35 - i * 0.08, 0.08, 0.35 - i * 0.08],
          }}
          transition={{
            duration: 3.2 - i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Core glow blob */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 240,
          height: 240,
          background:
            'radial-gradient(circle, rgba(224,176,0,0.22) 0%, rgba(224,176,0,0.06) 45%, rgba(224,176,0,0) 70%)',
          filter: 'blur(24px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.72, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Logo halo */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%) translate(50%, 50%)',
              width: '130%',
              height: '130%',
              background:
                'radial-gradient(circle, rgba(224,176,0,0.18) 0%, transparent 65%)',
              filter: 'blur(18px)',
              top: 0,
              left: 0,
            }}
          />
          <img
            src={LOGO_URL}
            alt="Clásicos del Reggaetón"
            style={{
              width: 220,
              height: 'auto',
              filter:
                'drop-shadow(0 0 24px rgba(224,176,0,0.6)) drop-shadow(0 0 70px rgba(224,176,0,0.22)) drop-shadow(0 4px 16px rgba(0,0,0,0.6))',
            }}
          />
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex items-center gap-[7px]"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: i === 1 || i === 2 ? 9 : 5,
                height: i === 1 || i === 2 ? 9 : 5,
                background:
                  i === 1 || i === 2
                    ? '#E0B000'
                    : 'rgba(224,176,0,0.4)',
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.7, 1.3, 0.7],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="flex flex-col items-center gap-1"
        >
          <p
            style={{
              color: 'rgba(224,176,0,0.65)',
              fontSize: 10,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              letterSpacing: '3.5px',
              textTransform: 'uppercase',
            }}
          >
            Radio Online
          </p>
          <div
            style={{
              width: 40,
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(224,176,0,0.5), transparent)',
            }}
          />
          <p
            style={{
              color: 'rgba(224,176,0,0.4)',
              fontSize: 9,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            En Vivo 24/7
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 130,
          background:
            'linear-gradient(0deg, rgba(0,5,15,0.9) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
