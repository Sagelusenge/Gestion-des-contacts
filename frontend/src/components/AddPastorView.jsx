import { Pencil, Plus, Printer, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { printRecord } from '../utils/printRecord.js';

const initialPastor = {
  nom: '',
  degre: 'Pasteur',
  poste: '',
  telephone: '',
  email: '',
  date_affectation: ''
};

export function AddPastorView({ token }) {
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [form, setForm] = useState(initialPastor);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingPastorId, setEditingPastorId] = useState(null);

  const sortedPostes = useMemo(() => [...postes].sort((a, b) => a.nom.localeCompare(b.nom)), [postes]);

  async function loadData() {
    try {
      const [postesPayload, pastorsPayload, gradesPayload] = await Promise.all([
        api.getPostes(token),
        api.getPastors(token, { page: 1, limit: 100 }),
        api.getGrades(token)
      ]);
      setPostes(postesPayload.data || []);
      setPastors(pastorsPayload.data || []);
      setGrades(gradesPayload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialPastor);
    setEditingPastorId(null);
  }

  function handleEdit(pastor) {
    setEditingPastorId(pastor.id);
    setForm({
      nom: pastor.nom || '',
      degre: pastor.degre || grades[0]?.nom || '',
      poste: pastor.poste || '',
      telephone: pastor.telephone || '',
      email: pastor.email || '',
      date_affectation: pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : ''
    });
    setMessage('');
    setError('');
  }

  function handlePrint(pastor) {
    printRecord(`Pasteur - ${pastor.nom}`, [
      { label: 'Nom', value: pastor.nom },
      { label: 'Grade', value: pastor.degre },
      { label: 'Poste', value: pastor.poste },
      { label: 'Téléphone', value: pastor.telephone },
      { label: 'Email', value: pastor.email },
      { label: 'Date d’affectation', value: pastor.date_affectation }
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const payload = {
        ...form,
        email: form.email || null,
        date_affectation: form.date_affectation || null
      };

      if (editingPastorId) {
        await api.updatePastor(token, editingPastorId, payload);
        setMessage('Pasteur mis à jour avec succès.');
        resetForm();
      } else {
        await api.createPastor(token, payload);
        setForm({ ...initialPastor, poste: form.poste, degre: form.degre });
        setMessage('Pasteur ajouté avec succès.');
      }

      await loadData();
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
      await api.deletePastor(token, id);
      setMessage('Pasteur supprimé.');
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="management-grid">
      <form className="dark-form-panel" onSubmit={handleSubmit}>
        <div className="panel-title">
          <UserPlus size={22} />
          <h2>{editingPastorId ? 'Modifier un pasteur' : 'Ajouter un pasteur'}</h2>
        </div>

        <label className="field dark-field">
          <span>Nom complet</span>
          <input value={form.nom} onChange={(event) => updateField('nom', event.target.value)} required />
        </label>

        <div className="form-split">
          <label className="field dark-field">
            <span>Degré</span>
            <select value={form.degre} onChange={(event) => updateField('degre', event.target.value)}>
              {grades.map((grade) => (
                <option value={grade.nom} key={grade.id}>
                  {grade.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="field dark-field">
            <span>Téléphone</span>
            <input value={form.telephone} onChange={(event) => updateField('telephone', event.target.value)} placeholder="+243..." required />
          </label>
        </div>

        <label className="field dark-field">
          <span>Poste</span>
          <select value={form.poste} onChange={(event) => updateField('poste', event.target.value)} required>
            <option value="">Choisir un poste</option>
            {sortedPostes.map((poste) => (
              <option value={poste.nom} key={poste.id}>
                {poste.nom}
              </option>
            ))}
          </select>
        </label>

        <div className="form-split">
          <label className="field dark-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </label>
          <label className="field dark-field">
            <span>Date d’affectation</span>
            <input type="date" value={form.date_affectation} onChange={(event) => updateField('date_affectation', event.target.value)} />
          </label>
        </div>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}

        <div className="form-actions-row">
          <button className="admin-primary" type="submit" disabled={isSaving}>
            <Plus size={18} />
            {isSaving ? 'Enregistrement...' : editingPastorId ? 'Mettre à jour' : 'Ajouter le pasteur'}
          </button>
          {editingPastorId ? (
            <button className="secondary-action" type="button" onClick={resetForm}>
              <X size={18} />
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <UserPlus size={22} />
          <h2>Pasteurs enregistrés</h2>
        </div>
        <div className="admin-list">
          {pastors.map((pastor) => (
            <div className="admin-list-row" key={pastor.id}>
              <div>
                <strong>{pastor.nom}</strong>
                <span>{pastor.degre} · {pastor.poste}</span>
              </div>
              <div className="row-actions">
                <button className="row-action update" type="button" onClick={() => handleEdit(pastor)} aria-label="Modifier">
                  <Pencil size={17} />
                </button>
                <button className="row-action print" type="button" onClick={() => handlePrint(pastor)} aria-label="Imprimer">
                  <Printer size={17} />
                </button>
                <button className="row-action delete" type="button" onClick={() => handleDelete(pastor.id)} aria-label="Supprimer">
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
