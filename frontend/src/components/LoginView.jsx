import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api.js';

export function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await api.login({ username, password });
      onLogin(session);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel" aria-labelledby="login-title">
        <img className="brand-mark cbca-logo" src="/cbca-logo.jpg" alt="Logo CBCA" />
        <p className="eyebrow">Annuaire CBCA</p>
        <h1 id="login-title">Connexion</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Utilisateur</span>
            <div className="input-shell">
              <UserRound size={18} />
              <input
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
              />
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-shell password-shell">
              <LockKeyhole size={18} />
              <input
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mot de passe"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
