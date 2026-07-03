import { Mail, MapPin, MessageSquareText, Phone } from 'lucide-react';

const degreeClassNames = {
  Révérend: 'badge gold',
  Pasteur: 'badge teal',
  Évangéliste: 'badge blue',
  Aumônier: 'badge violet',
  Stagiaire: 'badge gray'
};

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  const normalized = digits.startsWith('00')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? `243${digits.slice(1)}`
      : digits.length === 9 && ['8', '9'].includes(digits[0])
        ? `243${digits}`
        : digits;

  return normalized ? `https://wa.me/${normalized}` : '';
}

export function PastorCard({ pastor }) {
  const whatsappUrl = pastor.actions?.whatsapp?.split('?')[0] || getWhatsAppUrl(pastor.telephone);

  return (
    <article className="connect-card">
      <div className="connect-avatar" aria-hidden="true">
        {getInitials(pastor.nom)}
      </div>

      <div className="connect-card-main">
        <div className="connect-card-title">
          <h2>{pastor.degre} {pastor.nom}</h2>
          <span className={degreeClassNames[pastor.degre] || 'badge gray'}>{pastor.degre}</span>
        </div>

        <p className="connect-meta">
          <MapPin size={16} />
          {pastor.poste}{pastor.entite ? ` - ${pastor.entite}` : ''}
        </p>

        {pastor.telephone ? (
          <p className="connect-meta">
            <Phone size={16} />
            {pastor.telephone}
          </p>
        ) : null}

        {pastor.email ? (
          <p className="connect-meta">
            <Mail size={16} />
            {pastor.email}
          </p>
        ) : null}
      </div>

      <div className="connect-actions">
        {pastor.telephone ? (
          <>
            <a
              className="square-action call"
              href={pastor.actions?.call || `tel:${pastor.telephone}`}
              aria-label="Appeler par téléphone"
              title="Appel téléphonique"
            >
              <Phone size={20} />
            </a>
            <a
              className="square-action whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Ouvrir WhatsApp"
              title="WhatsApp"
            >
              <img src="/icons/whatsapp-logo.svg" alt="" />
            </a>
            <a
              className="square-action sms"
              href={`sms:${pastor.telephone}`}
              aria-label="Envoyer un SMS"
              title="SMS"
            >
              <MessageSquareText size={20} />
            </a>
          </>
        ) : null}
      </div>
    </article>
  );
}
