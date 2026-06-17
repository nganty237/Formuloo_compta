# ARCHITECTURE DECISION RECORDS (ADR)
**Projet:** Formuloo Compta - Frontend Angular | Sprint 3

Ce document centralise les décisions technologiques majeures qui structurent l'application Formuloo Compta. Chaque décision est justifiée par son contexte, ses avantages et ses conséquences à long terme.

---

### ADR-001: Choix du Pattern State Management
**NgRx vs Services RxJS**

**CONTEXTE**  
L'application présente des niveaux de complexité variables. Certains modules sont de simples CRUD, tandis que d'autres, comme la **Comptabilité**, exigent une réactivité forte, des calculs complexes en temps réel (Balance, Grand Livre) et une synchronisation stricte des données entre plusieurs composants.

**DÉCISION**  
Utilisation de **RxJS + Services** pour la majorité des modules pour sa rapidité d'implémentation. Introduction de **NgRx** spécifiquement pour le module de comptabilité afin de gérer l'état complexe de manière prévisible.

**CONSÉQUENCES & JUSTIFICATION**  
Compte tenu des contraintes de temps et du contexte de stage, une approche basée sur RxJS est retenue pour sa courbe d'apprentissage rapide. NgRx est utilisé sur les modules critiques pour préparer une évolution vers une gestion d'état centralisée, robuste et scalable, indispensable pour un ERP financier respectant les normes OHADA.

---

### ADR-002: Approche Multi-tenant côté Frontend
**Isolation des données | Routing**

**CONTEXTE**  
Un cabinet comptable gère plusieurs entreprises clientes. L'interface doit garantir l'isolation stricte des données et éviter toute "fuite" inter-tenant lors de la navigation, tout en permettant un accès rapide via URL pour le partage de liens.

**DÉCISION**  
Utilisation d'un **routing hiérarchique explicite** (`/tenant/:id/...`) couplé à un service d'état (`TenantContextService`), des **Intercepteurs** et des **Guards Angular**.

**AVANTAGES**  
Le contexte est verrouillé dès l'URL, permettant le deep linking. Les Guards bloquent l'accès aux routes avant le chargement des données si les droits sont insuffisants. Le `tenantInterceptor` injecte automatiquement les headers `X-Tenant-Id` et `X-Company-Id`, garantissant que le backend ne renvoie que les données autorisées.

---

### ADR-003: Gestion de l'Authentification
**sessionStorage vs localStorage**

**CONTEXTE**  
Le stockage du token JWT doit équilibrer sécurité et expérience utilisateur. Suite à un audit de sécurité, le choix initial du localStorage a été remis en question pour limiter les risques de persistance indésirable.

**DÉCISION**  
Stockage du JWT et des informations utilisateur dans le **sessionStorage**.

**CHOIX APPROPRIÉ**  
Le `sessionStorage` garantit un nettoyage automatique des données sensibles dès la fermeture de l'onglet ou de la fenêtre, ce qui est crucial pour des postes de travail partagés en cabinet comptable. Bien que cela limite la persistance entre les sessions, la sécurité des données financières prime sur le confort de reconnexion automatique.

---

### ADR-004: HTTP Client & Interceptors
**Gestion erreurs | Tokens | Tenant Context**

**CONTEXTE**  
Chaque requête API doit inclure les informations de sécurité et le contexte du tenant sans polluer le code des services métiers individuels.

**DÉCISION**  
Implémentation d'une **chaîne d'Intercepteurs fonctionnels** (`authInterceptor`, `tenantInterceptor`).

**CONSÉQUENCES**  
Centralisation absolue de la logique réseau. Les intercepteurs gèrent l'ajout dynamique des headers de sécurité et de contexte. Les services métiers (ex: `JournalService`) restent "purs", ne se préoccupant que de la logique de données et non de la plomberie technique.

---

### ADR-005: Organisation des Modules
**Feature-based vs Layer-based**

**CONTEXTE**  
L'application comprend de nombreux domaines métiers (Comptabilité, Facturation, Dashboard, Admin). La structure doit éviter la dette technique et optimiser les performances au chargement.

**DÉCISION**  
Architecture orientée **Feature-based** (par domaine métier) utilisant les **Standalone Components** d'Angular 21.

**AVANTAGES**  
L'encapsulation est totale : le code de la facturation ne croise pas celui de la comptabilité. Cette structure facilite le travail en équipe et permet une implémentation native du **Lazy Loading** au niveau des routes, garantissant que l'utilisateur ne charge que le code dont il a besoin.

---

### ADR-006: Stratégie de gestion des Formulaires
**Reactive vs Template-driven**

**CONTEXTE**  
La saisie comptable (Écritures) et la facturation impliquent des formulaires dynamiques complexes avec des lignes multiples (`FormArray`), des validations croisées et des calculs en temps réel.

**DÉCISION**  
Utilisation exclusive des **Reactive Forms**.

**CHOIX APPROPRIÉ**  
Les Reactive Forms déplacent la logique complexe du HTML vers le TypeScript. Ils permettent une manipulation programmatique précise et facilitent l'écriture de tests unitaires robustes sur la validation métier (ex: vérification de l'équilibre débit/crédit avant soumission).

---

### ADR-007: Adoption d'Angular 21 & Signals
**Performance & Réactivité Moderne**

**CONTEXTE**  
Formuloo Compta doit être une application fluide et réactive. Les mécanismes classiques de détection de changement d'Angular peuvent devenir coûteux sur de gros tableaux de données.

**DÉCISION**  
Utilisation d'**Angular 21** et adoption des **Signals** pour la gestion de la réactivité locale.

**AVANTAGES**  
Les Signals offrent une détection de changement plus fine (fine-grained reactivity), améliorant les performances globales. Ils simplifient également le code en réduisant la dépendance complexe à RxJS pour des états simples, rendant le code plus lisible et facile à maintenir pour les futurs stagiaires.

---

### ADR-008: Design System avec Tailwind CSS 4
**Productivité UI | Maintenance**

**CONTEXTE**  
Le projet nécessite une interface professionnelle, cohérente et rapide à construire sans s'encombrer de feuilles de styles CSS complexes à maintenir.

**DÉCISION**  
Utilisation de **Tailwind CSS 4** comme moteur de styles principal.

**AVANTAGES**  
Tailwind permet un design "utility-first" qui accélère radicalement le développement de l'interface. La version 4 apporte des performances accrues et une meilleure intégration avec les variables CSS modernes, facilitant l'évolution du thème visuel de Formuloo Compta.

---
**Document généré pour Formuloo Compta - ADR Complet - 16 Juin 2026**
