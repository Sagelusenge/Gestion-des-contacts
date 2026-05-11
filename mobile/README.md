# Annuaire CBCA Mobile

Application mobile Expo connectee au meme backend que le web.

## Lancer en local

```bash
cd mobile
npm install
npm start
```

Scanne le QR code avec Expo Go sur Android.

## Creer une app Android installable

Pour generer un fichier APK installable sur un telephone Android :

```bash
cd mobile
npm install
npx eas-cli login
npx eas-cli build -p android --profile preview
```

Quand le build finit, Expo donne un lien de telechargement. Ouvre ce lien sur le telephone, telecharge le `.apk`, puis installe l'application.

## API

Par defaut, l'application utilise:

```text
https://gestionannuaire-3a46.onrender.com/api
```

Pour changer l'API:

```bash
$env:EXPO_PUBLIC_API_URL="https://ton-backend.onrender.com/api"
npm start
```

## Fonctionnalites

- Connexion admin
- Dashboard mobile
- Recherche des pasteurs
- Filtres par grade et poste
- Appel, WhatsApp, email et copie de contact
- Diffusion WhatsApp assistee par poste, region ou grade
- Ajout, modification et suppression des pasteurs
- Ajout, modification et suppression des postes
- Ajout, modification et suppression des grades
- Creation d'utilisateurs avec email et mot de passe
