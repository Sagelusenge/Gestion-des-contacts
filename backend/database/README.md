# Scripts SQL MySQL

Ces fichiers documentent la base MySQL utilisée par le backend.

Ordre recommandé :

```sql
SOURCE backend/database/001_schema.sql;
SOURCE backend/database/002_views_procedures_triggers.sql;
SOURCE backend/database/003_seed.sql;
```

Le script Node `npm run db:init` reste le moyen le plus simple pour recréer la base localement, mais ces fichiers donnent une version SQL lisible et réutilisable.
