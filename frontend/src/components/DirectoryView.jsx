import { Download, Printer, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
import { printPastorsList } from '../utils/printRecord.js';
import { PastorCard } from './PastorCard.jsx';

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function DirectoryView({ token, onUnauthorized, user }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [query, setQuery] = useState('');
  const [activeDegree, setActiveDegree] = useState('');
  const [activePoste, setActivePoste] = useState('');
  const [posteSearch, setPosteSearch] = useState('');
  const [fonctionSearch, setFonctionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const isAdmin = user?.role === 'admin';

  const allPosteOptions = useMemo(() => {
    const values = postes.flatMap((poste) => [poste.region, poste.nom]).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [postes]);
  const posteOptions = useMemo(() => {
    const search = normalizeSearch(posteSearch);
    return allPosteOptions.filter((poste) => !search || poste === activePoste || normalizeSearch(poste).includes(search));
  }, [activePoste, allPosteOptions, posteSearch]);
  const fonctionOptions = useMemo(() => {
    const search = normalizeSearch(fonctionSearch);
    return fonctions
      .filter((fonction) => !search || fonction.nom === activeDegree || normalizeSearch(fonction.nom).includes(search))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [activeDegree, fonctions, fonctionSearch]);
  const hasActiveFilters = Boolean(query || activeDegree || activePoste);
  function resetFilters() {
    setQuery('');
    setActivePoste('');
    setActiveDegree('');
  }

  function downloadCsv(rows) {
    const headers = ['ID-SO_PA', 'Nom', 'Fonction', 'Poste', 'Entite', 'Telephone', 'Email', 'Date affectation'];
    const csvRows = rows.map((pastor) => [
      pastor.id_serviteur,
      pastor.nom,
      pastor.degre,
      pastor.poste,
      pastor.entite,
      pastor.telephone,
      pastor.email,
      pastor.date_affectation
    ]);
    const escapeValue = (value) => `"${String(value || '').replaceAll('"', '""')}"`;
    const generatedAt = new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());
    const intro = [
      ['Annuaire CBCA'],
      [`Etat de sortie genere le ${generatedAt}`],
      [`Nombre de pasteurs`, rows.length],
      []
    ];
    const csv = [...intro, headers, ...csvRows].map((row) => row.map(escapeValue).join(';')).join('\n');
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

  async function loadPastors() {
    setError('');
    setIsLoading(true);

    try {
      const payload = await api.searchPastors(token, {
        q: debouncedQuery,
        degre: activeDegree,
        poste: activePoste,
        page: 1,
        limit: 5000
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
        limit: 5000
      });
      printPastorsList(payload.data || [], {
        query: debouncedQuery,
        degre: activeDegree,
        poste: activePoste
      });
    } catch (printError) {
      if (printError.message.includes('Authentification') || printError.message.includes('Session')) {
        onUnauthorized();
        return;
      }
      setError(printError.message);
    }
  }

  useEffect(() => {
    Promise.all([api.getPostes(token), api.getFonctions(token)])
      .then(([postesPayload, fonctionsPayload]) => {
        setPostes(postesPayload.data || []);
        setFonctions(fonctionsPayload.data || []);
      })
      .catch(() => {
        setPostes([]);
        setFonctions([]);
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
            <input
              className="select-search-input"
              value={posteSearch}
              onChange={(event) => setPosteSearch(event.target.value)}
              placeholder="Rechercher poste/region..."
            />
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
            <span>Fonction</span>
            <input
              className="select-search-input"
              value={fonctionSearch}
              onChange={(event) => setFonctionSearch(event.target.value)}
              placeholder="Rechercher fonction..."
            />
            <select value={activeDegree} onChange={(event) => setActiveDegree(event.target.value)}>
              <option value="">Toutes les fonctions</option>
              {fonctionOptions.map((fonction) => (
                <option value={fonction.nom} key={fonction.id}>
                  {fonction.nom}
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
            {isAdmin && (
              <>
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
              </>
            )}
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

        {error ? <p className="notice error">{error}</p> : null}
        {isLoading ? <p className="notice">Chargement...</p> : null}

        <section className="connect-list" aria-live="polite">
          {!isLoading && pastors.length === 0 ? (
            <div className="empty-state">
              <span>
                <Search size={32} />
              </span>
              <p>Aucun pasteur trouve pour cette recherche.</p>
              <button
                type="button"
                onClick={resetFilters}
              >
                Reinitialiser les filtres
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
