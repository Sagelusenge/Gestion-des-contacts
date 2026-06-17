import { Shield, ShieldAlert, Trash2, UserPlus, Users, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const initialForm = {
  username: '',
  password: '',
  role: 'viewer'
};

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function UsersView({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const sortedUsers = useMemo(() => {
    const search = normalizeSearch(userSearch);
    return [...users]
      .filter((user) => {
        if (!search) {
          return true;
        }
        return normalizeSearch(user.username).includes(search);
      })
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [users, userSearch]);

  async function loadUsers() {
    try {
      const payload = await api.getUsers(token);
      setUsers(payload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    const email = form.username.trim();
    if (!email.includes('@')) {
      setError('L’identifiant doit être un email valide.');
      setIsSaving(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      setIsSaving(false);
      return;
    }

    try {
      await api.createUser(token, {
        username: email,
        password: form.password,
        role: form.role
      });
      setForm(initialForm);
      setMessage(`L'utilisateur ${email} a été créé avec succès.`);
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError('');
    setMessage('');

    try {
      await api.updateUserRole(token, userId, newRole);
      setMessage('Rôle mis à jour avec succès.');
      await loadUsers();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function handleDelete(userId, username) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ?`)) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.deleteUser(token, userId);
      setMessage(`L'utilisateur ${username} a été supprimé.`);
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="management-grid">
      <form className="dark-form-panel" onSubmit={handleSubmit}>
        <div className="panel-title">
          <UserPlus size={22} />
          <h2>Ajouter un utilisateur</h2>
        </div>

        <label className="field dark-field">
          <span>Adresse Email (Identifiant)</span>
          <input
            type="email"
            value={form.username}
            onChange={(event) => updateField('username', event.target.value)}
            placeholder="exemple@cbca.org"
            required
          />
        </label>

        <label className="field dark-field">
          <span>Mot de passe (Min. 6 caractères)</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <label className="field dark-field">
          <span>Rôle attribué</span>
          <select
            value={form.role}
            onChange={(event) => updateField('role', event.target.value)}
            required
          >
            <option value="viewer">Lecteur (Visualisation uniquement)</option>
            <option value="admin">Administrateur (Tous les droits)</option>
          </select>
        </label>

        {message ? (
          <p className="notice success">
            <CheckCircle2 size={16} style={{ marginRight: '8px', inlineSize: 'auto' }} />
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="notice error">
            <AlertCircle size={16} style={{ marginRight: '8px', inlineSize: 'auto' }} />
            {error}
          </p>
        ) : null}

        <div className="form-actions-row">
          <button className="admin-primary" type="submit" disabled={isSaving}>
            <UserPlus size={18} />
            {isSaving ? 'Création...' : 'Créer l’utilisateur'}
          </button>
        </div>
      </form>

      <article className="dark-panel">
        <div className="panel-title">
          <Users size={22} />
          <h2>Utilisateurs enregistrés</h2>
        </div>

        <label className="connect-search management-search">
          <Search size={18} />
          <input
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Rechercher par email..."
          />
        </label>

        <div className="admin-list">
          {sortedUsers.map((u) => {
            const isSelf = currentUser && currentUser.id === u.id;
            return (
              <div className={`admin-list-row ${isSelf ? 'highlighted-row' : ''}`} key={u.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="avatar-circle"
                    style={{
                      backgroundColor: u.role === 'admin' ? 'var(--color-primary, #0070f3)' : 'var(--color-neutral, #666)',
                      color: '#fff',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {u.username.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>{u.username}</strong>
                      {isSelf ? (
                        <span
                          style={{
                            fontSize: '10px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            color: 'var(--color-text-secondary, #aaa)'
                          }}
                        >
                          (Vous)
                        </span>
                      ) : null}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #888)' }}>
                      Créé le {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="row-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={isSelf}
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      color: 'var(--color-text, #fff)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '13px',
                      cursor: isSelf ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="viewer">Lecteur</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    className="row-action delete"
                    type="button"
                    onClick={() => handleDelete(u.id, u.username)}
                    disabled={isSelf}
                    title={isSelf ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer l’utilisateur'}
                    style={{
                      opacity: isSelf ? 0.4 : 1,
                      cursor: isSelf ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}
          {sortedUsers.length === 0 ? <p className="notice">Aucun utilisateur trouvé.</p> : null}
        </div>
      </article>
    </section>
  );
}
