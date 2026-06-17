import { BadgePlus, CalendarDays, ContactRound, CreditCard, MapPinned, MessageSquareText, Search, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

export function DashboardView({ token, onNavigate, user }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [pastorsPayload, postesPayload, fonctionsPayload] = await Promise.all([
          api.getPastors(token, { page: 1, limit: 5000 }),
          api.getPostes(token),
          api.getFonctions(token)
        ]);
        setPastors(pastorsPayload.data || []);
        setPostes(postesPayload.data || []);
        setFonctions(fonctionsPayload.data || []);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadDashboard();
  }, [token]);

  const stats = useMemo(() => {
    const regions = new Set(postes.map((poste) => poste.region).filter(Boolean)).size;

    return [
      { label: 'Serviteur', value: pastors.length, icon: ContactRound },
      { label: 'Entite', value: postes.length, icon: MapPinned },
      { label: 'Régions', value: regions, icon: CalendarDays },
      { label: 'Fonctions', value: fonctions.length, icon: BadgePlus }
    ];
  }, [pastors, postes, fonctions]);

  const recentPastors = pastors.slice(0, 5);
  const visiblePostes = postes.slice(0, 8);
  const regionStats = useMemo(() => {
    const counts = postes.reduce((accumulator, poste) => {
      const region = poste.region || 'Sans region';
      accumulator.set(region, (accumulator.get(region) || 0) + 1);
      return accumulator;
    }, new Map());

    return [...counts.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region))
      .slice(0, 4);
  }, [postes]);

  return (
    <div className="dashboard-page">
      {error ? <p className="notice error">{error}</p> : null}

      <section className="metric-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="metric-card" key={stat.label}>
              <Icon size={24} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="quick-actions-panel dashboard-actions-panel" aria-label="Actions rapides">
        <button type="button" onClick={() => onNavigate('directory')}>
          <Search size={18} />
          Voir l'annuaire
        </button>
        {isAdmin ? (
          <>
            <button type="button" onClick={() => onNavigate('addPastor')}>
              <UserPlus size={18} />
              Ajouter un pasteur
            </button>
            <button type="button" onClick={() => onNavigate('addPoste')}>
              <MapPinned size={18} />
              Ajouter un poste
            </button>
            <button type="button" onClick={() => onNavigate('addFonction')}>
              <BadgePlus size={18} />
              Gerer les fonctions
            </button>
          </>
        ) : null}
      </section>

      <section className="dashboard-grid">
        <article className="dark-panel dashboard-main-panel">
          <div className="panel-title">
            <ContactRound size={22} />
            <h2>Derniers pasteurs enregistrés</h2>
          </div>
          <div className="data-table">
            <div className="table-head">
              <span>Nom</span>
              <span>Fonction</span>
              <span>Poste</span>
            </div>
            {recentPastors.map((pastor) => (
              <div className="table-row" key={pastor.id}>
                <span>{pastor.nom}</span>
                <span>{pastor.degre}</span>
                <span>{pastor.poste}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dark-panel dashboard-side-panel">
          <div className="panel-title">
            <MapPinned size={22} />
            <h2>Postes</h2>
          </div>
          <div className="poste-pill-list">
            {visiblePostes.map((poste) => (
              <span className="poste-pill" key={poste.id}>
                {poste.nom}
              </span>
            ))}
          </div>
          {regionStats.length ? (
            <div className="region-summary-list">
              {regionStats.map((item) => (
                <div className="region-summary-row" key={item.region}>
                  <span>{item.region}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

    </div>
  );
}
