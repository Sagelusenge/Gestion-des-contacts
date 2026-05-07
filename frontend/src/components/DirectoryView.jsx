import { Filter, MapPin, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
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

  const posteChips = useMemo(() => {
    const recommended = [
      'Goma',
      'Kinshasa',
      'Bukavu',
      'Beni',
      'Butembo',
      'Lubero',
      'Oicha',
      'Kayna',
      'Minova',
      'Masisi',
      'Rutshuru',
      'Walikale'
    ];
    const fromDatabase = postes.flatMap((poste) => [poste.region, poste.nom]).filter(Boolean);
    return ['Tous', ...new Set([...recommended, ...fromDatabase])];
  }, [postes]);

  const degres = useMemo(
    () => ['Tous', ...grades.map((grade) => grade.nom)],
    [grades]
  );

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
      <section className="directory-panel">
        <section className="overview-band" aria-label="Aperçu">
          <div>
            <span className="stat-value">{pastors.length}</span>
            <span className="stat-label">résultats</span>
          </div>
          <div>
            <span className="stat-value">{postes.length}</span>
            <span className="stat-label">postes</span>
          </div>
          <div>
            <span className="stat-value">{activeDegree || 'Tous'}</span>
            <span className="stat-label">degré</span>
          </div>
        </section>

        <div className="search-group">
          <label className="connect-search">
            <Search size={21} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par nom, degré ou poste..."
            />
          </label>
          <button className="refresh-inline" type="button" onClick={loadPastors} aria-label="Actualiser">
            <RefreshCw size={19} />
          </button>
        </div>

        <div className="filter-block">
          <div className="filter-label">
            <MapPin size={16} />
            <span>Postes Ecclésiastiques</span>
          </div>
          <div className="connect-chip-row" aria-label="Filtres postes">
            {posteChips.map((poste) => {
              const value = poste === 'Tous' ? '' : poste;
              return (
                <button
                  className={activePoste === value ? 'connect-chip active' : 'connect-chip'}
                  type="button"
                  key={poste}
                  onClick={() => setActivePoste(value)}
                >
                  {poste}
                </button>
              );
            })}
          </div>
        </div>

        <div className="degree-filter-row" aria-label="Filtres degrés">
          <Filter size={16} />
          {degres.map((degre) => {
            const value = degre === 'Tous' ? '' : degre;
            return (
              <button
                className={activeDegree === value ? 'degree-chip active' : 'degree-chip'}
                type="button"
                key={degre}
                onClick={() => setActiveDegree(value)}
              >
                {degre}
              </button>
            );
          })}
        </div>

        <p className="result-count">{pastors.length} Résultats trouvés</p>
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
