import { BadgePlus, ContactRound, LayoutDashboard, LogOut, MapPinned, UserPlus } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'directory', label: 'Annuaire', icon: ContactRound },
  { id: 'addPastor', label: 'Ajouter pasteur', icon: UserPlus },
  { id: 'addPoste', label: 'Ajouter poste', icon: MapPinned },
  { id: 'addGrade', label: 'Grades', icon: BadgePlus }
];

export function Sidebar({ activeView, onViewChange, onLogout, user }) {
  return (
    <aside className="side-nav">
      <div className="side-brand">
        <img src="/cbca-logo.jpg" alt="Logo CBCA" />
        <div>
          <strong>CBCA Connect</strong>
          <span>{user?.role === 'admin' ? 'Administration' : 'Annuaire'}</span>
        </div>
      </div>

      <nav className="side-links" aria-label="Navigation admin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={activeView === item.id ? 'side-link active' : 'side-link'}
              type="button"
              key={item.id}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="side-session" type="button" onClick={onLogout}>
        <LogOut size={20} />
        <span>Session</span>
      </button>
    </aside>
  );
}
