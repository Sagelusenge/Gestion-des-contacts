import { Moon, RefreshCw, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AddPastorView } from './components/AddPastorView.jsx';
import { AddGradeView } from './components/AddGradeView.jsx';
import { AddPosteView } from './components/AddPosteView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { DirectoryView } from './components/DirectoryView.jsx';
import { LoginView } from './components/LoginView.jsx';
import { Sidebar } from './components/Sidebar.jsx';

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
  addGrade: {
    title: 'Gestion des grades',
    subtitle: 'Créer les grades que l’admin utilisera pour les pasteurs'
  }
};

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

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
  const [session, setSession] = useState(readSession);
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(readTheme);
  const token = session?.token;
  const user = session?.user;
  const activeMeta = pageMeta[activeView] || pageMeta.dashboard;
  const isDark = theme === 'dark';

  const content = useMemo(() => {
    if (!session) {
      return null;
    }

    if (activeView === 'dashboard') {
      return <DashboardView token={token} onNavigate={setActiveView} />;
    }

    if (activeView === 'addPastor') {
      return <AddPastorView token={token} />;
    }

    if (activeView === 'addPoste') {
      return <AddPosteView token={token} />;
    }

    if (activeView === 'addGrade') {
      return <AddGradeView token={token} />;
    }

    return <DirectoryView token={token} onUnauthorized={handleLogout} />;
  }, [activeView, session, token]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function handleLogin(nextSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
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
