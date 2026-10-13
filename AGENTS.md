# Guide pour les agents IA — AWZ-Rénovation

Ce fichier s'applique à tout le dépôt. Commencer ici, puis lire le guide correspondant à la tâche. Le code et les données de la branche courante restent la référence en cas de divergence documentaire.

## Comprendre le projet

Site vitrine français d'une entreprise de rénovation. « Ajouter un projet » signifie généralement **ajouter un chantier au portfolio des réalisations**, pas créer une nouvelle application.

Le site est statique : HTML et JSON sources, génération avec Node.js, CSS Tailwind compilée au build et JavaScript natif en modules pour les interactions. Aucun framework applicatif, base de données, CMS ou backend de contact. La publication porte uniquement sur `dist/`.

## Parcours de lecture

| Besoin                                                          | Lire                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| Ajouter, modifier ou retirer un chantier et ses photos          | [docs/ajouter-realisation.md](docs/ajouter-realisation.md) |
| Comprendre les fichiers, données, tokens, CSS et JavaScript     | [docs/architecture.md](docs/architecture.md)               |
| Modifier une ville, les coordonnées, une page ou le déploiement | [docs/maintenance.md](docs/maintenance.md)                 |
| Retrouver les commandes de démarrage                            | [README.md](README.md)                                     |

## Sources à modifier

| Demande                              | Source principale                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Nouveau chantier                     | `assets/images/realisations/projects.json` et un dossier `YYYY-MM-DD/` au même niveau  |
| Téléphone, adresse, e-mail, identité | `assets/config/artisan.json`                                                           |
| URL utilisée pour le SEO             | `assets/config/site.json`, propriété `siteUrl`                                         |
| Page locale                          | `assets/config/cities.json` et, pour la structure commune, `templates/pages/city.html` |
| Texte d'une page principale          | Le fichier `.html` correspondant à la racine                                           |
| Menu, footer ou bloc partagé         | `templates/partials/`                                                                  |
| Structure des cartes de réalisation  | `scripts/render-projects.mjs`                                                          |
| Styles des composants                | `assets/css/styles.css`                                                                |
| Interactions navigateur              | `assets/js/`                                                                           |

## Ajouter un chantier : parcours court

1. Lire le JSON existant et le [guide détaillé](docs/ajouter-realisation.md).
2. Identifier la date réelle et unique, une catégorie existante, les textes et les photos fournis. Ne pas inventer une date, une localisation, des travaux ou un avant/après absent des éléments fournis.
3. Créer `assets/images/realisations/YYYY-MM-DD/` et y placer de vraies images WebP : `avant.webp` + `apres.webp` ensemble, ou `1.webp`, `2.webp`, etc. Les photos numérotées peuvent compléter un comparateur.
4. Ajouter **une entrée** au tableau `projects.json` avec `date`, `category`, `label`, `title`, `description`, `points`. Ne pas remplacer les entrées existantes.
5. Formater le JSON, construire le site et contrôler le nouveau chantier, son filtre et les images dans l'aperçu. Le guide indique les commandes exactes.
6. Vérifier l'accueil : il choisit le **comparateur le plus récent**, pas nécessairement le chantier le plus récent si celui-ci n'a qu'une galerie. Les pages locales choisissent les trois derniers chantiers toutes catégories confondues.

Un ajout courant n'exige **aucun changement de HTML, CSS, JavaScript, sitemap ou template**.

## Conventions à préserver

- Travailler sur les sources, jamais dans `dist/`. Le build efface puis reconstruit ce dossier et ne modifie pas les sources.
- Conserver le design, les interactions, les URLs et les contenus existants sauf demande de modification. La vignette avant/après de l'accueil utilise toute la largeur intérieure de sa section sur desktop.
- Ne pas réintroduire Tailwind via CDN ou une génération des cartes dans le navigateur. `assets/js/projects.js` est un module d'interactions écrit à la main, **pas un fichier généré**.
- Dans les JSON, écrire du texte brut : `&`, pas `&amp;`. Le rendu échappe les contenus. Les fragments HTML et JSON-LD ont un traitement distinct décrit dans l'architecture.
- Conserver les IDs et attributs `data-*` utilisés par les modules JavaScript ; leur contrat est documenté.
- Le footer commun contient l'invitation « Vous souhaitez un site comme celui-ci ? Parlons de votre projet. », liée à `https://seignemorte.com`.
- Les pages Contact et Mentions légales ont des différences de composition volontaires. Ne pas les uniformiser pendant une simple modification de contenu.
- Ne pas committer `dist/`, `node_modules/`, les sorties de tests, ni des fichiers temporaires. Les photographies WebP des chantiers sont, elles, versionnées.
- Conserver les modifications utilisateur présentes dans le dépôt. Lire l'état Git avant toute modification et livrer sur la branche adaptée à la demande.

## Commandes et vérification

Depuis la racine du dépôt, avec Node.js 22 ou supérieur :

```bash
npm ci
npm run build
npm run preview
```

Aperçu : `http://127.0.0.1:4173`. Il n'y a pas de rechargement automatique : reconstruire après modification.

`npm run check` exécute le contrôle de formatage, les tests unitaires et le build. `npm run test:browser` exécute Playwright après installation de Chromium avec `npx playwright install chromium`.

Adapter les vérifications au changement : pour de la documentation seule, vérifier surtout les liens, les exemples et le formatage ; pour des images ou du contenu, contrôler le build et les pages concernées ; pour une interaction ou un template partagé, utiliser aussi les tests navigateur et vérifier desktop/mobile. Ne pas annoncer des vérifications non exécutées.

## Maintenir cette documentation

Si une modification change le contrat des données, le choix des réalisations, le build ou les sélecteurs JavaScript, mettre à jour le guide concerné dans le même changement. Les fichiers `package.json`, `scripts/` et les tests déterminent le comportement effectif.
