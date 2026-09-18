# Magic The Gathering – Gestion d'événements

Projet individuel DIL3 : une plateforme pour consulter et gérer des événements *Magic: The Gathering* (tournois, drafts, avant-premières…) organisés dans des boutiques, avec localisation sur une carte.

Le dépôt contient trois projets :

| Dossier | Rôle | Technologie principale |
|---|---|---|
| [`api/`](api/) | API REST (back-end) | Node.js · Express · TypeScript · SQL Server |
| [`magic-angular/`](magic-angular/) | Application web (front-end) | Angular 19 · Angular Material · Leaflet |
| [`magic_flutter/`](magic_flutter/) | Application mobile / multiplateforme | Flutter · Dart · Provider |

Les deux front-ends utilisent la même API.

```
┌────────────────┐      ┌────────────────┐
│ magic-angular  │      │ magic_flutter  │
│ (web)          │      │ (mobile/web)   │
└───────┬────────┘      └───────┬────────┘
        │   HTTP / JSON (JWT + CSRF)   │
        └──────────────┬───────────────┘
                ┌──────▼──────┐        ┌──────────────────┐
                │    api      │───────▶│ SQL Server       │
                │ (Express)   │        │ MagicTheGathering│
                └──────┬──────┘        └──────────────────┘
                       │
                ┌──────▼──────────────────┐
                │ OpenStreetMap Nominatim │ (géocodage)
                └─────────────────────────┘
```

---

## 1. `api/` – Back-end

API REST qui gère l'authentification, les événements, les formats de jeu, les boutiques et le géocodage des adresses.

### Technologies
- **Node.js** + **Express 5**, écrit en **TypeScript** (`ts-node`, `nodemon`)
- **SQL Server** via `mssql`
- Authentification **JWT** (access token + refresh token) avec `jsonwebtoken`, mots de passe hachés avec `bcrypt`
- Protection **CSRF** avec `csrf-csrf`
- Géocodage via **OpenStreetMap Nominatim** (`axios`)
- Configuration par variables d'environnement (`dotenv`)

### Principales routes

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/auth/login`, `/auth/refresh`, `/auth/logout` | Public |
| `GET` | `/events`, `/events/:id` | Public |
| `POST` / `PUT` / `DELETE` | `/events`, `/events/:id` | Protégé (JWT + CSRF) |
| `POST` | `/events/generate-events` | Protégé – génère des événements aléatoires |
| `GET` | `/formats`, `/formats/:id` | Public |
| `GET` | `/shops`, `/shops/:id` | Public |
| `GET` | `/geocoding/geocode`, `/geocoding/reverse-geocode` | Public |

Les images téléversées sont servies depuis `/uploads`.

---

## 2. `magic-angular/` – Application web

Interface web avec une partie publique (liste des événements, carte, détail d'un événement) et un espace d'administration protégé (tableau de bord, création et modification d'événements).

### Technologies
- **Angular 19** (composants standalone, lazy loading)
- **Angular Material** / CDK pour l'interface
- **Leaflet** pour la carte (tuiles OpenStreetMap)
- **jsPDF** pour l'export PDF
- **RxJS**
- Intercepteurs HTTP pour le JWT et le jeton CSRF, guard pour les routes `/admin`

### Pages
- `/` – accueil : liste et carte des événements
- `/events/:id` – détail d'un événement
- `/login` – connexion administrateur
- `/admin/dashboard`, `/admin/event-form`, `/admin/event-form/:id` – administration

---

## 3. `magic_flutter/` – Application Flutter

Application multiplateforme qui reprend les fonctionnalités principales : liste des événements, détail, connexion et création d'événements.

### Technologies
- **Flutter** / **Dart**
- **Provider** pour la gestion d'état
- `http` pour les appels à l'API
- `flutter_map` + `latlong` pour la carte, `geolocator` pour la géolocalisation
- `flutter_secure_storage` pour stocker les jetons
- `flutter_dotenv` pour la configuration
- `intl`, `url_launcher`, `universal_html`

Plateformes présentes dans le projet : Android, Web, Windows, macOS, Linux.

---

## Installation

### Prérequis
- [Node.js](https://nodejs.org/) (version LTS recommandée) et npm
- [Angular CLI](https://angular.dev/tools/cli) : `npm install -g @angular/cli`
- [Flutter SDK](https://docs.flutter.dev/get-started/install)
- **Microsoft SQL Server** avec une base `MagicTheGathering` (authentification SQL et TCP/IP activés, port 1433 par défaut)

### 1. Cloner le dépôt

```bash
git clone https://github.com/ProjetDIL3/Projet_Indiv_DIL3.git
cd Projet_Indiv_DIL3
```

### 2. Lancer l'API

```bash
cd api
npm install
cp .env.example .env   # puis compléter les valeurs
npm run dev            # ou : npm start
```

Variables à renseigner dans `api/.env` :

| Variable | Description |
|---|---|
| `PORT` | Port de l'API (par défaut `3000`) |
| `API_BASE_URL` | URL publique de l'API |
| `DB_USER`, `DB_PASSWORD` | Identifiants SQL Server |
| `DB_SERVER`, `DB_PORT`, `DB_NAME` | Serveur, port et nom de la base |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Secrets de signature des jetons |
| `JWT_EXPIRES_IN` | Durée de validité de l'access token (ex. `15m`) |
| `CSRF_SECRET` | Secret de la protection CSRF |

Pour générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

L'API est disponible sur `http://localhost:3000`.

### 3. Lancer l'application Angular

```bash
cd magic-angular
npm install
npm start
```

L'application est disponible sur `http://localhost:4200`. L'URL de l'API se configure dans `src/environments/environment.ts` (`apiUrl`).

### 4. Lancer l'application Flutter

```bash
cd magic_flutter
flutter pub get
flutter run            # ou par ex. : flutter run -d chrome
```

L'URL de l'API se configure dans `magic_flutter/.env` :

```
API_BASE_URL=http://localhost:3000
```

> Sur un émulateur Android, `localhost` désigne l'émulateur lui-même : utiliser `http://10.0.2.2:3000`.

---

## Auteur

Cecilia – Projet individuel DIL3
