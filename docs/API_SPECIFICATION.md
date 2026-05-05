# Spécification des APIs - CBCA Pastor Management

## Convention Générale

### Réponse Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Description succincte"
}
```

### Réponse Erreur
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description de l'erreur",
    "details": {}
  }
}
```

### Codes HTTP
- `200 OK` - Succès
- `201 Created` - Ressource créée
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Auth échouée
- `403 Forbidden` - Pas de permission
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (ex: doublon)
- `500 Internal Server Error` - Erreur serveur

---

## Authentication Endpoints

### 1. POST /api/auth/register
Créer un nouveau compte utilisateur.

**Request**
```json
{
  "email": "admin@cbca.org",
  "password": "SecurePassword123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+243123456789",
  "role": "ADMIN_POSTE"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4a12",
    "email": "admin@cbca.org",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "ADMIN_POSTE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. POST /api/auth/login
Authentifier un utilisateur et obtenir un JWT.

**Request**
```json
{
  "email": "admin@cbca.org",
  "password": "SecurePassword123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4a12",
      "email": "admin@cbca.org",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "ADMIN_POSTE"
    },
    "expiresIn": 3600
  }
}
```

---

### 3. POST /api/auth/logout
Se déconnecter (invalide les tokens).

**Request**
```
Headers: Authorization: Bearer {token}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 4. POST /api/auth/refresh
Rafraîchir le JWT avec un refresh token.

**Request**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## Pasteurs Endpoints

### 5. GET /api/pasteurs
Lister tous les pasteurs (avec filtres et pagination).

**Query Parameters**
```
?page=1&limit=20&poste=60d5ec49f1b2c72b8c8e4a12&statut=Actif&search=Jean
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "pasteurs": [
      {
        "id": "60d5ec49f1b2c72b8c8e4a13",
        "nom": "Dupont",
        "prenom": "Jean",
        "matricule": "CBCA-001",
        "grade": "Pasteur",
        "poste": "Kinshasa",
        "statut": "Actif",
        "telephone": "+243123456789",
        "dateOrdination": "2015-06-20T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### 6. GET /api/pasteurs/:id
Récupérer les détails complets d'un pasteur.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4a13",
    "nom": "Dupont",
    "prenom": "Jean",
    "dateNaissance": "1980-05-15T00:00:00Z",
    "lieuNaissance": "Kinshasa",
    "photo": "https://cdn.cbca.org/photos/60d5ec49f1b2c72b8c8e4a13.jpg",
    "email": "jean.dupont@cbca.org",
    "telephone": "+243123456789",
    "matricule": "CBCA-001",
    "grade": "Pasteur",
    "fonction": "Responsable de Paroisse",
    "formation": [
      {
        "diplome": "Licence en Théologie",
        "institution": "Institut de Théologie CBCA",
        "dateObtention": "2010-06-20T00:00:00Z",
        "specialite": "Pastorale"
      }
    ],
    "etatCivil": "Marié",
    "conjoint": {
      "nom": "Durand",
      "prenom": "Marie",
      "dateNaissance": "1982-03-10T00:00:00Z",
      "implication": "Animatrice de femmes"
    },
    "enfants": [
      {
        "nom": "Dupont",
        "prenom": "Pierre",
        "dateNaissance": "2005-07-22T00:00:00Z"
      }
    ],
    "poste": "60d5ec49f1b2c72b8c8e4a12",
    "section": "60d5ec49f1b2c72b8c8e4a20",
    "paroisse": "60d5ec49f1b2c72b8c8e4a21",
    "adresseActuelle": "Av. Kabinda 123, Kinshasa",
    "statut": "Actif",
    "historique": [
      {
        "poste": "60d5ec49f1b2c72b8c8e4a12",
        "dateDebut": "2015-01-01T00:00:00Z",
        "dateFin": null,
        "typeMovement": "Affectation"
      }
    ]
  }
}
```

---

### 7. POST /api/pasteurs
Créer un nouveau pasteur.

