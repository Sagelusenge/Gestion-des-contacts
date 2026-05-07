import { Printer, RefreshCw, Search } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const posteOptions = useMemo(() => {
    const values = postes.flatMap((poste) => [poste.region, poste.nom]).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [postes]);

  async function loadPastors() {
    setError('');
    setIsLoading(true);

    try {
      const payload = await api.searchPastors(token, {
        q: debouncedQuery,
        degre: activeDegree,
        poste: activePoste,
        page: 1,
        limit: 50
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
          <button
            className="print-all-button"
            type="button"
            onClick={handlePrintAllPastors}
            disabled={isLoading}
          >
            <Printer size={18} />
            Imprimer tous
          </button>
        </div>

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
                onClick={() => {
                  setQuery('');
                  setActivePoste('');
                  setActiveDegree('');
                }}
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
