import { Download, MessageCircle, Printer, RefreshCw, RotateCcw, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
import { printPastorsList } from '../utils/printRecord.js';
import { PastorCard } from './PastorCard.jsx';

export function DirectoryView({ token, onUnauthorized }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [query, setQuery] = useState('');
  const [activeDegree, setActiveDegree] = useState('');
  const [activePoste, setActivePoste] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [showBulkLinks, setShowBulkLinks] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const posteOptions = useMemo(() => {
    const values = postes.flatMap((poste) => [poste.region, poste.nom]).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [postes]);
  const hasActiveFilters = Boolean(query || activeDegree || activePoste);
  const whatsappTargets = useMemo(() => pastors
    .map((pastor) => {
      const phone = String(pastor.telephone || '').replace(/[^\d]/g, '');
      return {
        id: pastor.id,
        name: pastor.nom,
        phone,
        url: phone && bulkMessage.trim()
          ? `https://wa.me/${phone}?text=${encodeURIComponent(bulkMessage.trim())}`
          : ''
      };
    })
    .filter((target) => target.phone), [pastors, bulkMessage]);
  const canPrepareBulkMessage = Boolean(bulkMessage.trim() && whatsappTargets.length);

  function resetFilters() {
    setQuery('');
    setActivePoste('');
    setActiveDegree('');
  }

  function downloadCsv(rows) {
    const headers = ['Nom', 'Grade', 'Poste', 'Telephone', 'Email', 'Date affectation'];
    const csvRows = rows.map((pastor) => [
      pastor.nom,
      pastor.degre,
      pastor.poste,
      pastor.telephone,
      pastor.email,
      pastor.date_affectation
    ]);
    const escapeValue = (value) => `"${String(value || '').replaceAll('"', '""')}"`;
    const csv = [headers, ...csvRows].map((row) => row.map(escapeValue).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pasteurs-cbca-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function openFirstWhatsAppMessage() {
    if (!canPrepareBulkMessage) {
      return;
    }

    setShowBulkLinks(true);
    window.open(whatsappTargets[0].url, '_blank', 'noopener,noreferrer');
  }

  async function loadPastors() {
    setError('');
    setIsLoading(true);

    try {
      const payload = await api.searchPastors(token, {
        q: debouncedQuery,
        degre: activeDegree,
        poste: activePoste,
        page: 1,
        limit: 1000
      });
      setPastors(payload.data || []);
    } catch (loadError) {
      if (loadError.message.includes('Authentification') || loadError.message.includes('Session')) {
        onUnauthorized();
        return;
      }
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePrintAllPastors() {
    setError('');

    try {
      const payload = await api.getPastors(token, {
        page: 1,
        limit: 1000
      });
      printPastorsList(payload.data || []);
    } catch (printError) {
      if (printError.message.includes('Authentification') || printError.message.includes('Session')) {
        onUnauthorized();
        return;
      }
      setError(printError.message);
    }
  }

  useEffect(() => {
    Promise.all([api.getPostes(token), api.getGrades(token)])
      .then(([postesPayload, gradesPayload]) => {
        setPostes(postesPayload.data || []);
        setGrades(gradesPayload.data || []);
      })
      .catch(() => {
        setPostes([]);
        setGrades([]);
      });
  }, [token]);

  useEffect(() => {
    loadPastors();
  }, [debouncedQuery, activeDegree, activePoste]);

  return (
    <main className="app-main connect-main">
      <section className="directory-panel directory-panel-simple">
        <div className="search-group">
          <label className="connect-search">
            <Search size={21} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un pasteur..."
            />
          </label>
          <button className="refresh-inline" type="button" onClick={loadPastors} aria-label="Actualiser">
            <RefreshCw size={19} />
          </button>
        </div>

        <div className="simple-filter-bar">
          <label>
            <span>Poste</span>
            <select value={activePoste} onChange={(event) => setActivePoste(event.target.value)}>
              <option value="">Tous les postes</option>
              {posteOptions.map((poste) => (
                <option value={poste} key={poste}>
                  {poste}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Grade</span>
            <select value={activeDegree} onChange={(event) => setActiveDegree(event.target.value)}>
              <option value="">Tous les grades</option>
              {grades.map((grade) => (
                <option value={grade.nom} key={grade.id}>
                  {grade.nom}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="directory-summary-row">
          <div className="directory-summary">
            <strong>{pastors.length}</strong>
            <span>{pastors.length > 1 ? 'pasteurs trouvés' : 'pasteur trouvé'}</span>
          </div>
          <div className="directory-actions">
            <button
              className="print-all-button"
              type="button"
              onClick={() => downloadCsv(pastors)}
              disabled={isLoading || pastors.length === 0}
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              className="print-all-button"
              type="button"
              onClick={handlePrintAllPastors}
              disabled={isLoading}
            >
              <Printer size={18} />
              Imprimer tous
            </button>
            <button
              className="print-all-button quiet-action"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw size={18} />
              Reinitialiser
            </button>
          </div>
        </div>

        <section className="bulk-whatsapp-panel" aria-label="Message WhatsApp groupe">
          <div className="bulk-whatsapp-heading">
            <div>
              <h2>Message WhatsApp groupe</h2>
              <p>
                {whatsappTargets.length} destinataire{whatsappTargets.length > 1 ? 's' : ''} avec numero
                {activePoste ? ` pour ${activePoste}` : ' dans les resultats affiches'}
              </p>
            </div>
            <MessageCircle size={24} />
          </div>

          <label className="bulk-message-field">
            <span>Message a envoyer</span>
            <textarea
              rows="4"
              value={bulkMessage}
              onChange={(event) => {
                setBulkMessage(event.target.value);
                setShowBulkLinks(false);
              }}
              placeholder="Ex: Bonjour Pasteur, reunion ce samedi a 10h au bureau CBCA..."
            />
          </label>

          <div className="bulk-whatsapp-actions">
            <button
              className="admin-primary"
              type="button"
              onClick={openFirstWhatsAppMessage}
              disabled={!canPrepareBulkMessage}
            >
              <Send size={18} />
              Ouvrir le 1er WhatsApp
            </button>
            <button
              className="print-all-button quiet-action"
              type="button"
              onClick={() => setShowBulkLinks((current) => !current)}
              disabled={!canPrepareBulkMessage}
            >
              <MessageCircle size={18} />
              {showBulkLinks ? 'Masquer la liste' : 'Voir les destinataires'}
            </button>
          </div>

          {showBulkLinks ? (
            <div className="bulk-link-list">
              {whatsappTargets.map((target, index) => (
                <a href={target.url} target="_blank" rel="noreferrer" key={target.id}>
                  <span>{index + 1}. {target.name}</span>
                  <strong>Ouvrir</strong>
                </a>
              ))}
            </div>
          ) : null}
        </section>

        {error ? <p className="notice error">{error}</p> : null}
        {isLoading ? <p className="notice">Chargement...</p> : null}

        <section className="connect-list" aria-live="polite">
          {!isLoading && pastors.length === 0 ? (
            <div className="empty-state">
              <span>
                <Search size={32} />
              </span>
              <p>Aucun pasteur trouvé pour cette recherche.</p>
              <button
                type="button"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : null}
          {pastors.map((pastor) => (
            <PastorCard pastor={pastor} key={pastor.id} />
          ))}
        </section>
      </section>
    </main>
  );
}
