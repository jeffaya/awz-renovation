# Architecture de l'application

[Accueil documentation](../README.md) · [Guide agent](../AGENTS.md) · [Ajouter une réalisation](ajouter-realisation.md) · [Maintenance](maintenance.md)

## 1. Modèle d'exécution

L'application est un site statique multipage en français. Les fichiers HTML source contiennent des tokens `{{NOM_DU_TOKEN}}`. Un build Node.js assemble ces pages avec les JSON et les partials, rend les réalisations, compile la CSS puis écrit le résultat dans `dist/`.

Le navigateur reçoit du HTML déjà rempli. Le JavaScript ajoute uniquement les interactions : menu mobile, comparateurs, filtres et visionneuse. Il ne charge pas `projects.json` et ne reconstruit pas les cartes. Aucun routeur client, framework applicatif, base de données, API de contact, authentification ou CMS n'est présent.

Les liens de devis ouvrent le logiciel e-mail du visiteur avec `mailto:`. Les numéros de téléphone utilisent `tel:`.

## 2. Carte du dépôt

| Chemin                                     | Responsabilité                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `index.html`                               | Accueil : présentation, avis, services, réalisation mise en avant, artisan et contact |
| `realisations.html`                        | Filtres, emplacement des réalisations et structure de la visionneuse                  |
| `contact.html`                             | Coordonnées et zone d'intervention ; aucun formulaire                                 |
| `zones-intervention.html`                  | Présentation des zones, carte illustrée et liens vers les villes                      |
| `mentions-legales.html`                    | Mentions légales et crédits photographiques                                           |
| `assets/config/artisan.json`               | Coordonnées et identité utilisées par les tokens et le JSON-LD                        |
| `assets/config/site.json`                  | `siteUrl` et `productionUrl`                                                          |
| `assets/config/cities.json`                | Contenu et noms de fichiers des pages locales                                         |
| `assets/images/realisations/projects.json` | Liste éditoriale des chantiers                                                        |
| `assets/images/realisations/YYYY-MM-DD/`   | Photos d'un chantier                                                                  |
| `assets/images/brand/`                     | Logo, favicon et images de partage social                                             |
| `assets/images/services/`                  | Images illustrant les services sur l'accueil                                          |
| `assets/images/site/`                      | Image d'accueil, portrait de l'artisan et carte des zones                             |
| `assets/css/styles.css`                    | CSS source des composants ; n'inclut pas les utilitaires générés                      |
| `assets/js/`                               | Modules navigateur maintenus à la main                                                |
| `templates/pages/city.html`                | Template unique des pages locales                                                     |
| `templates/partials/`                      | Fragments partagés, détaillés ci-dessous                                              |
| `scripts/`                                 | Build, validations, rendu et serveur local                                            |
| `tests/`                                   | Tests unitaires et navigateur                                                         |
| `package.json`, `package-lock.json`        | Commandes, version de Node et dépendances verrouillées                                |
| `.prettierrc.json`, `.prettierignore`      | Formatage ; espaces HTML préservés avec le mode `strict`                              |
| `playwright.config.mjs`                    | Serveur et configurations desktop/mobile des tests                                    |
| `.github/workflows/ci.yml`                 | Vérifications à chaque PR et push sur `main`                                          |
| `wrangler.jsonc`                           | Configuration des assets Cloudflare, dossier `./dist`                                 |
| `.gitignore`                               | Exclut les sorties de build/tests, dépendances et fichiers d'environnement            |
| `AGENTS.md`, `docs/`                       | Instructions de travail et documentation du dépôt                                     |

### Partials

| Fichier dans `templates/partials/` | Token                   | Utilisation                                                                 |
| ---------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `assets.html`                      | `PARTIAL_ASSETS`        | Charge `styles.css`, puis `utilities.css`, puis `app.js` en module          |
| `emergency-bar.html`               | `PARTIAL_EMERGENCY_BAR` | Bandeau supérieur d'intervention rapide                                     |
| `header.html`                      | `PARTIAL_HEADER`        | Logo, navigation desktop/mobile et bouton devis                             |
| `footer.html`                      | `PARTIAL_FOOTER`        | Navigation, zones, coordonnées, mentions et invitation vers seignemorte.com |
| `mobile-cta.html`                  | `PARTIAL_MOBILE_CTA`    | Actions fixes Appeler / Devis sur mobile                                    |
| `zones.html`                       | `PARTIAL_ZONES`         | Section commune de proximité et de contact                                  |

