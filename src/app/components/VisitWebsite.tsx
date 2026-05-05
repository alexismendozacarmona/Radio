import { motion } from 'motion/react';
import {
  Globe,
  ExternalLink,
  Newspaper,
  Music2,
  Radio,
  Users,
  Mic2,
  Star,
  ArrowRight,
} from 'lucide-react';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1771959453900-13eda5b0875c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBjb25jZXJ0JTIwbGF0aW4lMjB1cmJhbiUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3MjEzNTEwN3ww&ixlib=rb-4.1.0&q=80&w=700';

const LOGO_URL =
  'https://clasicosdelreggaeton.com/sitepad-data/uploads/2023/03/logopagina_Mesa-de-trabajo-1.png';

const features = [
  { icon: Newspaper, title: 'Noticias',    desc: 'Últimas del reggaetón' },
  { icon: Music2,    title: 'Discografía', desc: 'Clásicos y nuevos hits' },
  { icon: Radio,     title: 'Radio Live',  desc: 'Streaming 24/7' },
  { icon: Users,     title: 'Comunidad',   desc: 'Fans globales' },
  { icon: Mic2,      title: 'Artistas',    desc: 'Perfiles y biografías' },
  { icon: Star,      title: 'Listas Top',  desc: 'Los más escuchados' },
];

export function VisitWebsite() {
  return (
    <div
      className="min-h-full px-4 py-4"
      style={{ background: '#000A1F', paddingBottom: 100 }}
    >
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48 }}
        className="relative rounded-3xl overflow-hidden mb-5"
        style={{
          border: '1px solid rgba(224,176,0,0.18)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
        }}
      >
        {/* Cover image */}
        <div className="relative" style={{ height: 180 }}>
          <img
            src={BG_IMAGE}
            alt="Sitio web"
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.6)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgba(0,10,31,1) 0%, rgba(0,10,31,0.5) 50%, rgba(0,10,31,0.15) 90%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 45%, rgba(0,5,18,0.55) 100%)',
            }}
          />
          {/* Top gold shimmer */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(224,176,0,0.5), transparent)',
            }}
          />
          {/* Official badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(0,10,31,0.8)',
              border: '1px solid rgba(224,176,0,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Globe size={11} color="#E0B000" />
            <span
              style={{
                color: '#E0B000',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              SITIO OFICIAL
            </span>
          </div>
        </div>

        {/* Info section */}
        <div
          className="p-5"
          style={{
            background: 'rgba(0,12,38,0.94)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              style={{
                height: 48,
                width: 'auto',
                filter: 'drop-shadow(0 0 10px rgba(224,176,0,0.42))',
              }}
            />
            <div>
              <h2
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  marginBottom: 3,
                }}
              >
                clasicosdelreggaeton.com
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Noticias · Artistas · Historia · Más
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section label */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div style={{ width: 3, height: 14, background: '#E0B000', borderRadius: 2 }} />
        <span
          style={{
            color: 'rgba(255,255,255,0.48)',
            fontSize: 10,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            letterSpacing: '1.8px',
          }}
        >
          QUÉ ENCONTRARÁS
        </span>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.06, duration: 0.38 }}
            className="rounded-2xl p-3.5 text-center"
            style={{
              background: 'rgba(0,16,50,0.72)',
              border: '1px solid rgba(224,176,0,0.08)',
              backdropFilter: 'blur(12px)',
            }}
            whileHover={{
              borderColor: 'rgba(224,176,0,0.22)',
              background: 'rgba(0,20,60,0.8)',
              y: -2,
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl mx-auto mb-2"
              style={{
                width: 38,
                height: 38,
                background: 'rgba(224,176,0,0.09)',
                border: '1px solid rgba(224,176,0,0.16)',
              }}
            >
              <feature.icon size={17} color="#E0B000" />
            </div>
            <div
              style={{
                color: 'white',
                fontSize: 11,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
              }}
            >
              {feature.title}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                marginTop: 2,
              }}
            >
              {feature.desc}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48, duration: 0.42 }}
        className="rounded-2xl p-5 mb-5"
        style={{
          background: 'rgba(0,16,50,0.62)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 13,
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.68,
            textAlign: 'center',
          }}
        >
          Descubre la historia del reggaetón, lee las últimas noticias, conoce
          tus artistas favoritos y mucho más en el portal oficial de{' '}
          <span style={{ color: '#E0B000', fontWeight: 700 }}>
            Clásicos del Reggaetón.
          </span>
        </p>
      </motion.div>

      {/* CTA */}
      <motion.a
        href="https://clasicosdelreggaeton.com"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, duration: 0.42 }}
        className="flex items-center justify-center gap-3 py-4 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(135deg, #E0B000 0%, #C49800 55%, #A07C00 100%)',
          boxShadow: '0 10px 40px rgba(224,176,0,0.4)',
          textDecoration: 'none',
        }}
        whileHover={{
          boxShadow: '0 14px 50px rgba(224,176,0,0.55)',
          scale: 1.01,
        }}
        whileTap={{ scale: 0.97 }}
      >
        <Globe size={18} color="#000A1F" />
        <span
          style={{
            color: '#000A1F',
            fontSize: 15,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
          }}
        >
          Visitar Sitio Web
        </span>
        <ArrowRight size={16} color="#000A1F" strokeWidth={2.5} />
      </motion.a>

      {/* URL hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-1.5 mt-3"
      >
        <ExternalLink size={10} color="rgba(255,255,255,0.2)" />
        <span
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: 10,
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          clasicosdelreggaeton.com
        </span>
      </motion.div>
    </div>
  );
}
