#  Gestion de Stock Interne

Système de gestion de stock interne construit avec Laravel 12+ et ReactJS.

## Fonctionnalités

* Gestion des utilisateurs (Admin, Magasinier)
* Gestion des produits (CRUD)
* Gestion des fournisseurs (pour les entrées)
* Gestion des départements (pour les sorties)
* Enregistrement des mouvements de stock (entrée / sortie)
* Historique des mouvements avec filtres
* Calcul automatique du stock
* Alertes de seuil minimum (low stock)
* Tableau de bord avec statistiques simples

## Prérequis

* PHP 8.2+
* Node.js & NPM
* MySQL

## Installation

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## Identifiants de test

* **Admin**: [admin@stock.com] / password
* **Magasinier**: [magasinier@stock.com] / password
* **Suppulier**:[supplier@global.com] / password

## Règles métier

* Quantité des mouvements > 0
* Interdiction de stock négatif
* Les entrées sont liées aux fournisseurs
* Les sorties sont liées aux départements
* Les mouvements ne sont pas supprimés (traçabilité)

## API (exemples)

* POST /api/login
* GET /api/products
* POST /api/stock-movements
* GET /api/departments
* GET /api/alerts/low-stock

