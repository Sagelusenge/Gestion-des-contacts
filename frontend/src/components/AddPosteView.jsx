import { MapPinned, Pencil, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { printRecord } from '../utils/printRecord.js';

const initialPoste = {
  nom: '',
  region: '',
  description: ''
};

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function AddPosteView({ token }) {
  const [postes, setPostes] = useState([]);
  const [form, setForm] = useState(initialPoste);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingPosteId, setEditingPosteId] = useState(null);
  const [posteSearch, setPosteSearch] = useState('');

  const sortedPostes = useMemo(() => {
    const search = normalizeSearch(posteSearch);
    return [...postes]
      .filter((poste) => {
        if (!search) {
          return true;
        }

        return [poste.nom, poste.region, poste.description].some((value) => normalizeSearch(value).includes(search));
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [postes, posteSearch]);

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

  function resetForm() {
    setForm(initialPoste);
    setEditingPosteId(null);
  }

  function handleEdit(poste) {
    setEditingPosteId(poste.id);
    setForm({
      nom: poste.nom || '',
      region: poste.region || '',
      description: poste.description || ''
    });
    setMessage('');
    setError('');
  }

  function handlePrint(poste) {
    printRecord(`Entites - ${poste.nom}`, [
      { label: 'Nom Entite' , value: poste.nom },
   //   { label: 'Région', value: poste.region },
      { label: 'Description', value: poste.description }
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const payload = {
        nom: form.nom,
        region: form.region || null,
        description: form.description || null
      };

      if (editingPosteId) {
        await api.updatePoste(token, editingPosteId, payload);
        setMessage('Entites mis à jour avec succès.');
        resetForm();
      } else {
        await api.createPoste(token, payload);
        setForm(initialPoste);
        setMessage('Entites ajouté avec succès.');
      }

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
      setMessage('Entites supprimé.');
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
          <h2>{editingPosteId ? 'Modifier un Entites' : 'Ajouter un Entites'}</h2>
        </div>

        <label className="field dark-field">
          <span>Nom du Entites</span>
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

        <div className="form-actions-row">
          <button className="admin-primary" type="submit" disabled={isSaving}>
            <Plus size={18} />
            {isSaving ? 'Enregistrement...' : editingPosteId ? 'Mettre à jour' : 'Ajouter le Entites'}
          </button>
          {editingPosteId ? (
            <button className="secondary-action" type="button" onClick={resetForm}>
              <X size={18} />
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <MapPinned size={22} />
          <h2>Postes existants</h2>
        </div>
        <label className="connect-search management-search">
          <Search size={18} />
          <input
            value={posteSearch}
            onChange={(event) => setPosteSearch(event.target.value)}
            placeholder="Rechercher un Entites ou une region..."
          />
        </label>
        <div className="admin-list">
          {sortedPostes.map((poste) => (
            <div className="admin-list-row" key={poste.id}>
              <div>
                <strong>{poste.nom}</strong>
                <span>{poste.region || 'Sans région'}</span>
              </div>
              <div className="row-actions">
                <button className="row-action update" type="button" onClick={() => handleEdit(poste)} aria-label="Modifier">
                  <Pencil size={17} />
                </button>
                <button className="row-action print" type="button" onClick={() => handlePrint(poste)} aria-label="Imprimer">
                  <Printer size={17} />
                </button>
                <button className="row-action delete" type="button" onClick={() => handleDelete(poste.id)} aria-label="Supprimer">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          {sortedPostes.length === 0 ? <p className="notice">Aucun Entites trouve.</p> : null}
        </div>
      </article>
    </section>
  );
}
