# Guide d'Installation - CBCA Pastor Management System

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Node.js** (version 16 ou supérieure)
   - Télécharger depuis [nodejs.org](https://nodejs.org)
   - Vérifier : `node --version` et `npm --version`

2. **MongoDB** (version 5 ou supérieure)
   - **Option A** : Installation locale
     - Windows/Mac/Linux : [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - **Option B** : MongoDB Atlas (Cloud - recommandé)
     - [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
     - Créer un compte gratuit
     - Créer un cluster
     - Copier la connection string

3. **Git** (optionnel)
   - Télécharger depuis [git-scm.com](https://git-scm.com)

## 📥 Installation Étape par Étape

### Étape 1 : Cloner ou extraire le projet

```bash
# Si vous avez Git
git clone <repository-url>
cd Project\'s\ Dad

# Ou extrayez le fichier ZIP et naviguez au dossier
```

### Étape 2 : Installer MongoDB (si local)

**Windows** :
1. Télécharger le MSI Installer
2. Exécuter l'installateur
3. Suivre les instructions (installer en tant que service)
4. MongoDB sera disponible sur `mongodb://localhost:27017`

**Mac** (avec Homebrew) :
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu)** :
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Étape 3 : Configuration Backend

```bash
# Naviguer au dossier backend
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

**Éditer le fichier `backend/.env`** :

```env
# Variables obligatoires
NODE_ENV=development
PORT=5000

# Option 1 : MongoDB Local
MONGODB_URI=mongodb://localhost:27017/cbca-pastors

# Option 2 : MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cbca-pastors

# JWT (générer une clé sécurisée)
JWT_SECRET=votre-clé-secrète-très-long-et-aléatoire
JWT_EXPIRE=7d

# Frontend URL
CORS_ORIGIN=http://localhost:3000
```

### Étape 4 : Configuration Frontend

```bash
# Dans un nouveau terminal, naviguer au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

**Le fichier `frontend/.env` devrait contenir** :

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=CBCA Pastor Management
```

## 🚀 Lancer l'Application

### Option 1 : Deux Terminaux (Recommandé pour le développement)

**Terminal 1 - Backend** :

```bash
cd backend
npm run dev
```

Vous devriez voir :

```
╔════════════════════════════════════════╗
║  CBCA Pastor Management API            ║
║  Environment: development              ║
║  Port: 5000                             ║
╚════════════════════════════════════════╝
```

**Terminal 2 - Frontend** :

```bash
cd frontend
npm run dev
```

Vous devriez voir :

```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
```

### Option 2 : Utiliser Visual Studio Code Tasks (si disponible)

1. Ouvrir le projet dans VS Code
2. Appuyer sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
3. Taper "Tasks: Run Task"
4. Sélectionner la tâche appropriée

## 🌐 Accéder à l'Application

1. Ouvrir le navigateur
2. Aller à [http://localhost:3000](http://localhost:3000)
3. Créer un compte ou se connecter

## ✅ Vérification de l'Installation

### Backend accessible ?

```bash
curl http://localhost:5000/health
```

Résultat attendu :
```json
{ "status": "OK", "timestamp": "..." }
```

### Frontend accessible ?

Visiter [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Base de données connectée ?

Vérifier les logs du backend pour voir :
```
✓ MongoDB connected successfully
```

## 🆘 Troubleshooting

### Erreur : "MongoDB connection failed"

**Solution** :
1. Vérifier que MongoDB est en cours d'exécution
2. Vérifier l'URI MongoDB dans `.env`
3. Si utilisant MongoDB Atlas, vérifier l'IP whitelist

### Erreur : "Port 5000 est déjà utilisé"

**Solution** :
```bash
# Trouver le processus qui utilise le port
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000

# Changer le port dans .env
PORT=5001
```

### Erreur : "CORS Error"

**Solution** :
1. Vérifier que `CORS_ORIGIN` dans `backend/.env` correspond à l'URL du frontend
2. Vérifier que le frontend utilise le bon `VITE_API_URL`

### Erreur : "JWT_SECRET is required"

**Solution** :
1. Générer une clé sécurisée :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Copier le résultat dans `backend/.env` pour `JWT_SECRET`

### npm install échoue

**Solution** :
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

## 📦 Commandes Utiles

### Backend

```bash
npm run dev         # Mode développement (avec Nodemon)
npm start           # Mode production
npm test            # Lancer les tests
npm run lint        # Vérifier le code
npm run format      # Formater le code
```

### Frontend

```bash
npm run dev         # Mode développement
npm run build       # Build pour production
npm run preview     # Prévisualiser la build
npm run lint        # Vérifier le code
npm run format      # Formater le code
```

## 🔑 Créer un Premier Utilisateur

Après que l'application soit lancée :

1. Aller à [http://localhost:3000/login](http://localhost:3000/login)
2. Cliquer sur "S'enregistrer" (ou créer un formulaire d'enregistrement si nécessaire)
3. Remplir le formulaire avec :
   - Email : admin@cbca.org
   - Mot de passe : SecurePassword123!
   - Prénom : Admin
   - Nom : CBCA

## 📖 Ressources

- [Documentation Architecture](docs/ARCHITECTURE.md)
- [Schéma Base de Données](docs/DATABASE_SCHEMA.md)
- [Spécification API](docs/API_SPECIFICATION.md)
- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)

## 🎉 C'est fait !

Vous avez maintenant une installation complète et fonctionnelle du CBCA Pastor Management System.

Pour toute question ou problème, consultez les fichiers de documentation ou ouvrez une issue.

---

**Besoin d'aide ?** Contactez le support technique : support@cbca.org
