# Base MySQL

## Installation

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/create-user.sql
mysql -u root -p < database/seed.sql
```

## Tables

`pastors` contient les informations privees de l'annuaire CBCA :

- `id`
- `nom`
- `degre`
- `poste`
- `telephone`
- `email`
- `date_affectation`

`users` servira au login simple de l'application.

`postes` contient les paroisses, postes ou departements que l'admin ajoute pour organiser l'annuaire.

Le seed cree un compte de test :

- utilisateur : `admin`
- mot de passe : `admin123`

Ce compte devra etre remplace avant une mise en production.

## Recherche

Les index principaux sont :

- `idx_pastors_nom`
- `idx_pastors_degre`
- `idx_pastors_poste`
- `idx_pastors_degre_poste`
- `ftx_pastors_search`

Le futur backend pourra utiliser `LIKE 'terme%'` pour les recherches rapides prefixees, et `FULLTEXT` pour une recherche plus souple sur plusieurs mots.
