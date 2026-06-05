# Documentation de Conformité RGPD - Formuloo Compta

## 1. Introduction
Ce document détaille les mesures techniques et organisationnelles mises en œuvre dans l'application Formuloo Compta pour garantir la protection des données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).

## 2. Principes Fondamentaux

### 2.1 Limitation de la Finalité
Les données collectées (nom, email, rôle, données comptables) sont exclusivement utilisées pour la fourniture du service de gestion comptable et fiscale.

### 2.2 Minimisation des Données
L'application ne collecte que les informations strictement nécessaires à la tenue de la comptabilité OHADA et à la gestion des accès utilisateurs.

## 3. Mesures Techniques de Protection

### 3.1 Étancheité des Données (Multi-Tenancy)
Chaque entreprise appartient à un **Tenant** unique. Le système de "Guards" au niveau du routeur Angular (`tenantGuard`) bloque toute tentative d'accès croisé. Un utilisateur du Tenant A ne peut, en aucun cas, visualiser les écritures comptables du Tenant B.

### 3.2 Sécurité de la Session
- **Chiffrement :** Toutes les communications transitent via HTTPS (TLS 1.2+).
- **Stockage Volatil :** Les informations d'identité sont stockées en `sessionStorage`, garantissant leur suppression automatique à la fin de la session de navigation.
- **Tokens :** Utilisation de JWT (JSON Web Tokens) pour une authentification sécurisée et sans état côté serveur.

### 3.3 Intégrité du Code
Le code est audité pour prévenir les failles XSS, CSRF et les injections SQL (via l'utilisation d'ORM et de requêtes paramétrées côté backend).

## 4. Droits des Utilisateurs

L'architecture permet de répondre aux demandes d'exercice de droits :
- **Droit d'accès et de rectification :** Possible via le profil utilisateur et les interfaces de gestion des entreprises.
- **Droit à l'effacement :** Une procédure de suppression de compte entraîne la suppression en cascade des données associées (sous réserve des obligations légales de conservation des documents comptables de 10 ans).
- **Portabilité :** Les données comptables peuvent être exportées au format standard pour transfert.

## 5. Registre des Traitements
Un registre interne des activités de traitement est maintenu, listant les catégories de données, les destinataires et les durées de conservation.
