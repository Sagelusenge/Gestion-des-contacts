import { Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

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
  const [copied, setCopied] = useState(false);
  const contactText = [
    `${pastor.degre} ${pastor.nom}`,
    pastor.poste,
    pastor.telephone ? `Tel: ${pastor.telephone}` : '',
    pastor.email ? `Email: ${pastor.email}` : ''
  ].filter(Boolean).join('\n');

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(contactText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

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
        <a className="square-action call" href={pastor.actions?.call || `tel:${pastor.telephone}`} aria-label="Appeler">
          <Phone size={20} />
        </a>
        {pastor.email ? (
          <a className="square-action email" href={`mailto:${pastor.email}`} aria-label="Envoyer un email">
            <Mail size={20} />
          </a>
        ) : null}
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
        <button className="square-action copy-contact" type="button" onClick={copyContact} aria-label="Copier le contact">
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </article>
  );
}
