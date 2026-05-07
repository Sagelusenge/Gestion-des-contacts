import { MapPinned, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const quickPostes = [
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

const initialPoste = {
  nom: '',
  region: '',
  description: ''
};

export function AddPosteView({ token }) {
  const [postes, setPostes] = useState([]);
  const [form, setForm] = useState(initialPoste);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sortedPostes = useMemo(() => [...postes].sort((a, b) => a.nom.localeCompare(b.nom)), [postes]);

  async function loadPostes() {
    try {
      const payload = await api.getPostes(token);
      setPostes(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadPostes();
  }, [token]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function fillQuickPoste(poste) {
    setForm({
      nom: poste,
      region: poste,
      description: `Poste ecclesiastique de ${poste}`
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await api.createPoste(token, {
        nom: form.nom,
        region: form.region || null,
        description: form.description || null
      });
      setForm(initialPoste);
      setMessage('Poste ajouté avec succès.');
      await loadPostes();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setMessage('');

    try {
      await api.deletePoste(token, id);
      setMessage('Poste supprimé.');
      await loadPostes();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="management-grid">
      <form className="dark-form-panel" onSubmit={handleSubmit}>
        <div className="panel-title">
          <MapPinned size={22} />
          <h2>Ajouter un poste</h2>
        </div>

        <div className="quick-postes">
          {quickPostes.map((poste) => (
            <button className="quick-poste" type="button" key={poste} onClick={() => fillQuickPoste(poste)}>
              {poste}
            </button>
          ))}
        </div>

        <label className="field dark-field">
          <span>Nom du poste</span>
          <input value={form.nom} onChange={(event) => updateField('nom', event.target.value)} required />
        </label>
        <label className="field dark-field">
          <span>Région</span>
          <input value={form.region} onChange={(event) => updateField('region', event.target.value)} />
        </label>
        <label className="field dark-field">
          <span>Description</span>
          <textarea rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
        </label>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}

        <button className="admin-primary" type="submit" disabled={isSaving}>
          <Plus size={18} />
          {isSaving ? 'Ajout...' : 'Ajouter le poste'}
        </button>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <MapPinned size={22} />
          <h2>Postes existants</h2>
        </div>
        <div className="admin-list">
          {sortedPostes.map((poste) => (
            <div className="admin-list-row" key={poste.id}>
              <div>
                <strong>{poste.nom}</strong>
                <span>{poste.region || 'Sans région'}</span>
              </div>
              <button type="button" onClick={() => handleDelete(poste.id)} aria-label="Supprimer">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
