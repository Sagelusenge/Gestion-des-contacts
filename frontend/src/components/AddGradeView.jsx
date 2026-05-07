import { BadgePlus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const initialGrade = {
  nom: '',
  description: ''
};

export function AddGradeView({ token }) {
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState(initialGrade);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadGrades() {
    try {
      const payload = await api.getGrades(token);
      setGrades(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadGrades();
  }, [token]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await api.createGrade(token, {
        nom: form.nom,
        description: form.description || null
      });
      setForm(initialGrade);
      setMessage('Grade ajouté avec succès.');
      await loadGrades();
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
      await api.deleteGrade(token, id);
      setMessage('Grade supprimé.');
      await loadGrades();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="management-grid">
      <form className="dark-form-panel" onSubmit={handleSubmit}>
        <div className="panel-title">
          <BadgePlus size={22} />
          <h2>Ajouter un grade</h2>
        </div>

        <label className="field dark-field">
          <span>Nom du grade</span>
          <input value={form.nom} onChange={(event) => updateField('nom', event.target.value)} placeholder="Ex: Pasteur titulaire" required />
        </label>

        <label className="field dark-field">
          <span>Description</span>
          <textarea rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
        </label>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}

        <button className="admin-primary" type="submit" disabled={isSaving}>
          <Plus size={18} />
          {isSaving ? 'Ajout...' : 'Ajouter le grade'}
        </button>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <BadgePlus size={22} />
          <h2>Grades enregistrés</h2>
        </div>
        <div className="admin-list">
          {grades.map((grade) => (
            <div className="admin-list-row" key={grade.id}>
              <div>
                <strong>{grade.nom}</strong>
                <span>{grade.description || 'Sans description'}</span>
              </div>
              <button type="button" onClick={() => handleDelete(grade.id)} aria-label="Supprimer">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
