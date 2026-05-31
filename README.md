# Formuloo Compta 🚀

Plateforme de comptabilité moderne respectant les normes OHADA.

## 🛠 Installation et Lancement

Pour faire fonctionner le projet correctement, vous devez lancer **deux terminaux** : un pour le backend (Mock API) et un pour le frontend (Angular).

### 1. Lancer l'API (Mock Backend)
Le projet utilise `json-server` pour simuler une base de données. Sans cette étape, vous rencontrerez des erreurs `ERR_CONNECTION_REFUSED`.

Dans le premier terminal, exécutez :
```bash
npm run api
```
L'API sera disponible sur `http://localhost:3000`.

### 2. Lancer l'application Angular
Dans un second terminal, exécutez :
```bash
npm start
```
Une fois le serveur lancé, ouvrez votre navigateur sur `http://localhost:4200/`.

---

## 🏗 Structure du projet

*   **Frontend**: Angular 21 (Standalone Components, Signals, New Control Flow)
*   **Styles**: Tailwind CSS 4
*   **Base de données**: Mock API via `json-server` (fichier `src/mock-api/db.json`)
*   **Tests**: Vitest

## 🧪 Tests et Qualité

Pour exécuter les tests unitaires avec Vitest :
```bash
npm test
```

Pour lancer les tests de charge (K6) :
```bash
# Nécessite K6 installé sur votre machine
k6 run scripts/k6-load-test.js
```

## 📚 Ressources additionnelles

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
