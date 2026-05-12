import { FileDown, FileUp, Pencil, Plus, Printer, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../services/api.js';
import { printRecord } from '../utils/printRecord.js';

const initialPastor = {
  id_serviteur: '',
  nom: '',
  degre: 'Pasteur',
  poste: '',
  entite: '',
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
  const importInputRef = useRef(null);

  const sortedPostes = useMemo(() => [...postes].sort((a, b) => a.nom.localeCompare(b.nom)), [postes]);

  async function loadData() {
    try {
      const [postesPayload, pastorsPayload, gradesPayload] = await Promise.all([
        api.getPostes(token),
        api.getPastors(token, { page: 1, limit: 5000 }),
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
      id_serviteur: pastor.id_serviteur || '',
      entite: pastor.entite || '',
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
      { label: 'ID serviteur', value: pastor.id_serviteur },
      { label: 'Fonction', value: pastor.degre },
      { label: 'Poste', value: pastor.poste },
      { label: 'Entite', value: pastor.entite },
      { label: 'TÃ©lÃ©phone', value: pastor.telephone },
      { label: 'Email', value: pastor.email },
      { label: 'Date dâ€™affectation', value: pastor.date_affectation }
    ]);
  }

  function exportExcelFile() {
    const headers = ['ID-SO_PA', 'Nom', 'Fonction', 'Poste', 'Entite', 'Region', 'Telephone', 'Email', 'Date affectation'];
    const regionByPoste = new Map(postes.map((poste) => [poste.nom, poste.region || '']));
    const rows = pastors.map((pastor) => ({
      'ID-SO_PA': pastor.id_serviteur || '',
      Nom: pastor.nom,
      Fonction: pastor.degre,
      Poste: pastor.poste,
      Entite: pastor.entite || '',
      Region: regionByPoste.get(pastor.poste) || '',
      Telephone: pastor.telephone,
      Email: pastor.email || '',
      'Date affectation': pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 26 },
      { wch: 18 },
      { wch: 22 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 18 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pasteurs');
    XLSX.writeFile(workbook, `pasteurs-cbca-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function parseDelimitedFile(text) {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    const separator = lines[0]?.includes(';') ? ';' : lines[0]?.includes('\t') ? '\t' : ',';
    const parseLine = (line) => {
      const values = [];
      let current = '';
      let quoted = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const next = line[index + 1];

        if (char === '"' && quoted && next === '"') {
          current += '"';
          index += 1;
        } else if (char === '"') {
          quoted = !quoted;
        } else if (char === separator && !quoted) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      values.push(current.trim());
      return values;
    };
    const normalizeHeader = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const headers = parseLine(lines[0]).map(normalizeHeader);

    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      return headers.reduce((row, header, index) => {
        row[header] = values[index] || '';
        return row;
      }, {});
    });
  }

  function normalizeExcelDate(value) {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    return String(value).trim();
  }

  function normalizeHeader(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function pickExcelValue(row, names) {
    const normalizedRow = Object.entries(row).reduce((accumulator, [key, value]) => {
      accumulator[normalizeHeader(key)] = value;
      return accumulator;
    }, {});
    const key = names.map(normalizeHeader).find((name) => normalizedRow[name] !== undefined && normalizedRow[name] !== '');
    return key ? normalizedRow[key] : '';
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      const rows = rawRows.map((row) => ({
        id_serviteur: pickExcelValue(row, ['ID-SO_PA', 'id serviteur', 'id']),
        nom: pickExcelValue(row, ['Nom', 'Noms', 'NOMS -POST NOMS CORRECT', 'Name']),
        fonction: pickExcelValue(row, ['Fonction', 'Grade', 'Degre', 'Degré']),
        poste: pickExcelValue(row, ['Poste']),
        entite: pickExcelValue(row, ['Entite', 'Entité', 'ENTITE']),
        region: pickExcelValue(row, ['Region', 'Région']),
        telephone: pickExcelValue(row, ['Telephone', 'Téléphone', 'NUMERO DE TELEPHONE', 'Phone']),
        email: pickExcelValue(row, ['Email']),
        date_affectation: normalizeExcelDate(pickExcelValue(row, ['Date affectation', 'Affectation', 'Date']))
      }));
      const payload = await api.importPastors(token, rows);
      const summary = payload.data;
      setMessage(`${summary.imported} pasteur(s) importes. ${summary.createdFunctions} fonction(s) et ${summary.createdPostes} poste(s) crees.`);
      if (summary.errors?.length) {
        setError(summary.errors.slice(0, 3).join(' '));
      }
      await loadData();
    } catch (importError) {
      setError(importError.message);
    } finally {
      setIsSaving(false);
      event.target.value = '';
    }
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
        setMessage('Pasteur mis Ã  jour avec succÃ¨s.');
        resetForm();
      } else {
        await api.createPastor(token, payload);
        setForm({ ...initialPastor, poste: form.poste, degre: form.degre });
        setMessage('Pasteur ajoutÃ© avec succÃ¨s.');
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
      setMessage('Pasteur supprimÃ©.');
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

        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleImportFile}
          hidden
        />
        <div className="form-actions-row">
          <button className="secondary-action" type="button" onClick={() => importInputRef.current?.click()} disabled={isSaving}>
            <FileUp size={18} />
            Importer Excel
          </button>
          <button className="secondary-action" type="button" onClick={exportExcelFile}>
            <FileDown size={18} />
            Exporter Excel
          </button>
        </div>

        <label className="field dark-field">
          <span>Nom complet</span>
          <input value={form.nom} onChange={(event) => updateField('nom', event.target.value)} required />
        </label>

        <div className="form-split">
          <label className="field dark-field">
            <span>ID serviteur</span>
            <input value={form.id_serviteur} onChange={(event) => updateField('id_serviteur', event.target.value)} placeholder="Ex: 000246" />
          </label>
          <label className="field dark-field">
            <span>Entite</span>
            <input value={form.entite} onChange={(event) => updateField('entite', event.target.value)} placeholder="Ex: Bureau poste Bambo" />
          </label>
        </div>

        <div className="form-split">
          <label className="field dark-field">
            <span>Fonction</span>
            <select value={form.degre} onChange={(event) => updateField('degre', event.target.value)}>
              {grades.map((grade) => (
                <option value={grade.nom} key={grade.id}>
                  {grade.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="field dark-field">
            <span>TÃ©lÃ©phone</span>
            <input value={form.telephone} onChange={(event) => updateField('telephone', event.target.value)} placeholder="09..." required />
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
            <span>Date dâ€™affectation</span>
            <input type="date" value={form.date_affectation} onChange={(event) => updateField('date_affectation', event.target.value)} />
          </label>
        </div>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}

        <div className="form-actions-row">
          <button className="admin-primary" type="submit" disabled={isSaving}>
            <Plus size={18} />
            {isSaving ? 'Enregistrement...' : editingPastorId ? 'Mettre Ã  jour' : 'Ajouter le pasteur'}
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
          <h2>Pasteurs enregistrÃ©s</h2>
        </div>
        <div className="admin-list">
          {pastors.map((pastor) => (
            <div className="admin-list-row" key={pastor.id}>
              <div>
                <strong>{pastor.nom}</strong>
                <span>{pastor.degre} - {pastor.poste}{pastor.entite ? ` - ${pastor.entite}` : ''}</span>
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
