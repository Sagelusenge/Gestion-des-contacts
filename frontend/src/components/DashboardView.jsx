import { BadgePlus, CalendarDays, ContactRound, MapPinned } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

export function DashboardView({ token, onNavigate }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [pastorsPayload, postesPayload, gradesPayload] = await Promise.all([
          api.getPastors(token, { page: 1, limit: 100 }),
          api.getPostes(token),
          api.getGrades(token)
        ]);
        setPastors(pastorsPayload.data || []);
        setPostes(postesPayload.data || []);
        setGrades(gradesPayload.data || []);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadDashboard();
  }, [token]);

  const stats = useMemo(() => {
    const regions = new Set(postes.map((poste) => poste.region).filter(Boolean)).size;

    return [
      { label: 'Pasteurs', value: pastors.length, icon: ContactRound },
      { label: 'Postes', value: postes.length, icon: MapPinned },
      { label: 'Régions', value: regions, icon: CalendarDays },
      { label: 'Grades', value: grades.length, icon: BadgePlus }
    ];
  }, [pastors, postes, grades]);

  const recentPastors = pastors.slice(0, 5);
  const visiblePostes = postes.slice(0, 8);

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

      <section className="dashboard-grid">
        <article className="dark-panel dashboard-main-panel">
          <div className="panel-title">
            <ContactRound size={22} />
            <h2>Derniers pasteurs enregistrés</h2>
          </div>
          <div className="data-table">
            <div className="table-head">
              <span>Nom</span>
              <span>Degré</span>
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
        </article>
      </section>

    </div>
  );
}
