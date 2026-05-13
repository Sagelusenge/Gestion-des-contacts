import { BadgePlus, Pencil, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { printRecord } from '../utils/printRecord.js';

const initialFonction = {
  nom: '',
  description: ''
};

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function AddFonctionView({ token }) {
  const [fonctions, setFonctions] = useState([]);
  const [form, setForm] = useState(initialFonction);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingFonctionId, setEditingFonctionId] = useState(null);
  const [fonctionSearch, setFonctionSearch] = useState('');

  const visibleFonctions = useMemo(() => {
    const search = normalizeSearch(fonctionSearch);
    return [...fonctions]
      .filter((fonction) => {
        if (!search) {
          return true;
        }

        return [fonction.nom, fonction.description].some((value) => normalizeSearch(value).includes(search));
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [fonctions, fonctionSearch]);

  async function loadFonctions() {
    try {
      const payload = await api.getFonctions(token);
      setFonctions(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadFonctions();
  }, [token]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialFonction);
    setEditingFonctionId(null);
  }

  function handleEdit(fonction) {
    setEditingFonctionId(fonction.id);
    setForm({
      nom: fonction.nom || '',
      description: fonction.description || ''
    });
    setMessage('');
    setError('');
  }

  function handlePrint(fonction) {
    printRecord(`Fonction - ${fonction.nom}`, [
      { label: 'Nom de la fonction', value: fonction.nom },
      { label: 'Description', value: fonction.description }
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
        description: form.description || null
      };

      if (editingFonctionId) {
        await api.updateFonction(token, editingFonctionId, payload);
        setMessage('Fonction mise a jour avec succes.');
        resetForm();
      } else {
        await api.createFonction(token, payload);
        setForm(initialFonction);
        setMessage('Fonction ajoutee avec succes.');
      }

      await loadFonctions();
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
      await api.deleteFonction(token, id);
      setMessage('Fonction supprimee.');
      await loadFonctions();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="management-grid">
      <form className="dark-form-panel" onSubmit={handleSubmit}>
        <div className="panel-title">
          <BadgePlus size={22} />
          <h2>{editingFonctionId ? 'Modifier une fonction' : 'Ajouter une fonction'}</h2>
        </div>

        <label className="field dark-field">
          <span>Nom de la fonction</span>
          <input value={form.nom} onChange={(event) => updateField('nom', event.target.value)} placeholder="Ex: Pasteur titulaire" required />
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
            {isSaving ? 'Enregistrement...' : editingFonctionId ? 'Mettre a jour' : 'Ajouter la fonction'}
          </button>
          {editingFonctionId ? (
            <button className="secondary-action" type="button" onClick={resetForm}>
              <X size={18} />
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <BadgePlus size={22} />
          <h2>Fonctions enregistrees</h2>
        </div>
        <label className="connect-search management-search">
          <Search size={18} />
          <input
            value={fonctionSearch}
            onChange={(event) => setFonctionSearch(event.target.value)}
            placeholder="Rechercher une fonction..."
          />
        </label>
        <div className="admin-list">
          {visibleFonctions.map((fonction) => (
            <div className="admin-list-row" key={fonction.id}>
              <div>
                <strong>{fonction.nom}</strong>
                <span>{fonction.description || 'Sans description'}</span>
              </div>
              <div className="row-actions">
                <button className="row-action update" type="button" onClick={() => handleEdit(fonction)} aria-label="Modifier">
                  <Pencil size={17} />
                </button>
                <button className="row-action print" type="button" onClick={() => handlePrint(fonction)} aria-label="Imprimer">
                  <Printer size={17} />
                </button>
                <button className="row-action delete" type="button" onClick={() => handleDelete(fonction.id)} aria-label="Supprimer">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          {visibleFonctions.length === 0 ? <p className="notice">Aucune fonction trouvee.</p> : null}
        </div>
      </article>
    </section>
  );
}
