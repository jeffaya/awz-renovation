# AWZ-Rénovation

Site vitrine statique d'AWZ-Rénovation : services, réalisations, zones d'intervention et coordonnées. HTML, CSS et JavaScript natif ; Node.js intervient seulement lors de la construction. Aucun serveur applicatif n'est requis en production.

**Agent IA : commencer par [AGENTS.md](AGENTS.md).** Pour ajouter un chantier, suivre directement [Ajouter une réalisation](docs/ajouter-realisation.md).

## Documentation

| Guide                                                  | Contenu                                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [Guide agent](AGENTS.md)                               | Parcours de lecture, sources à modifier, conventions et vérifications               |
| [Architecture](docs/architecture.md)                   | Inventaire des fichiers, flux du build, données, tokens, CSS et contrats JavaScript |
| [Ajouter une réalisation](docs/ajouter-realisation.md) | Procédure pas à pas, exemples avec/sans avant-après, catégories et dépannage        |
| [Maintenance](docs/maintenance.md)                     | Pages, villes, coordonnées, images, tests, publication et limites connues           |

## Démarrage

Prérequis : Node.js 22 ou supérieur et npm. Exécuter depuis la racine du dépôt :

```bash
npm ci
npm run build
npm run preview
```

Ouvrir `http://127.0.0.1:4173`. Après chaque modification des sources, relancer le build puis actualiser la page. `npm run preview` ne reconstruit pas le site.

## Ajouter un chantier en bref

**Un dossier daté + une entrée dans le JSON = une réalisation.**

- Photos : `assets/images/realisations/YYYY-MM-DD/`, en WebP.
- Métadonnées : une nouvelle entrée dans `assets/images/realisations/projects.json`.
- Avant/après : `avant.webp` et `apres.webp` ensemble.
- Galerie : `1.webp`, `2.webp`, etc., seuls ou en complément de l'avant/après.
- Construire avec `npm run build` et contrôler la page Réalisations.

Le build alimente automatiquement l'accueil, le portfolio et les pages locales. Ne pas modifier les cartes HTML ou `assets/js/projects.js` pour ajouter un chantier. Les champs exacts et les règles de sélection sont dans le [guide détaillé](docs/ajouter-realisation.md).

## Commandes

| Commande               | Effet                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `npm ci`               | Installer les dépendances verrouillées dans `package-lock.json`, outils de build compris |
| `npm run build`        | Valider les données et reconstruire `dist/`                                              |
| `npm run preview`      | Servir le dossier `dist/` existant sur le port 4173                                      |
| `npm test`             | Exécuter les tests unitaires Node.js                                                     |
| `npm run format`       | Formater les fichiers source et la documentation avec Prettier                           |
| `npm run format:check` | Vérifier le formatage sans modifier les fichiers                                         |
| `npm run check`        | Vérifier le formatage, exécuter les tests unitaires et construire le site                |
| `npm run test:browser` | Exécuter les tests Playwright desktop/mobile ; Chromium doit être installé               |

Installation du navigateur de test :

```bash
npx playwright install chromium
```

Les vérifications GitHub Actions sont décrites dans [Maintenance](docs/maintenance.md).

## Publication

**Seul `dist/` est à publier.** `wrangler.jsonc` référence déjà `./dist` pour Cloudflare. La commande de build est `npm run build` ; le dossier peut également être servi sur un hébergement statique classique.

Les URLs SEO proviennent de `assets/config/site.json` → `siteUrl`. `productionUrl` est une valeur de référence, pas un commutateur automatique. Les détails et la distinction entre vérification CI et déploiement sont dans le [guide de maintenance](docs/maintenance.md).
