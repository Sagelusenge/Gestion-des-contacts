# Architecture - CBCA Pastor Management System

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────┐ │
│  │ Dashboard│ Pasteurs │ Géographie│Mouvements│ Paramètres │ │
│  └──────────┴──────────┴──────────┴──────────┴────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ API REST
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Auth       │ Pasteurs   │ Géographie │ Mouvements     ││
│  │  Routes     │ Routes     │ Routes     │ Routes         ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ RBAC Middleware │ Auth Middleware │ Error Handler       ││
│  └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Database (MongoDB)                        │
│  ┌─────────────┬──────────┬──────────┬──────────┐           │
│  │ Users       │ Pasteurs │ Postes   │ Mouvements          │
│  └─────────────┴──────────┴──────────┴──────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Stack Technique

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MongoDB
- **ODM**: Mongoose
- **Authentification**: JWT + bcrypt
- **Validation**: Joi
- **Logging**: Morgan + Winston

### Frontend
- **Framework**: React.js
- **State Management**: Context API / Redux (optionnel)
- **HTTP Client**: Axios
- **UI Library**: Material-UI / Tailwind CSS
- **Routing**: React Router v6

## Structure des Dossiers

### Backend
```
backend/
├── src/
│   ├── config/          # Configuration (BD, variables env)
│   ├── controllers/     # Logique métier
│   ├── models/          # Schémas Mongoose
│   ├── routes/          # Définition des routes
│   ├── middleware/      # Auth, RBAC, validation
│   ├── utils/           # Fonctions utilitaires
│   └── app.js           # Configuration Express
├── .env                 # Variables d'environnement
├── package.json         # Dépendances
└── server.js            # Point d'entrée
```

### Frontend
```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/           # Pages (Dashboard, Pasteurs, etc.)
│   ├── services/        # API calls
│   ├── context/         # Context API (Auth, etc.)
│   ├── utils/           # Utilitaires
│   ├── App.jsx          # Composant principal
│   └── main.jsx         # Point d'entrée
├── public/              # Assets statiques
├── .env                 # Variables d'environnement
└── package.json         # Dépendances
```

## Flux d'Authentification

```
1. User Login
   ├─ Frontend envoie email + password
   ├─ Backend valide les credentials
   ├─ Backend génère JWT
   └─ Frontend stocke JWT en localStorage

2. Authorized Requests
   ├─ Frontend ajoute JWT dans Authorization header
   ├─ Middleware valide le JWT
   ├─ Middleware vérifie le rôle (RBAC)
   └─ Route retourne les données

3. Logout
   ├─ Frontend supprime JWT du localStorage
   └─ Session terminée
```

## Modèle d'Authentification et RBAC

### Rôles
- **SUPER_ADMIN**: Représentant légal (Voit tout)
- **ADMIN_POSTE**: Responsable de poste (Voit ses pasteurs)
- **VIEWER**: Consultation uniquement

### Permissions par rôle

| Fonction | SUPER_ADMIN | ADMIN_POSTE | VIEWER |
|----------|------------|------------|--------|
| Voir tous les pasteurs | ✓ | ✓ (ses pasteurs) | ✓ (lecture) |
| Modifier pasteur | ✓ | ✓ (ses pasteurs) | ✗ |
| Créer pasteur | ✓ | ✓ | ✗ |
| Supprimer pasteur | ✓ | ✗ | ✗ |
| Gérer utilisateurs | ✓ | ✗ | ✗ |
| Voir historique | ✓ | ✓ | ✓ |
| Envoyer messages | ✓ | ✓ (son zone) | ✗ |

## Cycle de Vie d'une Requête

```
1. Client Request
   │
2. Express Middleware
   ├─ Body Parser
   ├─ CORS
   └─ Logging (Morgan)
   │
3. Route Matching
   │
4. Authentication Middleware
   ├─ Vérifie JWT
   └─ Extrait l'utilisateur
   │
5. RBAC Middleware
   ├─ Vérifie le rôle
   └─ Autorise l'accès
   │
6. Validation Middleware
   ├─ Valide les données
   └─ Retourne les erreurs
   │
7. Controller
   ├─ Logique métier
   ├─ Appels BD
   └─ Réponse
   │
8. Response
   └─ JSON au client
```

## Sécurité

1. **JWT Signing**: Clé secrète stockée en .env
2. **Password Hashing**: Bcrypt (10 rounds)
3. **CORS**: Configuration stricte
4. **Rate Limiting**: Sur les routes d'authentification
5. **Validation Input**: Joi sur toutes les entrées
6. **SQL Injection Protection**: Mongoose (ORM)
7. **XSS Protection**: Headers HTTP strictes
8. **Audit Log**: Enregistrement de chaque modification

## API Endpoints

### Authentication
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter
- `POST /api/auth/refresh` - Rafraîchir JWT

### Pasteurs
- `GET /api/pasteurs` - Lister
- `GET /api/pasteurs/:id` - Détails
- `POST /api/pasteurs` - Créer
- `PUT /api/pasteurs/:id` - Modifier
- `DELETE /api/pasteurs/:id` - Supprimer

### Géographie
- `GET /api/geographie/postes` - Lister postes
- `GET /api/geographie/sections` - Lister sections
- `GET /api/geographie/paroisses` - Lister paroisses

### Mouvements
- `GET /api/mouvements` - Historique
- `POST /api/mouvements` - Créer mouvement
- `GET /api/mouvements/alertes` - Alertes de fin mandat

## Déploiement

### Développement
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

### Production
- Backend: Déployer sur Heroku/Railway/AWS
- Frontend: Déployer sur Vercel/Netlify/AWS S3
- BD: MongoDB Atlas (cloud)
