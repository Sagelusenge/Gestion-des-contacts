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
- `POST /api/broadcasts/whatsapp` admin uniquement, envoi WhatsApp via Meta Cloud API

Pour activer l'envoi automatique WhatsApp sur Render, ajoute ces variables au backend :

```text
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_BROADCAST_BATCH_SIZE=10
WHATSAPP_BROADCAST_BATCH_DELAY_MS=150
```

Sans ces variables, le bouton de diffusion API reste visible mais l'API renvoie un message de configuration manquante.

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

## Application mobile Expo

L'application mobile se trouve dans `mobile/`.

```bash
cd mobile
npm install
npm start
```

Elle utilise par defaut l'API de production Render :

```text
https://gestionannuaire-3a46.onrender.com/api
```

Fonctions livrees :

- connexion admin
- dashboard mobile
- recherche et filtres de l'annuaire
- appel, WhatsApp, email et copie de contact
- gestion des pasteurs, postes et grades
