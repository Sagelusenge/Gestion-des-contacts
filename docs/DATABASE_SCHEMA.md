# Schéma de Base de Données - CBCA Pastor Management

## Entités et Relations

### 1. Users (Utilisateurs)

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String,
  lastName: String,
  phone: String,
  role: Enum ['SUPER_ADMIN', 'ADMIN_POSTE', 'VIEWER'],
  
  // Pour les Admin de Poste
  posteAssigne: ObjectId (ref: 'Poste'),
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean (default: true),
  
  // Authentification
  refreshTokens: [String],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

### 2. Pasteurs (Pasteurs)

```javascript
{
  _id: ObjectId,
  
  // Identité
  nom: String (required),
  prenom: String (required),
  dateNaissance: Date,
  lieuNaissance: String,
  photo: String (URL),
  email: String (unique),
  telephone: String,
  
  // Administratif
  matricule: String (unique, required),
  numeroIdentifiant: String,
  dateOrdination: Date (required),
  grade: Enum ['Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant'],
  fonction: String,
  
  // Formation
  formation: [{
    diplome: String,
    institution: String,
    dateObtention: Date,
    specialite: String
  }],
  
  // État Civil
  etatCivil: Enum ['Célibataire', 'Marié', 'Divorcé', 'Veuf'],
  conjoint: {
    nom: String,
    prenom: String,
    dateNaissance: Date,
    implication: String // Eg. "Animatrice", "Enseignante"
  },
  enfants: [{
    nom: String,
    prenom: String,
    dateNaissance: Date
  }],
  
  // Localisation Actuelle
  poste: ObjectId (ref: 'Poste', required),
  section: ObjectId (ref: 'Section'),
  paroisse: ObjectId (ref: 'Paroisse'),
  adresseActuelle: String,
  
  // Statut
  statut: Enum ['Actif', 'En Congé', 'Retraité', 'Suspendu'],
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: 'User'),
  updatedBy: ObjectId (ref: 'User'),
  
  // Indices de performance
  notes: String,
  alerteFin: Boolean (fin de mandat?)
}
```

### 3. Postes (Postes Ecclésiastiques)

```javascript
{
  _id: ObjectId,
  
  nom: String (required, unique),
  code: String (required, unique),
  description: String,
  
  // Hiérarchie
  communaute: ObjectId (ref: 'Communaute', required),
  
  // Contact
  responsable: ObjectId (ref: 'User'), // Admin de Poste
  telephone: String,
  email: String,
  adresse: String,
  
  // Statistiques
  nombrePasteurs: Number,
  nombreSections: Number,
  nombreParoisses: Number,
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: 'User')
}
```

### 4. Sections

```javascript
{
  _id: ObjectId,
  
  nom: String (required),
  code: String (required, unique),
  description: String,
  
  // Hiérarchie
  poste: ObjectId (ref: 'Poste', required),
  
  // Contact
  responsable: ObjectId (ref: 'Pasteur'),
  telephone: String,
  adresse: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Paroisses

```javascript
{
  _id: ObjectId,
  
  nom: String (required),
  code: String (required, unique),
  description: String,
  
  // Hiérarchie
  section: ObjectId (ref: 'Section', required),
  poste: ObjectId (ref: 'Poste', required),
  
  // Contact
  pasteur: ObjectId (ref: 'Pasteur'),
  telephone: String,
  adresse: String,
  
  // Membres
  nombreMembers: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Communautés

```javascript
{
  _id: ObjectId,
  
  nom: String (required, unique),
  code: String (required, unique),
  description: String,
  
  // Localisation
  pays: String,
  region: String,
  
  // Contact
  telephone: String,
  email: String,
  siteWeb: String,
  
  // Statistiques
  nombrePostes: Number,
  
  // Logo / Branding
  logo: String (URL),
  couleur1: String,
  couleur2: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Mouvements (Affectations)

```javascript
{
  _id: ObjectId,
  
  // Qui et Quand
  pasteur: ObjectId (ref: 'Pasteur', required),
  dateDebut: Date (required),
  dateFin: Date,
  
  // Où
  posteSource: ObjectId (ref: 'Poste'),
  posteCible: ObjectId (ref: 'Poste', required),
  
  // Type
  typeMovement: Enum ['Affectation', 'Transfert', 'Promotion', 'Retraite'],
  motif: String,
  observations: String,
  
  // Statut
  statut: Enum ['Proposé', 'Approuvé', 'Effectué', 'Annulé'],
  dateApprobation: Date,
  approuveePar: ObjectId (ref: 'User'),
  
  // Audit
  createdAt: Date,
  createdBy: ObjectId (ref: 'User'),
  
  // Alertes
  alerteFin: Boolean,
  dureeMandat: Number // en années
}
```

### 8. AuditLog (Journal des Actions)

```javascript
{
  _id: ObjectId,
  
  // Action
  action: String ('CREATE', 'UPDATE', 'DELETE'),
  entite: String ('Pasteur', 'User', 'Poste', etc.),
  entiteId: ObjectId,
  
  // Qui
  utilisateur: ObjectId (ref: 'User'),
  utilisateurNom: String,
  
  // Changements
  anciennes: Object,
  nouvelles: Object,
  
  // Détails
  ip: String,
  userAgent: String,
  
  createdAt: Date
}
```

## Relations et Index

### Indexes Recommandés

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ posteAssigne: 1 });

// Pasteurs
db.pasteurs.createIndex({ matricule: 1 }, { unique: true });
db.pasteurs.createIndex({ poste: 1 });
db.pasteurs.createIndex({ section: 1 });
db.pasteurs.createIndex({ paroisse: 1 });
db.pasteurs.createIndex({ grade: 1 });
db.pasteurs.createIndex({ statut: 1 });
db.pasteurs.createIndex({ alerteFin: 1 });

// Postes
db.postes.createIndex({ code: 1 }, { unique: true });
db.postes.createIndex({ communaute: 1 });

// Mouvements
db.mouvements.createIndex({ pasteur: 1 });
db.mouvements.createIndex({ posteCible: 1 });
db.mouvements.createIndex({ statut: 1 });
db.mouvements.createIndex({ dateDebut: 1 });
```

### Cardinalités

```
Communaute (1) ──────── (N) Poste
Poste (1) ──────── (N) Section
Section (1) ──────---- (N) Paroisse
Poste (1) ──────---- (N) Pasteur
User (1) ──────---- (1) Poste (Admin)
Pasteur (N) ──────---- (1) Mouvement
```

## Migrations et Versioning

### Collection Versioning
```javascript
{
  version: String,
  createdAt: Date,
  migrations: [
    { version: '1.0.0', date: Date, description: String }
  ]
}
```
