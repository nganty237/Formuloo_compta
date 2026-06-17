# Runbook - Guide d'Exploitation 📖

Ce guide contient toutes les instructions nécessaires pour installer, lancer et maintenir le projet **Formuloo Compta**.

---

## 🛠️ Installation (Le "Montage")

1.  **Prérequis** :
    *   Node.js (Version LTS recommandée).
    *   npm (le gestionnaire de paquets).

2.  **Installation des dépendances** :
    Ouvrez un terminal à la racine du projet et lancez :
    ```bash
    npm install
    ```

---

## 🚀 Démarrage (Le "Lancement")

Pour faire fonctionner l'application, vous devez lancer **deux services** en parallèle.

### 1. Le Backend (Mock API)
C'est lui qui gère la base de données.
```bash
npm run api
```
*L'API sera disponible sur `http://localhost:3000`.*

### 2. Le Frontend (Interface)
C'est le site web sur lequel vous naviguez.
```bash
npm start
```
*L'application sera disponible sur `http://localhost:4200`.*

---

## 🧪 Tests & Qualité (Le "Contrôle Technique")

### 1. Tests Unitaires
Pour vérifier que les calculs comptables et les composants fonctionnent individuellement :
```bash
npm test
```

### 2. Formatage du Code
Pour garder un code propre et lisible :
```bash
npx formatter --write .
```
*(Note : Utilise Prettier configuré dans `.prettierrc`)*

---

## 📂 Gestion des Données (La "Maintenance")

Les données sont stockées dans le fichier : `src/mock-api/db.json`.

*   **Réinitialiser les données** : Si vous faites trop de tests et voulez revenir à zéro, vous pouvez restaurer une version propre de `db.json` (via Git).
*   **Ajouter des rôles** : Modifiez la section `onboarding_roles` dans `db.json`.

---

## 🆘 Dépannage (Le "Guide de Secours")

*   **Erreur `ERR_CONNECTION_REFUSED`** : Vous avez probablement oublié de lancer l'API (`npm run api`).
*   **Les modifications ne s'affichent pas** : Vérifiez que le terminal du frontend ne signale pas d'erreur de compilation. Redémarrez `npm start` si besoin.
*   **Problème de styles** : Le projet utilise Tailwind 4. Assurez-vous qu'aucun processus PostCSS n'est bloqué.

---

*Dernière mise à jour : 16 juin 2026*
