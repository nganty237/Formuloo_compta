# Documentation de l'API - Formuloo Compta 🚀

Cette documentation décrit les points de terminaison (endpoints) de l'API utilisés par le frontend Angular. L'API est actuellement simulée par un `json-server` (Mock API).

## 🌍 Base URL
`http://localhost:3000` (Développement local)

---

## 🏢 Entreprises (Companies)

Gère les entités juridiques rattachées à un cabinet (Tenant).

### 📋 Liste des entreprises d'un Tenant
`GET /entreprises?tenantId={tenantId}`

- **Description** : Récupère toutes les entreprises liées à l'espace de travail actuel.
- **Paramètres** : 
    - `tenantId` (query) : L'ID de l'organisation parente.
- **Réponse** (Exemple) :
    ```json
    [
      {
        "id": "ENT-001",
        "tenantId": "tenant-1",
        "nom": "Tech Africa Cameroun",
        "ninea": "123456789",
        "pays": "Cameroun",
        "devise": "XAF"
      }
    ]
    ```

### 🔍 Détails d'une entreprise
`GET /entreprises/{id}`

- **Description** : Récupère les informations complètes d'une entreprise spécifique.

### ➕ Créer une entreprise
`POST /entreprises`

- **Body** : `Entreprise` (sans `id`).
- **Description** : Ajoute une nouvelle entreprise au dossier du cabinet.

---

## 📒 Journal & Écritures (Accounting Entries)

Gestion des mouvements comptables.

### 📋 Liste du Journal
`GET /ecritures?entrepriseId={entrepriseId}&_embed=lignes`

- **Description** : Récupère les écritures comptables d'une entreprise avec leurs lignes associées.
- **Filtres avancés** (`GET /ecritures`) :
    - `journalId` : Filtrer par type de journal (Achats, Ventes, etc.).
    - `date_gte` : Date de début.
    - `date_lte` : Date de fin.
    - `valide=true` : Uniquement les écritures clôturées.
    - `_sort=date&_order=desc` : Tri chronologique.

### ➕ Créer une écriture
`POST /ecritures` puis `POST /lignes`

- **Processus** : 
    1. Création de l'en-tête de l'écriture (`POST /ecritures`).
    2. Création de chaque ligne de l'écriture (`POST /lignes`) rattachée par `ecritureId`.
- **Note** : Le service s'occupe de garantir l'intégrité (forkJoin).

### ✅ Valider une écriture
`PATCH /ecritures/{id}`

- **Body** : `{ "valide": true }`
- **Description** : Marque une écriture comme définitive (clôture).

---

## 📂 Plan Comptable OHADA

Référentiel des comptes.

### 📋 Liste des comptes
`GET /comptes?entrepriseId={entrepriseId}`

- **Description** : Récupère le plan comptable spécifique à une entreprise.
- **Structure d'un compte** :
    ```json
    {
      "id": "cpt-101",
      "entrepriseId": "ENT-001",
      "numero": "101",
      "intitule": "Capital social",
      "classe": 1,
      "type": "PASSIF"
    }
    ```

---

## 🔐 Authentification & Rôles

### 📋 Utilisateurs
`GET /users`

- **Rôles disponibles** :
    - `SUPER_ADMIN` : Accès total à tous les tenants.
    - `ADMIN` : Administrateur du cabinet (Tenant).
    - `COMPTABLE` : Gestion des écritures et rapports.
    - `CLIENT` : Consultation (Lecture seule).

---

## 📊 Statistiques & Rapports

L'API de mock est étendue par des calculs côté frontend dans les services :
- **Balance** : Agrégation des lignes par compte (`GET /comptes` + `GET /lignes`).
- **Bilan/Résultat** : Filtrage par classe OHADA (1-5 pour le Bilan, 6-8 pour le Résultat).

---

*Dernière mise à jour : 16 juin 2026*
