import { CheckCircle2, MessageSquareText, RefreshCw, Star, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvee',
  rejected: 'Rejetee'
};

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('fr-CD', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function AppreciationsView({ token }) {
  const [appreciations, setAppreciations] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => {
    return appreciations.reduce((accumulator, appreciation) => {
      accumulator[appreciation.status] = (accumulator[appreciation.status] || 0) + 1;
      return accumulator;
    }, {});
  }, [appreciations]);

  async function loadAppreciations() {
    setIsLoading(true);
    setError('');

    try {
      const payload = await api.getAppreciations(token, status ? { status } : {});
      setAppreciations(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAppreciations();
  }, [token, status]);

  async function updateStatus(appreciation, nextStatus) {
    setMessage('');
    setError('');

    try {
      const payload = await api.updateAppreciationStatus(token, appreciation.id, nextStatus);
      setAppreciations((current) => current.map((item) => (item.id === appreciation.id ? payload.data : item)));
      setMessage('Statut mis a jour.');
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <div className="appreciations-page">
      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      <section className="metric-grid appreciations-metrics">
        <article className="metric-card">
          <MessageSquareText size={24} />
          <span>Total</span>
          <strong>{appreciations.length}</strong>
        </article>
        <article className="metric-card">
          <RefreshCw size={24} />
          <span>En attente</span>
          <strong>{counts.pending || 0}</strong>
        </article>
        <article className="metric-card">
          <CheckCircle2 size={24} />
          <span>Approuvees</span>
          <strong>{counts.approved || 0}</strong>
        </article>
        <article className="metric-card">
          <XCircle size={24} />
          <span>Rejetees</span>
          <strong>{counts.rejected || 0}</strong>
        </article>
      </section>

      <section className="quick-actions-panel appreciations-toolbar">
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrer les appreciations">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvees</option>
          <option value="rejected">Rejetees</option>
        </select>
        <button type="button" onClick={loadAppreciations} disabled={isLoading}>
          <RefreshCw size={18} />
          {isLoading ? 'Chargement...' : 'Actualiser'}
        </button>
      </section>

      <section className="appreciation-list">
        {!isLoading && appreciations.length === 0 ? (
          <article className="dark-panel empty-panel">
            <MessageSquareText size={28} />
            <h2>Aucune appreciation</h2>
            <p>Les messages envoyes par les clients apparaitront ici.</p>
          </article>
        ) : null}

        {appreciations.map((appreciation) => (
          <article className="dark-panel appreciation-card" key={appreciation.id}>
            <div className="appreciation-card-main">
              <div className="appreciation-card-heading">
                <span className={`appreciation-status ${appreciation.status}`}>{statusLabels[appreciation.status] || appreciation.status}</span>
                <strong>{appreciation.nom}</strong>
                <span className="appreciation-rating">
                  <Star size={16} />
                  {appreciation.note}/5
                </span>
              </div>
              <p>{appreciation.message}</p>
              <small>{appreciation.quartier || 'Sans quartier'} - {formatDate(appreciation.created_at)}</small>
            </div>
            <div className="appreciation-card-actions">
              <button className="payment-action confirm" type="button" onClick={() => updateStatus(appreciation, 'approved')} disabled={appreciation.status === 'approved'}>
                Approuver
              </button>
              <button className="payment-action reject" type="button" onClick={() => updateStatus(appreciation, 'rejected')} disabled={appreciation.status === 'rejected'}>
                Rejeter
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
