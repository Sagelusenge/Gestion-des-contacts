import { Download, Moon, RefreshCw, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppreciationsView } from './components/AppreciationsView.jsx';
import { AddPastorView } from './components/AddPastorView.jsx';
import { AddFonctionView } from './components/AddGradeView.jsx';
import { AddPosteView } from './components/AddPosteView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { DirectoryView } from './components/DirectoryView.jsx';
import { LoginView } from './components/LoginView.jsx';
import { PaymentsView } from './components/PaymentsView.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { UsersView } from './components/UsersView.jsx';
import { APP_DOWNLOAD_URL } from './config/appLinks.js';

const SESSION_KEY = 'cbca_session';
const THEME_KEY = 'cbca_theme';

const pageMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Vue générale de l’annuaire pastoral CBCA'
  },
  directory: {
    title: 'Annuaire',
    subtitle: 'Recherche rapide par nom, degré, poste ou région'
  },
  addPastor: {
    title: 'Ajout des pasteurs',
    subtitle: 'Enregistrer un nouveau pasteur et ses coordonnées'
  },
  addPoste: {
    title: 'Ajout des postes',
    subtitle: 'Créer les postes, paroisses, régions et départements'
  },
  addFonction: {
    title: 'Gestion des fonctions',
    subtitle: 'Créer les fonctions que l’admin utilisera pour les pasteurs'
  },
  users: {
    title: 'Rôles & Utilisateurs',
    subtitle: 'Gérer les comptes utilisateurs et attribuer les rôles d’accès'
  }
};

function readTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    return 'light';
  }

  return 'light';
}

export default function App() {
  const [session, setSession] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(readTheme);
  const token = session?.token;
  const user = session?.user;
  const isAdmin = user?.role === 'admin';
  const activeMeta = pageMeta[activeView] || pageMeta.dashboard;
  const isDark = theme === 'dark';

  const content = useMemo(() => {
    if (!session) {
      return null;
    }

    if (activeView === 'dashboard') {
      return <DashboardView token={token} onNavigate={setActiveView} user={user} />;
    }

    if (activeView === 'directory') {
      return <DirectoryView token={token} onUnauthorized={handleLogout} user={user} />;
    }

    if (!isAdmin) {
      return <DirectoryView token={token} onUnauthorized={handleLogout} user={user} />;
    }

    if (activeView === 'addPastor') {
      return <AddPastorView token={token} />;
    }

    if (activeView === 'addPoste') {
      return <AddPosteView token={token} />;
    }

    if (activeView === 'addFonction') {
      return <AddFonctionView token={token} />;
    }

    if (activeView === 'users') {
      return <UsersView token={token} currentUser={user} />;
    }

    return <DirectoryView token={token} onUnauthorized={handleLogout} user={user} />;
  }, [activeView, session, token, user, isAdmin]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.removeItem(SESSION_KEY);
  }, []);

  function handleLogin(nextSession) {
    setSession(nextSession);
    setActiveView('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setActiveView('dashboard');
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  if (!session) {
    return <LoginView onLogin={handleLogin} theme={theme} onThemeToggle={toggleTheme} />;
  }

  return (
    <div className="admin-shell">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={handleLogout} user={user} />

      <section className="admin-workspace">
        <header className="workspace-header">
          <div>
            <h1>{activeMeta.title}</h1>
            <p>{activeMeta.subtitle}</p>
          </div>
          <div className="workspace-actions">
            <a className="workspace-tool download-app-link" href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              <Download size={20} />
              <span>APK Android</span>
            </a>
            <button className="workspace-tool icon-only-tool" type="button" onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
            <button className="workspace-tool" type="button" onClick={() => window.location.reload()}>
              <RefreshCw size={20} />
              Actualiser
            </button>
          </div>
        </header>

        <div className="workspace-content">{content}</div>
      </section>
    </div>
  );
}
