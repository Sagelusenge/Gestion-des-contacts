import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const initialPoste = {
  nom: '',
  region: '',
  description: ''
};

const initialPastor = {
  nom: '',
  degre: 'Serviteur',
  poste: '',
  telephone: '',
  email: '',
  date_affectation: ''
};

export function AdminView({ token }) {
  const [postes, setPostes] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [posteForm, setPosteForm] = useState(initialPoste);
  const [pastorForm, setPastorForm] = useState(initialPastor);
  const [activePanel, setActivePanel] = useState('postes');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sortedPostes = useMemo(
    () => [...postes].sort((a, b) => a.nom.localeCompare(b.nom)),
    [postes]
  );

  async function refreshAdminData() {
    setError('');
    try {
      const [postesPayload, pastorsPayload] = await Promise.all([
        api.getPostes(token),
        api.getPastors(token, { page: 1, limit: 5000 })
      ]);
      setPostes(postesPayload.data || []);
      setPastors(pastorsPayload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    refreshAdminData();
  }, [token]);

  function updatePosteField(field, value) {
    setPosteForm((current) => ({ ...current, [field]: value }));
  }

  function updatePastorField(field, value) {
    setPastorForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreatePoste(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      await api.createPoste(token, {
        nom: posteForm.nom,
        region: posteForm.region || null,
        description: posteForm.description || null
      });
      setPosteForm(initialPoste);
      setMessage('Poste ajoute.');
      await refreshAdminData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreatePastor(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      await api.createPastor(token, {
        ...pastorForm,
        email: pastorForm.email || null,
        date_affectation: pastorForm.date_affectation || null
      });
      setPastorForm({ ...initialPastor, poste: pastorForm.poste });
      setMessage('Serviteur ajoute.');
      await refreshAdminData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePastor(id) {
    setError('');
    setMessage('');

    try {
      await api.deletePastor(token, id);
      setMessage('Serviteur supprime.');
      await refreshAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleDeletePoste(id) {
    setError('');
    setMessage('');

    try {
      await api.deletePoste(token, id);
      setMessage('Entite supprime.');
      await refreshAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="app-main">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Espace admin</p>
          <h1>Gestion</h1>
        </div>
        <button className="round-button" type="button" onClick={refreshAdminData} aria-label="Actualiser">
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="segmented" role="tablist" aria-label="Administration">
        <button
          className={activePanel === 'postes' ? 'segment active' : 'segment'}
          type="button"
          onClick={() => setActivePanel('postes')}
        >
          Entites
        </button>
        <button
          className={activePanel === 'pasteurs' ? 'segment active' : 'segment'}
          type="button"
          onClick={() => setActivePanel('pasteurs')}
        >
          Serviteurs
        </button>
      </div>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      {activePanel === 'postes' ? (
        <section className="admin-grid">
          <form className="form-panel" onSubmit={handleCreatePoste}>
            <h2>Ajouter une entite</h2>
            <label className="field">
              <span>Nom de l'entite</span>
              <input
                value={posteForm.nom}
                onChange={(event) => updatePosteField('nom', event.target.value)}
                placeholder="Kinshasa, Goma, Paroisse CBCA..."
                required
              />
            </label>
            <label className="field">
              <span>Région</span>
              <input
                value={posteForm.region}
                onChange={(event) => updatePosteField('region', event.target.value)}
                placeholder="Goma"
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                value={posteForm.description}
                onChange={(event) => updatePosteField('description', event.target.value)}
                placeholder="Paroisse, entite ou département"
                rows="3"
              />
            </label>
            <div className="form-actions-row">
              <button className="primary-button" type="submit" disabled={isSaving}>
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </form>

          <section className="table-panel" aria-label="Entites existantes">
            <h2>Entites existantes</h2>
            <div className="compact-list">
              {sortedPostes.map((poste) => (
                <div className="compact-row" key={poste.id}>
                  <div>
                    <strong>{poste.nom}</strong>
                    <span>{poste.region || 'Sans région'}</span>
                  </div>
                  <button className="danger-icon" type="button" onClick={() => handleDeletePoste(poste.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </section>
      ) : (
        <section className="admin-grid">
          <form className="form-panel" onSubmit={handleCreatePastor}>
            <h2>Ajouter un serviteur</h2>
            <label className="field">
              <span>Nom complet</span>
              <input
                value={pastorForm.nom}
                onChange={(event) => updatePastorField('nom', event.target.value)}
                placeholder="Nom du serviteur"
                required
              />
            </label>
            <div className="form-split">
              <label className="field">
                <span>Fonction</span>
                <select
                  value={pastorForm.degre}
                  onChange={(event) => updatePastorField('degre', event.target.value)}
                >
                  <option>Révérend</option>
                  <option>Pasteur</option>
                  <option>Évangéliste</option>
                  <option>Aumônier</option>
                  <option>Stagiaire</option>
                </select>
              </label>
              <label className="field">
                <span>Telephone</span>
                <input
                  value={pastorForm.telephone}
                  onChange={(event) => updatePastorField('telephone', event.target.value)}
                  placeholder="+243..."
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Entite</span>
              <select
                value={pastorForm.poste}
                onChange={(event) => updatePastorField('poste', event.target.value)}
                required
              >
                <option value="">Choisir une entite</option>
                {sortedPostes.map((poste) => (
                  <option value={poste.nom} key={poste.id}>
                    {poste.nom}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-split">
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={pastorForm.email}
                  onChange={(event) => updatePastorField('email', event.target.value)}
                  placeholder="email@exemple.org"
                />
              </label>
              <label className="field">
                <span>Affectation</span>
                <input
                  type="date"
                  value={pastorForm.date_affectation}
                  onChange={(event) => updatePastorField('date_affectation', event.target.value)}
                />
              </label>
            </div>
            <div className="form-actions-row">
              <button className="primary-button" type="submit" disabled={isSaving}>
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </form>

          <section className="table-panel" aria-label="Serviteurs">
            <h2>Serviteurs</h2>
            <div className="compact-list">
              {pastors.map((pastor) => (
                <div className="compact-row" key={pastor.id}>
                  <div>
                    <strong>{pastor.nom}</strong>
                    <span>{pastor.degre} · {pastor.poste}</span>
                  </div>
                  <button className="danger-icon" type="button" onClick={() => handleDeletePastor(pastor.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
