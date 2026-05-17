import { CheckCircle2, Copy, CreditCard, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Valide',
  rejected: 'Rejete'
};

const providerLabels = {
  airtel: 'Airtel Money',
  orange: 'Orange Money',
  mpesa: 'M-Pesa'
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

function paymentText(payment) {
  return [
    'Paiement CBCA',
    `Mode: ${providerLabels[payment.provider] || payment.provider}`,
    payment.amount ? `Montant: ${payment.amount} ${payment.currency}` : '',
    payment.payer_phone ? `Numero: ${payment.payer_phone}` : '',
    `TransID: ${payment.trans_id}`,
    `Statut: ${statusLabels[payment.status] || payment.status}`,
    payment.submitted_by_username ? `Envoye par: ${payment.submitted_by_username}` : '',
    payment.note ? `Note: ${payment.note}` : '',
    `Date: ${formatDate(payment.created_at)}`
  ].filter(Boolean).join('\n');
}

export function PaymentsView({ token }) {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const counts = useMemo(() => {
    return payments.reduce((accumulator, payment) => {
      accumulator[payment.status] = (accumulator[payment.status] || 0) + 1;
      return accumulator;
    }, {});
  }, [payments]);

  async function loadPayments() {
    setIsLoading(true);
    setError('');

    try {
      const payload = await api.getPayments(token, status ? { status } : {});
      setPayments(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [token, status]);

  async function updateStatus(payment, nextStatus) {
    setMessage('');
    setError('');

    try {
      const payload = await api.updatePaymentStatus(token, payment.id, nextStatus);
      setPayments((current) => current.map((item) => (item.id === payment.id ? payload.data : item)));
      setMessage('Statut de paiement mis a jour.');
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function copyPayment(payment) {
    await navigator.clipboard.writeText(paymentText(payment));
    setMessage('Preuve copiee.');
  }

  return (
    <div className="payments-page">
      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      <section className="metric-grid payments-metrics">
        <article className="metric-card">
          <CreditCard size={24} />
          <span>Total</span>
          <strong>{payments.length}</strong>
        </article>
        <article className="metric-card">
          <RefreshCw size={24} />
          <span>En attente</span>
          <strong>{counts.pending || 0}</strong>
        </article>
        <article className="metric-card">
          <CheckCircle2 size={24} />
          <span>Valides</span>
          <strong>{counts.confirmed || 0}</strong>
        </article>
        <article className="metric-card">
          <XCircle size={24} />
          <span>Rejetes</span>
          <strong>{counts.rejected || 0}</strong>
        </article>
      </section>

      <section className="quick-actions-panel payments-toolbar">
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrer les paiements">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Valides</option>
          <option value="rejected">Rejetes</option>
        </select>
        <button type="button" onClick={loadPayments} disabled={isLoading}>
          <RefreshCw size={18} />
          {isLoading ? 'Chargement...' : 'Actualiser'}
        </button>
      </section>

      <section className="payment-list">
        {!isLoading && payments.length === 0 ? (
          <article className="dark-panel empty-panel">
            <CreditCard size={28} />
            <h2>Aucune preuve</h2>
            <p>Les TransID envoyes depuis l'app mobile apparaitront ici.</p>
          </article>
        ) : null}

        {payments.map((payment) => (
          <article className="dark-panel payment-card" key={payment.id}>
            <div className="payment-card-main">
              <div className="payment-card-heading">
                <span className={`payment-status ${payment.status}`}>{statusLabels[payment.status] || payment.status}</span>
                <strong>{providerLabels[payment.provider] || payment.provider}</strong>
              </div>
              <h2>{payment.trans_id}</h2>
              <p>
                {payment.amount ? `${payment.amount} ${payment.currency}` : 'Montant non precise'}
                {payment.payer_phone ? ` - ${payment.payer_phone}` : ''}
              </p>
              <p>{payment.note || 'Sans note'}</p>
              <small>{formatDate(payment.created_at)}{payment.submitted_by_username ? ` - ${payment.submitted_by_username}` : ''}</small>
            </div>
            <div className="payment-card-actions">
              <button className="row-action print" type="button" onClick={() => copyPayment(payment)} aria-label="Copier">
                <Copy size={18} />
              </button>
              <button className="payment-action confirm" type="button" onClick={() => updateStatus(payment, 'confirmed')} disabled={payment.status === 'confirmed'}>
                Valider
              </button>
              <button className="payment-action reject" type="button" onClick={() => updateStatus(payment, 'rejected')} disabled={payment.status === 'rejected'}>
                Rejeter
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
