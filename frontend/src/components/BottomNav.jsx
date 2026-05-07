import { ContactRound, LogOut, Settings } from 'lucide-react';

export function BottomNav({ activeView, onViewChange, onLogout, user }) {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <button
        className={activeView === 'directory' ? 'nav-item active' : 'nav-item'}
        type="button"
        onClick={() => onViewChange('directory')}
      >
        <ContactRound size={21} />
        <span>Annuaire</span>
      </button>

      {user?.role === 'admin' ? (
        <button
          className={activeView === 'admin' ? 'nav-item active' : 'nav-item'}
          type="button"
          onClick={() => onViewChange('admin')}
        >
          <Settings size={21} />
          <span>Admin</span>
        </button>
      ) : null}

      <button className="nav-item" type="button" onClick={onLogout}>
        <LogOut size={21} />
        <span>Sortir</span>
      </button>
    </nav>
  );
}
