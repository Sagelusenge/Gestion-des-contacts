# CBCA Pastor Management System

Système de gestion centralisé des pasteurs pour la Communion Baptiste Centrafricaine (CBCA), développé avec Express.js (Backend) et React.js (Frontend).

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Documentation](#documentation)
- [API](#api)
- [Contribution](#contribution)

## 🎯 Aperçu

Ce projet permet aux dirigeants ecclésiastiques de :

- **Gérer les informations des pasteurs** : profil complet, formation, historique des mouvements
- **Contrôler l'accès par rôle (RBAC)** : Super-Admin, Admin de Poste, Viewer
- **Visualiser les statistiques** : tableau de bord avec KPIs
- **Gérer les mouvements** : affectations, transferts, promotions
- **Recevoir des alertes** : fin de mandat, urgences locales
- **Communiquer facilement** : listes de diffusion intelligentes

## ✨ Features

### Sécurité
- ✅ Authentification JWT
- ✅ Hachage des mots de passe (bcrypt)
- ✅ RBAC (Rôles et Permissions)
- ✅ Journal d'audit complet
- ✅ Protection CORS
- ✅ Rate limiting

### Gestion des Pasteurs
- ✅ Profil complet (identité, formation, état civil)
- ✅ Historique des mouvements
- ✅ Statuts (Actif, En congé, Retraité)
- ✅ Recherche et filtrage
- ✅ Photos et documents

### Dashboards
- ✅ Statistiques par grade
- ✅ Répartition géographique
- ✅ Alertes de fin de mandat
- ✅ Vue d'ensemble par poste

### Communication
- ✅ Listes de diffusion intelligentes
- ✅ Contacts d'urgence
- ✅ Notifications (TODO)

## 🏗️ Architecture

```
┌─────────────────────┐
│  Frontend (React)   │
│  Port: 3000         │
└──────────┬──────────┘
           │ REST API
┌──────────▼──────────┐
│ Backend (Express)   │
│ Port: 5000          │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ MongoDB             │
│ Collections         │
└─────────────────────┘
```

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour plus de détails.

## 📦 Installation

### Prérequis

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 5.0 (local ou Atlas)
- Git

### 1. Cloner le repository

```bash
git clone <repository-url>
cd Project\'s\ Dad
```

### 2. Installation du Backend

```bash
cd backend
npm install
```

### 3. Installation du Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Remplir les variables :

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cbca-pastors
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Remplir les variables :

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=CBCA Pastor Management
```

## 🚀 Démarrage

### Mode Développement

**Terminal 1 - Backend** :

```bash
cd backend
npm run dev
# Serveur disponible sur http://localhost:5000
```

**Terminal 2 - Frontend** :

```bash
cd frontend
npm run dev
# Application disponible sur http://localhost:3000
```

### Accéder à l'application

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Compte de test

Pour les tests initiaux, créer un compte via le formulaire d'enregistrement ou utiliser les données par défaut (à ajouter en base).

## 📚 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture système et flux
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Schéma de base de données
- [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - Spécification complète des APIs

## 🔌 API

### Endpoints principaux

- **Authentication**
  - `POST /api/v1/auth/register` - Créer un compte
  - `POST /api/v1/auth/login` - Se connecter
  - `POST /api/v1/auth/logout` - Se déconnecter

- **Pasteurs**
  - `GET /api/v1/pasteurs` - Lister
  - `GET /api/v1/pasteurs/:id` - Détails
  - `POST /api/v1/pasteurs` - Créer
  - `PUT /api/v1/pasteurs/:id` - Modifier
  - `DELETE /api/v1/pasteurs/:id` - Supprimer

- **Géographie**
  - `GET /api/v1/geographie/postes` - Lister postes
  - `GET /api/v1/geographie/sections` - Lister sections
  - `GET /api/v1/geographie/paroisses` - Lister paroisses

- **Mouvements**
  - `GET /api/v1/mouvements` - Historique
  - `POST /api/v1/mouvements` - Créer mouvement
  - `GET /api/v1/mouvements/alertes` - Alertes

Voir [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) pour la documentation complète.

## 🧪 Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 🏗️ Build pour la Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Fichiers dans dist/
```

## 📋 Fichiers et Structure

```
Project's Dad/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Schémas Mongoose
│   │   ├── routes/         # Routes Express
│   │   ├── middleware/     # Middlewares
│   │   ├── utils/          # Utilitaires
│   │   └── app.js          # App Express
│   ├── package.json
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages (Dashboard, etc.)
│   │   ├── services/       # Appels API
│   │   ├── context/        # État global (Zustand)
│   │   ├── utils/          # Utilitaires
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md          # Architecture du système
│   ├── DATABASE_SCHEMA.md       # Schéma BD
│   └── API_SPECIFICATION.md     # Spécification API
└── README.md
```

## 🔐 Sécurité

- Tous les endpoints (sauf `/auth`) requièrent une authentification JWT
- Les mots de passe sont hachés avec bcrypt
- RBAC pour contrôler l'accès par rôle
- Audit log de toutes les modifications
- Rate limiting sur les routes sensibles
- CORS configuré de façon stricte
- Validation des entrées avec Joi

## 🤝 Contribution

1. Créer une branche (`git checkout -b feature/amazing-feature`)
2. Commiter les changements (`git commit -m 'Add amazing feature'`)
3. Pousser la branche (`git push origin feature/amazing-feature`)
4. Ouvrir une Pull Request

## 📝 License

Ce projet est sous license MIT. Voir le fichier LICENSE pour plus de détails.

## 👥 Support

Pour les problèmes et questions, ouvrir une issue sur GitHub.

---

**Dernière mise à jour**: May 2026
**Version**: 1.0.0
