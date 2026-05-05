import { motion } from 'motion/react';
import { Users, Radio, Star, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

const stats = [
  { icon: Users,      value: '1Mill+', label: 'Oyentes al mes',  sub: 'en todo el mundo' },
  { icon: Radio,      value: '24/7',   label: 'Al aire',         sub: 'sin interrupciones' },
  { icon: Star,       value: '5.0★',   label: 'Calificación',    sub: 'oyentes satisfechos' },
];

const benefits = [
  'Menciones al aire en vivo durante la transmisión',
  'Publicaciones en nuestras redes sociales',
  'Banner destacado en nuestro sitio web',
  'Cuñas comerciales con producción profesional',
  'Reporte detallado de alcance semanal',
  'Cobertura en toda Latinoamérica y EE.UU.',
];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width={22} height={22}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function Advertise() {
  return (
    <div
      className="min-h-full px-5 py-5"
      style={{ background: '#000A1F', paddingBottom: 100 }}
    >
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48 }}
        className="relative rounded-3xl overflow-hidden mb-5 p-6"
        style={{
          background:
            'linear-gradient(140deg, rgba(224,176,0,0.14) 0%, rgba(0,14,44,0.95) 55%, rgba(0,8,28,0.99) 100%)',
          border: '1px solid rgba(224,176,0,0.2)',
          boxShadow:
            '0 0 60px rgba(224,176,0,0.05), 0 20px 50px rgba(0,0,0,0.45)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(224,176,0,0.12) 0%, transparent 68%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -30,
            left: -30,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(224,176,0,0.07) 0%, transparent 68%)',
            filter: 'blur(20px)',
          }}
        />
        {/* Shimmer top border */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(224,176,0,0.55), transparent)',
          }}
        />

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: 'rgba(224,176,0,0.1)',
              border: '1px solid rgba(224,176,0,0.26)',
            }}
          >
            <Zap size={11} color="#E0B000" fill="#E0B000" />
            <span
              style={{
                color: '#E0B000',
                fontSize: 9,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                letterSpacing: '1.5px',
              }}
            >
              PUBLICIDAD & MARKETING
            </span>
          </div>

          <h1
            style={{
              color: 'white',
              fontSize: 28,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              lineHeight: 1.14,
              marginBottom: 12,
            }}
          >
            Haz crecer tu marca{' '}
            <span style={{ color: '#E0B000' }}>con nosotros</span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.58)',
              fontSize: 13,
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.62,
            }}
          >
            Llegamos a miles de fanáticos del reggaetón en toda Latinoamérica.
            Tu marca merece un escenario como el nuestro.
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + index * 0.07, duration: 0.4 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(0,16,50,0.72)',
              border: '1px solid rgba(224,176,0,0.09)',
              backdropFilter: 'blur(14px)',
            }}
            whileHover={{
              borderColor: 'rgba(224,176,0,0.22)',
              background: 'rgba(0,20,60,0.8)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl mb-2.5"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(224,176,0,0.1)',
                border: '1px solid rgba(224,176,0,0.18)',
              }}
            >
              <stat.icon size={18} color="#E0B000" />
            </div>
            <div
              style={{
                color: '#E0B000',
                fontSize: 24,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                color: 'white',
                fontSize: 12,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: 10,
                fontFamily: 'Montserrat, sans-serif',
                marginTop: 2,
              }}
            >
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
        className="rounded-2xl p-5 mb-5"
        style={{
          background: 'rgba(0,16,50,0.72)',
          border: '1px solid rgba(255,255,255,0.055)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 3, height: 16, background: '#E0B000', borderRadius: 2 }} />
          <h3
            style={{
              color: 'white',
              fontSize: 14,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
            }}
          >
            ¿Qué incluye tu pauta?
          </h3>
        </div>
        {benefits.map((benefit, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 py-2.5"
            style={{
              borderBottom:
                i < benefits.length - 1
                  ? '1px solid rgba(255,255,255,0.035)'
                  : 'none',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.05, duration: 0.3 }}
          >
            <CheckCircle2
              size={15}
              color="#E0B000"
              fill="rgba(224,176,0,0.12)"
              strokeWidth={2}
            />
            <span
              style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 13,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {benefit}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.a
        href="https://api.whatsapp.com/send/?phone=573017637182&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="flex items-center justify-center gap-3 py-4 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(135deg, #E0B000 0%, #C49800 55%, #A07C00 100%)',
          boxShadow:
            '0 10px 40px rgba(224,176,0,0.4), 0 2px 8px rgba(224,176,0,0.2)',
          textDecoration: 'none',
        }}
        whileHover={{
          boxShadow:
            '0 14px 50px rgba(224,176,0,0.55), 0 4px 12px rgba(224,176,0,0.25)',
          scale: 1.01,
        }}
        whileTap={{ scale: 0.97 }}
      >
        <WhatsAppIcon />
        <span
          style={{
            color: '#000A1F',
            fontSize: 15,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            letterSpacing: '0.3px',
          }}
        >
          Escríbenos por WhatsApp
        </span>
        <ArrowRight size={16} color="#000A1F" strokeWidth={2.5} />
      </motion.a>
    </div>
  );
}