# Backend Express - Annuaire CBCA

API REST Node.js/Express pour l'annuaire des pasteurs CBCA.

## Demarrage

```bash
npm install
copy .env.example .env
npm run dev
```

La base MySQL doit exister avant le demarrage :

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/create-user.sql
mysql -u root -p < ../database/seed.sql
```

## Authentification

Le seed cree l'admin initial :

- username : `sagelusenge@gmail.com`
- password : `Bonsoirs`

Les routes de lecture sont protegees par token JWT. Les routes d'ecriture sont reservees au role `admin`.

## Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/pastors?page=1&limit=20`
- `GET /api/pastors/search?q=goma`
- `GET /api/pastors/:id`
- `POST /api/pastors`
- `PUT /api/pastors/:id`
- `DELETE /api/pastors/:id`
- `GET /api/postes`
- `POST /api/postes`
- `PUT /api/postes/:id`
- `DELETE /api/postes/:id`

## Espace poste

L'admin gere les postes, paroisses ou departements via `/api/postes`. Le frontend pourra ensuite proposer ces postes dans le formulaire d'ajout d'un pasteur et dans les filtres rapides.
