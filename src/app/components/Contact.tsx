import { motion } from 'motion/react';
import { Mail, Globe, Clock, ChevronRight, Headphones } from 'lucide-react';

const LOGO_URL =
  'https://clasicosdelreggaeton.com/sitepad-data/uploads/2023/03/logopagina_Mesa-de-trabajo-1.png';

const WhatsAppIcon = ({ size = 22, color = '#25D366' }) => (
  <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const contactItems = [
  {
    id: 'email',
    icon: <Mail size={20} color="#E0B000" />,
    iconBg: 'rgba(224,176,0,0.1)',
    iconBorder: 'rgba(224,176,0,0.22)',
    label: 'Correo Electrónico',
    value: 'contacto@clasicosdelreggaeton.com',
    href: 'mailto:contacto@clasicosdelreggaeton.com',
    external: false,
  },
  {
    id: 'whatsapp',
    icon: <WhatsAppIcon />,
    iconBg: 'rgba(37,211,102,0.08)',
    iconBorder: 'rgba(37,211,102,0.2)',
    label: 'WhatsApp',
    value: '+57 301 763 7182',
    href: 'https://api.whatsapp.com/send/?phone=573017637182&text&type=phone_number&app_absent=0',
    external: true,
  },
  {
    id: 'web',
    icon: <Globe size={20} color="#E0B000" />,
    iconBg: 'rgba(224,176,0,0.1)',
    iconBorder: 'rgba(224,176,0,0.22)',
    label: 'Sitio Web',
    value: 'clasicosdelreggaeton.com',
    href: 'https://clasicosdelreggaeton.com',
    external: true,
  },
  {
    id: 'hours',
    icon: <Clock size={20} color="#E0B000" />,
    iconBg: 'rgba(224,176,0,0.1)',
    iconBorder: 'rgba(224,176,0,0.22)',
    label: 'Horario de Atención',
    value: 'Lun – Vie · 9:00 AM – 6:00 PM',
    href: null,
    external: false,
  },
];

export function Contact() {
  return (
    <div
      className="min-h-full px-5 py-5"
      style={{ background: '#000A1F', paddingBottom: 100 }}
    >
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48 }}
        className="relative rounded-3xl p-6 mb-5 text-center overflow-hidden"
        style={{
          background:
            'linear-gradient(160deg, rgba(224,176,0,0.1) 0%, rgba(0,14,44,0.9) 48%, rgba(0,8,28,0.98) 100%)',
          border: '1px solid rgba(224,176,0,0.18)',
          boxShadow: '0 0 45px rgba(224,176,0,0.04), 0 18px 50px rgba(0,0,0,0.45)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(224,176,0,0.1) 0%, transparent 62%)',
          }}
        />
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(224,176,0,0.5), transparent)',
          }}
        />

        <div className="relative z-10">
          {/* Headphones icon */}
          <div
            className="flex items-center justify-center rounded-2xl mx-auto mb-4"
            style={{
              width: 52,
              height: 52,
              background: 'rgba(224,176,0,0.09)',
              border: '1px solid rgba(224,176,0,0.2)',
              boxShadow: '0 0 24px rgba(224,176,0,0.1)',
            }}
          >
            <Headphones size={24} color="#E0B000" />
          </div>

          <img
            src={LOGO_URL}
            alt="Logo"
            style={{
              height: 60,
              width: 'auto',
              margin: '0 auto 14px',
              filter:
                'drop-shadow(0 0 14px rgba(224,176,0,0.48)) drop-shadow(0 0 32px rgba(224,176,0,0.12))',
            }}
          />
          <h2
            style={{
              color: 'white',
              fontSize: 19,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              marginBottom: 5,
            }}
          >
            Clásicos del Reggaetón
          </h2>
          <p
            style={{
              color: 'rgba(224,176,0,0.72)',
              fontSize: 11,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              letterSpacing: '1.2px',
            }}
          >
            RADIO ONLINE · EN VIVO 24/7
          </p>
        </div>
      </motion.div>

      {/* Contact items */}
      <div className="flex flex-col gap-3 mb-5">
        {contactItems.map((item, index) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background: 'rgba(0,16,50,0.72)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(14px)',
              }}
              whileHover={{
                borderColor: 'rgba(224,176,0,0.18)',
                background: 'rgba(0,20,60,0.8)',
                x: item.href ? 3 : 0,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 46,
                  height: 46,
                  background: item.iconBg,
                  border: `1px solid ${item.iconBorder}`,
                }}
              >
                {item.icon}
              </div>
              <div className="flex-1 overflow-hidden">
                <div
                  style={{
                    color: 'rgba(255,255,255,0.32)',
                    fontSize: 9,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    marginBottom: 3,
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="truncate"
                  style={{
                    color: 'white',
                    fontSize: 13,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {item.value}
                </div>
              </div>
              {item.href && (
                <ChevronRight size={17} color="rgba(224,176,0,0.38)" />
              )}
            </motion.div>
          );

          return item.href ? (
            <a
              key={item.id}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              style={{ textDecoration: 'none' }}
            >
              {inner}
            </a>
          ) : (
            <div key={item.id}>{inner}</div>
          );
        })}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <motion.a
          href="mailto:contacto@clasicosdelreggaeton.com"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.4 }}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #E0B000 0%, #C49800 55%, #A07C00 100%)',
            boxShadow: '0 8px 32px rgba(224,176,0,0.34)',
            textDecoration: 'none',
          }}
          whileHover={{
            boxShadow: '0 12px 44px rgba(224,176,0,0.48)',
            scale: 1.01,
          }}
          whileTap={{ scale: 0.97 }}
        >
          <Mail size={18} color="#000A1F" />
          <span
            style={{
              color: '#000A1F',
              fontSize: 14,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
            }}
          >
            Enviar Correo
          </span>
        </motion.a>

        <motion.a
          href="https://api.whatsapp.com/send/?phone=573017637182&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl"
          style={{
            background: 'rgba(37,211,102,0.08)',
            border: '1px solid rgba(37,211,102,0.26)',
            textDecoration: 'none',
          }}
          whileHover={{
            background: 'rgba(37,211,102,0.13)',
            borderColor: 'rgba(37,211,102,0.4)',
          }}
          whileTap={{ scale: 0.97 }}
        >
          <WhatsAppIcon size={18} />
          <span
            style={{
              color: '#25D366',
              fontSize: 14,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
            }}
          >
            Contactar por WhatsApp
          </span>
        </motion.a>
      </div>
    </div>
  );
}