**Request** (Requires: SUPER_ADMIN ou ADMIN_POSTE)
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "dateNaissance": "1980-05-15",
  "lieuNaissance": "Kinshasa",
  "email": "jean.dupont@cbca.org",
  "telephone": "+243123456789",
  "matricule": "CBCA-001",
  "dateOrdination": "2015-06-20",
  "grade": "Pasteur",
  "fonction": "Responsable de Paroisse",
  "poste": "60d5ec49f1b2c72b8c8e4a12",
  "section": "60d5ec49f1b2c72b8c8e4a20",
  "paroisse": "60d5ec49f1b2c72b8c8e4a21",
  "etatCivil": "Marié",
  "conjoint": {
    "nom": "Durand",
    "prenom": "Marie"
  }
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4a13",
    "message": "Pasteur créé avec succès"
  }
}
```

---

### 8. PUT /api/pasteurs/:id
Modifier les informations d'un pasteur.

**Request** (Requires: SUPER_ADMIN ou ADMIN_POSTE)
```json
{
  "fonction": "Pasteur Principal",
  "email": "jean.dupont.new@cbca.org",
  "telephone": "+243987654321"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4a13",
    "message": "Pasteur modifié avec succès"
  }
}
```

---

### 9. DELETE /api/pasteurs/:id
Supprimer un pasteur (soft delete).

**Request** (Requires: SUPER_ADMIN)

**Response (200)**
```json
{
  "success": true,
  "message": "Pasteur supprimé avec succès"
}
```

---

## Géographie Endpoints

### 10. GET /api/geographie/postes
Lister tous les postes avec pagination.

**Query Parameters**
```
?page=1&limit=50&search=Kinshasa
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "postes": [
      {
        "id": "60d5ec49f1b2c72b8c8e4a12",
        "nom": "Poste de Kinshasa",
        "code": "KSHSA",
        "description": "Poste principal en RDC",
        "communaute": "60d5ec49f1b2c72b8c8e4a01",
        "responsable": "60d5ec49f1b2c72b8c8e4a50",
        "nombrePasteurs": 25,
        "nombreSections": 5,
        "nombreParoisses": 45
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 8 }
  }
}
```

---

### 11. GET /api/geographie/sections
Lister les sections par poste.

**Query Parameters**
```
?poste=60d5ec49f1b2c72b8c8e4a12
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "60d5ec49f1b2c72b8c8e4a20",
        "nom": "Section Nord",
        "code": "SEC-N",
        "poste": "60d5ec49f1b2c72b8c8e4a12",
        "responsable": "60d5ec49f1b2c72b8c8e4a13"
      }
    ]
  }
}
```

---

### 12. GET /api/geographie/paroisses
Lister les paroisses par section.

**Query Parameters**
```
?section=60d5ec49f1b2c72b8c8e4a20
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "paroisses": [
      {
        "id": "60d5ec49f1b2c72b8c8e4a21",
        "nom": "Paroisse Centrale",
        "code": "PAR-001",
        "section": "60d5ec49f1b2c72b8c8e4a20",
        "pasteur": "60d5ec49f1b2c72b8c8e4a13",
        "nombreMembers": 450
      }
    ]
  }
}
```

---

## Mouvements Endpoints

### 13. GET /api/mouvements
Lister l'historique des mouvements avec filtres.

**Query Parameters**
```
?pasteur=60d5ec49f1b2c72b8c8e4a13&statut=Effectué&type=Affectation
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "mouvements": [
      {
        "id": "60d5ec49f1b2c72b8c8e4a30",
        "pasteur": "60d5ec49f1b2c72b8c8e4a13",
        "dateDebut": "2020-01-15T00:00:00Z",
        "dateFin": null,
        "posteSource": "60d5ec49f1b2c72b8c8e4a11",
        "posteCible": "60d5ec49f1b2c72b8c8e4a12",
        "typeMovement": "Transfert",
        "statut": "Effectué",
        "dureeMandat": 4
      }
    ]
  }
}
```

---

### 14. POST /api/mouvements
Créer un nouveau mouvement.

**Request** (Requires: SUPER_ADMIN)
```json
{
  "pasteur": "60d5ec49f1b2c72b8c8e4a13",
  "dateDebut": "2024-06-01",
  "posteCible": "60d5ec49f1b2c72b8c8e4a12",
  "typeMovement": "Transfert",
  "motif": "Renforcement des effectifs",
  "observations": "Pasteur expérimenté"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1b2c72b8c8e4a30",
    "message": "Mouvement créé avec succès"
  }
}
```

---

### 15. GET /api/mouvements/alertes
Obtenir les alertes de fin de mandat.

**Query Parameters**
```
?moisAvant=3
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "alertes": [
      {
        "pasteur": "60d5ec49f1b2c72b8c8e4a13",
        "nom": "Jean Dupont",
        "dateFinMandat": "2024-06-30T00:00:00Z",
        "posteCourant": "60d5ec49f1b2c72b8c8e4a12",
        "joursRestants": 45
      }
    ],
    "total": 5
  }
}
```

---

## Dashboard Endpoints

### 16. GET /api/dashboard/statistiques
Obtenir les statistiques globales.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "totalPasteurs": 245,
    "pasteurParGrade": {
      "Révérend Pasteur": 15,
      "Pasteur": 120,
      "Pasteur Stagiaire": 80,
      "Proposant": 30
    },
    "pasteurParStatut": {
      "Actif": 230,
      "En Congé": 10,
      "Retraité": 3,
      "Suspendu": 2
    },
    "totalPostes": 8,
    "totalSections": 45,
    "totalParoisses": 200
  }
}
```

---

### 17. GET /api/dashboard/geographie
Obtenir la répartition géographique.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "parPosition": [
      {
        "poste": "Kinshasa",
        "pasteurs": 45,
        "sections": 5,
        "paroisses": 30
      },
      {
        "poste": "Kasai",
        "pasteurs": 38,
        "sections": 4,
        "paroisses": 25
      }
    ]
  }
}
```

---

## Headers Authentification

Tous les endpoints sauf `/auth` requièrent :
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## Codes d'Erreur Personnalisés

| Code | Signification |
|------|--------------|
| `AUTH_INVALID_CREDENTIALS` | Email ou mot de passe incorrect |
| `AUTH_REQUIRED` | Token manquant ou invalide |
| `AUTH_FORBIDDEN` | Rôle insuffisant |
| `VALIDATION_ERROR` | Données invalides |
| `RESOURCE_NOT_FOUND` | Ressource inexistante |
| `DUPLICATE_ENTRY` | Doublon (ex: matricule) |
| `INTERNAL_ERROR` | Erreur serveur |
