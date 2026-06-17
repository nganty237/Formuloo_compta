# Architecture Technique - Formuloo Compta 🏗️

Ce document présente l'architecture détaillée du projet **Formuloo Compta**, une application SaaS de gestion comptable conforme aux normes OHADA. Il définit une organisation Angular claire, modulaire et évolutive.

---

## 1. Vue d'Ensemble de l'Arborescence 📂

Inspirée des standards de l'industrie, la structure sépare strictement les responsabilités :

```text
src/app/
├── core/                # LE MOTEUR : Logique transversale (Singletons)
│   ├── services/        # Services globaux (Auth, TenantContext, API)
│   ├── guards/          # Vigiles (AuthGuard, RoleGuard, TenantGuard)
│   ├── interceptors/    # Douaniers (Auth, Tenant, Error Handling)
│   └── models/          # Définitions de types globaux (OHADA, User)
├── features/            # LES MÉTIERS : Domaines isolés (Lazy-loaded)
│   ├── auth/            # Connexion, Inscription, Sélection de rôle
│   ├── accounting/      # Comptabilité (Journal, Grand Livre, Balance)
│   │   └── store/       # État centralisé NgRx (Actions, Reducers, Effects)
│   ├── dashboard/       # KPIs et graphiques de performance
│   └── reports/         # États financiers (Bilan, Compte de Résultat)
├── shared/              # LA BOÎTE À OUTILS : Composants agnostiques
│   ├── components/      # UI Pure (Table, Button, Modal, Spinner)
│   ├── directives/      # Comportements réutilisables (HasRole)
│   └── icons/           # Bibliothèque LucideIcons centralisée
└── layout/              # LA STRUCTURE : Conteneurs de pages
    ├── main-layout/     # Sidebar, Header, Content
    └── auth-layout/     # Mise en page épurée pour la connexion
```

---

## 2. Les Couches Techniques (Analogie de la Maison) 🏠

### A. Le Dossier `Core` (Le Système Nerveux)
C'est ici que bat le cœur de l'application. Il contient tout ce qui doit être chargé **une seule fois** :
*   **Services de Contexte** : Gèrent qui est connecté et quel cabinet (Tenant) est sélectionné.
*   **Intercepteurs** : Ils surveillent chaque appel réseau pour y ajouter automatiquement le Token de sécurité ou l'ID du cabinet actuel (`X-Tenant-Id`).
*   **Gardes** : Ils empêchent l'accès aux pages si l'utilisateur n'a pas le bon rôle (ex: un Client ne peut pas accéder à la console Admin).

### B. Le Dossier `Features` (Les Pièces de Vie)
Chaque dossier dans `features` est un module métier indépendant :
*   **Isolément** : Les fonctionnalités sont "Lazy-loaded", ce qui signifie qu'elles ne sont chargées par le navigateur que lorsque l'utilisateur clique dessus (gain de performance).
*   **Gestion d'État (NgRx)** : Le module `accounting` possède son propre magasin de données (`store`). Cela permet de manipuler des milliers d'écritures comptables de manière fluide et sécurisée.

### C. Le Dossier `Shared` (Le Mobilier)
Contient les composants "muets" :
*   Ils ne connaissent pas le métier (ils ne savent pas ce qu'est un compte OHADA).
*   Ils reçoivent des données et les affichent (ex: un composant `Table` qui peut aussi bien afficher des factures que des utilisateurs).

---

## 3. Flux de Données & Réactivité 🌊

L'architecture utilise une approche **hybride** pour une performance optimale :

1.  **NgRx (Global)** : Utilisé pour les données lourdes et partagées (Comptabilité). Il assure que le Journal et le Bilan voient toujours la même version de la vérité.
2.  **RxJS (Flux Asynchrones)** : Utilisé pour les appels API et la communication entre services. C'est le "tuyau" qui transporte les informations.
3.  **Signals (Réactivité Locale)** : Utilisé pour l'interface utilisateur. Angular Signals permet de mettre à jour l'écran de manière instantanée et précise sans recalculer toute la page.

---

## 4. Sécurité Multi-Tenant 🔐

L'architecture garantit l'isolation des données par deux mécanismes :
1.  **Isolation au niveau du Transport** : Le `tenantInterceptor` injecte systématiquement l'ID du cabinet dans les headers HTTP.
2.  **Isolation au niveau de l'Affichage** : Le `TenantGuard` vérifie que l'utilisateur a bien le droit d'accéder au cabinet demandé dans l'URL (`/tenant/123/...`).

---

*Dernière mise à jour : 16 juin 2026 - Version Master 1*