La liste des partials est explicite dans `scripts/pages.mjs` : créer un nouveau fichier ne suffit pas à l'enregistrer. La composition reste choisie dans chaque page. Contact n'inclut ni bandeau d'urgence ni CTA mobile fixe ; Zones n'inclut pas le CTA mobile fixe. Mentions légales charge uniquement les utilitaires et `app.js`, sans la CSS des composants ni les icônes. Ces différences sont existantes, pas des erreurs à corriger automatiquement.

## 3. Build : entrées, étapes et sorties

Exécuter les commandes depuis la racine : les chemins des scripts sont relatifs au répertoire courant.

| Étape                     | Module                        | Travail effectué                                                                                            |
| ------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Configuration             | `scripts/config.mjs`          | Lit les trois JSON de configuration, valide l'identité, l'URL et les villes ; prépare tokens et `mailto`    |
| Portfolio                 | `scripts/projects.mjs`        | `buildProjects()` lit les métadonnées, valide les dates/catégories/photos et trie les projets               |
| Fragments de réalisations | `scripts/render-projects.mjs` | Génère le HTML de l'accueil, du portfolio et des trois suggestions locales                                  |
| Assemblage                | `scripts/pages.mjs`           | Résout les partials et construit les pages locales avec le template commun                                  |
| Contrôle du HTML          | `scripts/html.mjs`            | `assertResolved()` refuse les tokens majuscules non remplacés                                               |
| Écriture                  | `scripts/build.mjs`           | Découvre les `.html` à la racine, refuse les collisions avec les villes, recrée `dist/` et copie les assets |
| Styles                    | `scripts/styles.mjs`          | Compile Tailwind depuis le HTML final, sélectionne les icônes et minifie les deux feuilles CSS              |
| Indexation                | `scripts/build.mjs`           | Écrit `sitemap.xml` et `robots.txt` depuis les pages et `siteUrl`                                           |

Les pages sont préparées et leurs tokens vérifiés avant l'effacement de `dist/`. Une erreur ultérieure de copie ou de compilation peut néanmoins laisser une sortie partielle : ne publier qu'un build terminé avec succès.

Le build écrit uniquement dans `dist/`. Il ne génère plus `assets/js/projects.js` dans les sources.

### Contenu publié

| Sortie                                        | Origine                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `dist/*.html`                                 | Pages principales et pages villes assemblées                                                     |
| `dist/assets/images/`                         | Copie de **tous** les fichiers sous `assets/images/`, sauf ceux dont le chemin finit par `.json` |
| `dist/assets/js/`                             | Copie des modules source, sans bundling ni minification JS                                       |
| `dist/assets/css/styles.css`                  | CSS des icônes utilisées puis CSS des composants, minifiées ensemble                             |
| `dist/assets/css/utilities.css`               | Base, composants et utilitaires Tailwind générés depuis le HTML final                            |
| `dist/assets/css/fonts/`                      | Police Bootstrap Icons du package installé                                                       |
| `dist/assets/css/bootstrap-icons-LICENSE.txt` | Licence des icônes                                                                               |
| `dist/sitemap.xml`, `dist/robots.txt`         | Fichiers SEO générés                                                                             |

Les JSON de configuration, les templates, les scripts Node, les tests et la documentation ne sont pas copiés. Un dossier photo non référencé dans `projects.json` n'apparaît pas dans le portfolio, mais ses fichiers sont tout de même copiés. Ne pas déposer d'originaux inutilisés ou de brouillons dans `assets/images/` en pensant qu'ils seront exclus.

## 4. Contrats des données

### Artisan et site

Tous les champs suivants d'`artisan.json` sont des chaînes non vides : `name`, `phone`, `phoneHref`, `email`, `address`, `postalCode`, `city`, `siret`, `artisanFirstName`, `artisanLastName`, `artisanFullName`.

`phone` est le texte affiché ; `phoneHref` est la valeur du lien `tel:` sans le préfixe. `artisanFullName` est un champ explicite : il n'est pas recalculé à partir du prénom et du nom. L'objet du lien de devis est dérivé du nom de l'entreprise.

`site.siteUrl` doit être une URL HTTP(S), sans identifiants, paramètres ni fragment. Le slash final est retiré. `productionUrl` est conservé dans les données mais n'est pas utilisé par le build pour choisir l'environnement.

Les coordonnées injectées et le JSON-LD sont centralisés. Certains textes éditoriaux, libellés de marque et villes affichées restent écrits dans les pages/partials : un changement de marque ou de périmètre nécessite de les rechercher aussi.

### Villes

