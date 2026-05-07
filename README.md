# Annuaire CBCA

Nouveau départ du projet `Gestion-des-contacts`.

Le premier socle livré ici est la base de données MySQL pour l'annuaire des pasteurs CBCA. Le backend Node.js/Express et le frontend React seront construits ensuite au-dessus de ce schéma.

## Base de données

Les scripts sont dans `database/` :

- `schema.sql` crée la base `cbca_annuaire`, les tables, contraintes et index.
- `seed.sql` ajoute quelques données de test.
- `search-examples.sql` documente les requêtes prévues pour l'API REST.

Installation locale :

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/create-user.sql
mysql -u root -p < database/seed.sql
```

La table principale est `pastors`, avec recherche indexée sur `nom`, `degre` et `poste`.

## Backend Express

Le backend se trouve dans `backend/`.

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Routes principales :

- `POST /api/auth/login`
- `GET /api/pastors`
- `GET /api/pastors/search?q=...`
- `POST /api/pastors` admin uniquement
- `PUT /api/pastors/:id` admin uniquement
- `DELETE /api/pastors/:id` admin uniquement
- `GET /api/postes`
- `POST /api/postes` admin uniquement

## Frontend React

Le frontend se trouve dans `frontend/`.

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Interface disponible sur `http://localhost:5173`.

Fonctions livrees :

- connexion protegee
- recherche temps reel avec debounce
- filtres rapides par degre et region
- cartes pasteurs avec appel et WhatsApp
- espace admin pour ajouter les postes
- espace admin pour ajouter les pasteurs
- manifest PWA et service worker
