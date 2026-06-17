import { BadgePlus, ContactRound, CreditCard, LayoutDashboard, LogOut, MapPinned, MessageSquareText, UserPlus, Users } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'directory', label: 'Annuaire', icon: ContactRound },
  { id: 'addPastor', label: 'Ajouter pasteur', icon: UserPlus, adminOnly: true },
  { id: 'addPoste', label: 'Ajouter poste', icon: MapPinned, adminOnly: true },
  { id: 'addFonction', label: 'Fonctions', icon: BadgePlus, adminOnly: true },
  { id: 'users', label: 'Rôles & Utilisateurs', icon: Users, adminOnly: true }
];

export function Sidebar({ activeView, onViewChange, onLogout, user }) {
  const isAdmin = user?.role === 'admin';
  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="side-nav">
      <div className="side-brand">
        <img
          src="/cbca-logo.png"
          alt="Logo CBCA"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/cbca-logo.jpg';
          }}
        />
        <div>
          <strong>CBCA Connect</strong>
          <span>{isAdmin ? 'Administration' : 'Annuaire'}</span>
        </div>
      </div>

      <nav className="side-links" aria-label="Navigation admin">
        {filteredItems.map((item) => {
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
