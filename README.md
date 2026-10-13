# AWZ-Rénovation

Site vitrine statique : HTML, CSS et JavaScript natif. Node.js sert uniquement à construire le site ; aucun serveur applicatif n'est nécessaire en production.

## Développement

Prérequis : Node.js 22 ou supérieur.

```bash
npm ci
npm run build
npm run preview
```

Ouvrir `http://127.0.0.1:4173`. Relancer le build après une modification.

Le seul dossier à publier est **`dist/`**. Le fichier `wrangler.jsonc` le référence pour Cloudflare ; le même dossier fonctionne sur un hébergement statique classique. Les pages source contiennent des tokens et ne doivent pas être publiées directement.

## Organisation

| Emplacement                                | Rôle                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `*.html`                                   | Contenu des cinq pages principales                                                        |
| `templates/pages/city.html`                | Template des pages locales                                                                |
| `templates/partials/`                      | Navigation, bandeau d'urgence, footer, CTA mobile, zone de contact et ressources communes |
| `assets/config/artisan.json`               | Identité et coordonnées de l'artisan                                                      |
| `assets/config/site.json`                  | URL du site et URL de production                                                          |
| `assets/config/cities.json`                | Contenu des dix pages locales                                                             |
| `assets/images/realisations/projects.json` | Description des réalisations                                                              |
| `assets/css/styles.css`                    | Styles des composants, organisés par fonction                                             |
| `assets/js/`                               | Navigation, comparateurs, filtres et visionneuse                                          |
| `scripts/`                                 | Validation, rendu HTML, compilation CSS et serveur de prévisualisation                    |
| `tests/`                                   | Tests du build et des interactions navigateur                                             |

## Coordonnées et environnement

Modifier uniquement `assets/config/artisan.json` pour changer le téléphone, l'e-mail, l'adresse, le SIRET ou le nom de l'artisan. Le build les injecte dans les pages, les liens `tel:`/`mailto:` et les données structurées JSON-LD.

`assets/config/site.json` contient :

- `siteUrl` : URL utilisée pour les canonical, Open Graph, JSON-LD, sitemap et robots.txt ;
- `productionUrl` : URL cible conservée comme référence.

Pour changer d'environnement, modifier `siteUrl` puis reconstruire le site.

La page Contact présente des coordonnées et des liens e-mail/téléphone. Il n'y a ni formulaire d'envoi, ni backend, ni clé API.

## Réalisations

**Un dossier daté et une entrée dans `projects.json` correspondent à une réalisation.**

1. Créer `assets/images/realisations/YYYY-MM-DD/`.
2. Ajouter les images WebP :
   - `avant.webp` et `apres.webp` ensemble pour un comparateur ;
   - `1.webp`, `2.webp`, etc. pour une galerie ou des photos supplémentaires.
3. Ajouter les métadonnées dans `assets/images/realisations/projects.json` :

```json
{
  "date": "2026-01-28",
  "category": "facades",
  "label": "Ravalement & façade",
  "title": "Ravalement d’une façade en pierre",
  "description": "Nettoyage et reprise d’une façade en pierre.",
  "points": ["Nettoyage de la façade", "Reprise des surfaces", "Finitions"]
}
```

4. Lancer `npm run build`.

Catégories acceptées : `maconnerie`, `interieur`, `pierre`, `facades`, `terrasses`, `finitions`.

Les dates doivent être réelles et uniques. Les images numérotées sont triées numériquement. Le build refuse les dossiers manquants, les comparateurs incomplets et les données invalides.

Les réalisations sont intégrées au HTML lors du build, dans l'ordre décroissant des dates. L'accueil présente le comparateur le plus récent, ou une galerie s'il n'y a aucun comparateur ; les pages locales présentent les trois derniers chantiers. Le portfolio vide est accepté.

Le navigateur ne télécharge plus de copie JSON de tous les projets et ne reconstruit plus les cartes. `assets/js/projects.js` contient maintenant uniquement les interactions des comparateurs et des filtres : **ce n'est plus un fichier généré**.

Pour supprimer une réalisation, supprimer son entrée et son dossier. Pour changer une photo, remplacer le fichier en conservant son nom, puis reconstruire.

## Pages locales et contenus

Ajouter une entrée dans `assets/config/cities.json` pour créer une page ville. Son nom `file` doit être unique, au format `nom-de-ville.html`. Le sitemap est généré automatiquement. Les contenus de configuration sont du texte brut : écrire `&`, pas `&amp;`.

Les textes des pages principales restent dans les fichiers HTML à la racine. Le menu, le footer et les autres blocs partagés se modifient dans `templates/partials/`.

Les photographies des villes restent hébergées via les URLs externes configurées. Les autres images sont locales. Les visuels et les crédits existants sont conservés.

## CSS et JavaScript

- Tailwind **3.4.17**, la même version que l'ancien CDN, est compilé au build. Les classes sont détectées dans le HTML final, y compris celles des cartes générées.
- Bootstrap Icons **1.11.3** et sa police sont servis localement. Seuls les sélecteurs d'icônes utilisés sont conservés ; la licence est copiée dans `dist/`.
- Les feuilles produites sont minifiées. Les styles de composants précèdent les utilitaires pour conserver la cascade existante.
- `assets/css/styles.css` ne contient plus les anciennes générations du comparateur, les styles de formulaire/upload.
- Le JavaScript est chargé en modules. La visionneuse est chargée uniquement sur la page Réalisations.
- Les photos de réalisations sont chargées à la demande. Les filtres masquent les cartes sans les recréer ni réinitialiser leurs curseurs.
- Le build ne modifie jamais les fichiers source et ne publie pas les JSON de configuration.

La page Mentions légales conserve volontairement sa feuille d'utilitaires seule, comme auparavant, pour préserver son rendu existant. Une harmonisation visuelle de cette page serait une modification distincte.

## Vérifications

```bash
npm run check
npx playwright install chromium
npm run test:browser
```

`npm run check` vérifie le formatage, exécute les tests unitaires et construit le site. Le build échoue si des tokens `{{...}}` restent non résolus ou si deux pages ont le même nom.

Les tests navigateur couvrent les quinze pages sur desktop/mobile, les liens locaux, les ressources, le menu, tous les filtres, les curseurs, la visionneuse au clavier et le contenu sans JavaScript. Les images des villes sont remplacées par un visuel neutre dans les tests pour ne pas dépendre du service externe.

`npm run format` applique le formatage. GitHub Actions exécute les vérifications sur chaque pull request et sur `main`.
