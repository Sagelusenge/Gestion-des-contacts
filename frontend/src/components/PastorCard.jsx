import { Mail, MapPin, Phone } from 'lucide-react';

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

export function PastorCard({ pastor }) {
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
          {pastor.poste}
        </p>

        {pastor.email ? (
          <p className="connect-meta">
            <Mail size={16} />
            {pastor.email}
          </p>
        ) : null}
      </div>

      <div className="connect-actions">
        <a className="square-action call" href={pastor.actions?.call || `tel:${pastor.telephone}`} aria-label="Appeler">
          <Phone size={20} />
        </a>
        <a
          className="square-action whatsapp whatsapp-call"
          href={pastor.actions?.whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="Ouvrir WhatsApp pour appeler ou écrire"
          title="Appel WhatsApp"
        >
          <img src="/icons/whatsapp-logo.svg" alt="" />
        </a>
      </div>
    </article>
  );
}
