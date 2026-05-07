import { BadgePlus, Pencil, Plus, Printer, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { printRecord } from '../utils/printRecord.js';

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
  const [editingGradeId, setEditingGradeId] = useState(null);

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

  function resetForm() {
    setForm(initialGrade);
    setEditingGradeId(null);
  }

  function handleEdit(grade) {
    setEditingGradeId(grade.id);
    setForm({
      nom: grade.nom || '',
      description: grade.description || ''
    });
    setMessage('');
    setError('');
  }

  function handlePrint(grade) {
    printRecord(`Grade - ${grade.nom}`, [
      { label: 'Nom du grade', value: grade.nom },
      { label: 'Description', value: grade.description }
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

      if (editingGradeId) {
        await api.updateGrade(token, editingGradeId, payload);
        setMessage('Grade mis à jour avec succès.');
        resetForm();
      } else {
        await api.createGrade(token, payload);
        setForm(initialGrade);
        setMessage('Grade ajouté avec succès.');
      }

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
          <h2>{editingGradeId ? 'Modifier un grade' : 'Ajouter un grade'}</h2>
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

        <div className="form-actions-row">
          <button className="admin-primary" type="submit" disabled={isSaving}>
            <Plus size={18} />
            {isSaving ? 'Enregistrement...' : editingGradeId ? 'Mettre à jour' : 'Ajouter le grade'}
          </button>
          {editingGradeId ? (
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
          <h2>Grades enregistrés</h2>
        </div>
        <div className="admin-list">
          {grades.map((grade) => (
            <div className="admin-list-row" key={grade.id}>
              <div>
                <strong>{grade.nom}</strong>
                <span>{grade.description || 'Sans description'}</span>
              </div>
              <div className="row-actions">
                <button className="row-action update" type="button" onClick={() => handleEdit(grade)} aria-label="Modifier">
                  <Pencil size={17} />
                </button>
                <button className="row-action print" type="button" onClick={() => handlePrint(grade)} aria-label="Imprimer">
                  <Printer size={17} />
                </button>
                <button className="row-action delete" type="button" onClick={() => handleDelete(grade.id)} aria-label="Supprimer">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