| Champ                   | Type et usage                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `file`                  | Chaîne unique correspondant à `^[a-z0-9-]+\.html$`, sans collision avec une page principale |
| `city`                  | Nom de la ville, utilisé notamment dans `areaServed` du JSON-LD                             |
| `title`, `description`  | Métadonnées de la page                                                                      |
| `heroImage`, `heroAlt`  | URL/chemin de la photographie et texte alternatif                                           |
| `heroTitle`, `heroCopy` | Titre et texte d'introduction visibles                                                      |
| `localTitle`            | Titre de la section locale                                                                  |
| `localParagraphs`       | Tableau de chaînes ; premier paragraphe en `mt-6`, suivants en `mt-4`                       |
| `slug`                  | Présent dans les données actuelles mais non consommé par le rendu ; `file` détermine l'URL  |

Tous les champs chaîne du tableau sauf `slug` sont obligatoires et non vides. `localParagraphs` doit être un tableau ; le code accepte un tableau vide. Les listes de liens vers les villes ne sont pas générées depuis ce JSON : voir [Maintenance](maintenance.md).

### Réalisations : source et forme interne

Le [guide d'ajout](ajouter-realisation.md) décrit le JSON source. `buildProjects()` le transforme ainsi :

| Champ source                               | Champ rendu / valeur dérivée                      |
| ------------------------------------------ | ------------------------------------------------- |
| `date`                                     | `id` et `date`, puis tri décroissant              |
| `category`                                 | `cat`, utilisé par `data-category` et les filtres |
| `description`                              | `copy`, texte des cartes                          |
| `label`, `title`, `points`                 | Conservés                                         |
| Paire `avant.webp` / `apres.webp` présente | `mode: "compare"`, `before`, `after`, `gallery`   |
| Photos numérotées sans paire               | `mode: "gallery"`, `images`                       |

`mode`, `id`, `cat`, `copy`, les chemins et les tableaux d'images sont calculés ; ne pas les saisir dans le JSON éditorial.

### Règles de sélection et rendu

| Emplacement  | Choix des réalisations                                                             | Affichage                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Accueil      | Premier projet avec `mode === "compare"` dans la liste triée, sinon premier projet | Vignette pleine largeur du conteneur et lien vers Réalisations ; pas de galerie supplémentaire sur l'accueil |
| Réalisations | Tous les projets triés                                                             | Avant/après ou galerie, photos supplémentaires, textes, points et lien devis                                 |
| Pages villes | `projects.slice(0, 3)`                                                             | Trois cartes ; image après pour un comparateur, première image sinon                                         |

Une galerie avec une seule image l'affiche en grand ; à partir de deux images, les deux premières sont côte à côte et les suivantes deviennent des vignettes supplémentaires sur la page Réalisations. Les comparateurs utilisent la paire principale et toutes les images numérotées en complément. Les petits pictogrammes des points sont déduits des mots du texte par `emojiFor()`.

Un portfolio vide est accepté par les fonctions de rendu, mais les titres/sections demeurent et les tests navigateur actuels supposent la présence d'au moins un chantier avec comparateur. Il n'existe pas de statut brouillon, de date de publication ni de filtrage des dates futures.

## 5. Tokens et échappement

Les tokens reconnus utilisent des lettres majuscules et underscores : `{{ARTISAN_NAME}}`, `{{PARTIAL_HEADER}}`, etc.

| Groupe                     | Exemples / emplacement                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Coordonnées                | `ARTISAN_NAME`, `ARTISAN_PHONE`, `ARTISAN_EMAIL`, `ARTISAN_FULL_ADDRESS`, `ARTISAN_MAILTO` dans `config.mjs` |
| Adresse avec saut de ligne | `ARTISAN_ADDRESS_HTML`, fragment construit et échappé dans `config.mjs`                                      |
| URL                        | `SITE_URL` pour les métadonnées                                                                              |
| Fragments communs          | `PARTIAL_*`, résolus dans `pages.mjs`                                                                        |
| Réalisations               | `HOME_PROJECT`, `FEATURED_PROJECTS`, `CITY_PROJECTS`, préparés dans `build.mjs`                              |
| Page locale                | `CITY_TITLE`, `CITY_DESCRIPTION`, `CITY_CANONICAL`, `CITY_HERO_*`, `CITY_LOCAL_*` dans `pages.mjs`           |
| Données structurées        | `HOME_SCHEMA`, `BUSINESS_SCHEMA`, insérés dans des scripts `application/ld+json`                             |

`replaceTokens()` effectue un remplacement en une passe. Les partials ont leurs tokens de coordonnées résolus à leur chargement avant leur insertion. Il n'y a pas de moteur de template récursif, de boucle ou de condition dans les HTML.

Les valeurs éditoriales sont échappées avec `escapeHtml()`. Les valeurs supplémentaires passées au remplacement peuvent être du HTML déjà rendu : les préparer explicitement et ne pas y injecter du texte brut non échappé. `businessSchema()` utilise `JSON.stringify()` et neutralise `<` pour produire du JSON-LD valide. Ne pas réutiliser un token HTML échappé comme valeur JSON.

`assertResolved()` détecte les tokens conformes à la syntaxe majuscule restés dans le HTML ; les erreurs de syntaxe d'autres formes ne sont pas garanties d'être détectées.

## 6. CSS

Les dépendances exactes sont verrouillées dans `package-lock.json`. Tailwind reste en version 3.4.17 et Bootstrap Icons en 1.11.3 pour conserver le rendu.

`styles.mjs` passe **le HTML rendu** à Tailwind : les classes des projets et des pages locales sont donc connues au moment de la compilation. Les classes ajoutées exclusivement en JavaScript ne sont pas découvertes automatiquement. Pour une nouvelle classe dynamique, la rendre visible au build ou définir la règle dans la CSS source.

Les icônes sont sélectionnées de la même manière à partir des noms `bi-*` présents dans le HTML. La police entière est copiée ; elle n'est pas réduite à quelques glyphes.

L'ordre de chargement est intentionnel : `styles.css`, puis `utilities.css`. Changer cet ordre peut modifier la cascade. Les couleurs personnalisées `awz`, `sand` et `stone2` sont définies dans `styles.mjs`, pas dans un `tailwind.config.js` séparé.

La CSS source est organisée par composants : base/navigation, avis, liens et boutons, projets, actions mobiles, témoignages, villes, zones, comparateurs, visionneuse et carte. Les breakpoints CSS des composants ne coïncident pas tous avec les breakpoints Tailwind ; préserver les deux lors d'une modification responsive.

Les comparateurs accueil et portfolio partagent le comportement mais ont des styles distincts (`home-*` et `.comparison`). Leurs images remplissent leur cadre avec `object-fit: cover`. Un recadrage à l'affichage ne signifie pas que le fichier photo a été modifié.

## 7. JavaScript et contrat DOM

`app.js` est chargé en module, donc après analyse du document. Il initialise navigation, comparateurs et filtres, met à jour `#year`, puis importe `lightbox.js` seulement si `#awz-lightbox` existe.

| Module                       | Sélecteurs à préserver                                                                             | Comportement                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation.js`              | `#menu-btn`, `#mobile-menu`, classes `hidden`, `no-scroll`                                         | Ouverture/fermeture, `aria-expanded`, fermeture sur lien, Échap et passage à 1024 px                                                    |
| `projects.js` — comparateurs | `[data-comparison]`, `input[type="range"]`, `[data-comparison-before]`, `[data-comparison-handle]` | Ajuste `clip-path` et position du curseur ; empêche la navigation de la vignette lors d'un clic sur le slider                           |
| `projects.js` — filtres      | `#project-filters [data-filter]`, `#featured-projects [data-category]`, `#projects-empty`          | Compare la catégorie, bascule `hidden`, `filter-active` et `aria-pressed`, conserve les nœuds et les curseurs                           |
| `lightbox.js`                | `img.awz-zoomable`, `#awz-lightbox`, `#awz-lightbox-image`, `#awz-lightbox-close`                  | Agrandissement, clic/Entrée/Espace, focus sur Fermer, fermeture par Échap ou fond, arrière-plan `inert` et restauration du focus/scroll |
| `app.js`                     | `#year`                                                                                            | Année courante du navigateur dans le footer                                                                                             |

Les initialisations tolèrent l'absence du composant sur une page. Ne pas les appeler plusieurs fois sur les mêmes éléments : elles ajoutent des écouteurs. La visionneuse équipe les images présentes au moment de son initialisation ; les filtres actuels ne remplacent pas ces éléments.

Sans JavaScript, les textes, liens et réalisations sont présents. Les filtres, le déplacement des comparateurs, le menu mobile et la visionneuse ont besoin du JavaScript ; il n'y a pas de promesse de parité complète sans scripts.

## 8. Dépendances externes et SEO

Les styles, scripts, polices et photos de chantiers sont locaux après build. Les images des villes utilisent actuellement des URLs Wikimedia via `wsrv.nl`, selon la configuration et la page Zones. Les liens vers les avis, la carte Google et le site du créateur sont externes.

Les canonical, Open Graph, JSON-LD, sitemap et robots utilisent `siteUrl`. Les métadonnées propres à chaque page principale restent dans leur HTML ; celles des villes viennent du JSON. La liste `areaServed` du JSON-LD vient de `cities.json`, mais les textes de couverture visibles sont éditoriaux.

Pour les opérations courantes, la validation et la publication, continuer dans [Maintenance](maintenance.md).
