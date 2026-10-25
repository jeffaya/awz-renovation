# Maintenance et publication

[Accueil documentation](../README.md) · [Guide agent](../AGENTS.md) · [Architecture](architecture.md) · [Ajouter une réalisation](ajouter-realisation.md)

## 1. Préparer le travail

Lire `AGENTS.md`, vérifier la branche et les modifications existantes avec `git status`, puis travailler sur les sources concernées. Les commandes Node doivent être exécutées depuis la racine du dépôt.

```bash
npm ci
npm run build
npm run preview
```

Node.js 22 ou supérieur est requis. Les outils de compilation sont des dépendances de développement : ils doivent être installés pour construire le site, même si le résultat est destiné à la production. Utiliser `npm ci` pour respecter le lockfile. Aucune variable d'environnement ni aucun secret n'est requis pour construire le site. Les variables facultatives `SITE_URL` et `SITE_INDEXABLE` sont décrites dans le [guide SEO](seo.md).

L'aperçu sert uniquement le `dist/` déjà construit sur `http://127.0.0.1:4173`. Il ne surveille pas les sources. `PORT=4174 npm run preview` permet de changer le port du serveur local ; cela ne modifie pas la configuration Playwright.

Ne pas ouvrir directement les HTML source en `file://` : leurs tokens ne sont pas résolus et les modules nécessitent un serveur HTTP. Les pages se visitent avec leur extension, par exemple `/contact.html` ; le serveur local ne réécrit pas les routes sans extension.

## 2. Modifier les coordonnées et les textes

### Identité et contact

Modifier [assets/config/artisan.json](../assets/config/artisan.json). Les champs obligatoires sont décrits dans [Architecture](architecture.md). Le format lisible du téléphone est dans `phone`, sa valeur pour le lien est dans `phoneHref` sans `tel:`. Mettre à jour `artisanFullName` explicitement si le nom change.

Le build répercute ces valeurs dans les tokens et les données structurées. Certaines occurrences éditoriales du nom de l'entreprise et de sa zone restent dans les HTML : les rechercher en cas de changement global.

Les demandes de devis sont des liens `mailto:` avec un objet préparé. Il n'y a pas de formulaire, de stockage des demandes ou d'envoi côté serveur. Ajouter un formulaire serait une évolution fonctionnelle distincte.

### Pages principales et blocs partagés

Modifier les textes propres à une page dans son `.html` à la racine. Modifier le menu, le footer et les autres fragments communs dans [templates/partials](../templates/partials/), puis reconstruire pour vérifier toutes les pages qui les utilisent.

Le CTA du footer est dans `footer.html` et pointe vers `https://seignemorte.com`. Les listes de liens historiques vers les villes et les ancres restent écrites à la main ; les liens vers les prestations sont générés depuis `services.json`. Pour les liens manuels : préserver leurs destinations, notamment `index.html#…` pour rejoindre une section depuis une autre page.

Pour ajouter un partial, l'enregistrer dans `scripts/pages.mjs` et insérer son token `PARTIAL_*` dans les pages concernées. Le build refuse les tokens majuscules laissés sans résolution.

## 3. Ajouter ou modifier une page locale

Le contenu des villes vient de [assets/config/cities.json](../assets/config/cities.json). Le HTML commun est [templates/pages/city.html](../templates/pages/city.html). Ne pas créer à la main un HTML racine portant le même nom qu'une ville : le build refuserait cette collision.

1. Copier une entrée existante du tableau et adapter tous ses contenus à la ville réellement desservie.
2. Choisir un `file` unique en minuscules et tirets, terminé par `.html`. Ce champ détermine l'URL publiée. Le champ `slug` actuellement présent n'est pas utilisé par le rendu.
3. Renseigner `city`, `title`, `description`, `heroImage`, `heroAlt`, `heroTitle`, `heroCopy`, `localTitle` et le tableau `localParagraphs`. Ajouter `serviceFiles` avec les noms des prestations pertinentes dans `services.json`.
4. Vérifier l'image, son texte alternatif et ses éventuels crédits. Un chemin local part de la racine des pages, par exemple `assets/images/site/...` ; une URL distante dépend du service qui l'héberge.
5. Ajouter les liens de navigation nécessaires. Rechercher les listes existantes dans `zones-intervention.html`, `contact.html`, `templates/partials/footer.html` et `templates/partials/zones.html` ; elles ne sont pas synchronisées automatiquement avec le JSON.
6. Formater le JSON, reconstruire, puis contrôler la nouvelle page et les liens qui y conduisent.

La nouvelle page est automatiquement incluse dans le sitemap, la liste `areaServed` du JSON-LD et l'inventaire des pages locales des tests navigateur. Ses réalisations proviennent des chantiers dont `city` correspond exactement au nom de la ville, à concurrence de trois. Sans correspondance, elle propose trois exemples récents du portfolio global, sans leur attribuer une localisation.

Les photos de villes utilisent actuellement Wikimedia via `wsrv.nl`. Une indisponibilité de ces services peut affecter les images sans faire échouer le build. Les tests navigateur remplacent ces réponses par une image de test : vérifier les vraies images séparément lors d'une modification de leurs URLs.

## 4. Ajouter une page principale

1. Créer un `.html` à la racine en reprenant la structure d'une page adaptée : langue française, viewport, titre, description, canonical et un titre `h1` pertinent.
2. Inclure les partials nécessaires et les assets. Les pages existantes ont des compositions différentes ; choisir les blocs selon le besoin.
3. Employer `{{SITE_URL}}` pour les URLs absolues SEO et les tokens artisan pour les coordonnées.
4. Ajouter les liens de navigation et vérifier qu'ils fonctionnent depuis les autres pages.
5. Ajouter la page à la liste des pages principales dans `tests/browser/site.spec.mjs` si elle doit bénéficier du même contrôle automatique.
6. Construire et vérifier desktop/mobile.

Le build découvre automatiquement les `.html` à la racine et les ajoute au sitemap. Les HTML dans un sous-dossier arbitraire ne sont pas découverts. Le serveur local sert les fichiers générés ; il n'existe pas de routeur applicatif.

## 5. Modifier CSS, icônes ou JavaScript

### CSS et assets

- Modifier les composants dans `assets/css/styles.css`, ou les classes utilitaires dans les HTML et les fonctions de rendu.
- Modifier les couleurs Tailwind dans `scripts/styles.mjs`. Il n'y a pas de fichier `tailwind.config.js` séparé.
- Les classes Tailwind et les icônes sont détectées dans le HTML rendu au build. Un nom construit uniquement en JavaScript ne suffit pas à générer la règle correspondante.
- Pour une nouvelle icône Bootstrap, utiliser une classe présente dans la version installée, puis reconstruire. Le build conserve la CSS des icônes repérées dans le HTML.
- Préserver l'ordre `styles.css` puis `utilities.css` et les breakpoints existants. Vérifier la largeur desktop et le rendu mobile si une règle de disposition change.
- Optimiser les images avant de les placer dans les sources. Ni la copie des assets ni la compilation CSS ne transforment les photos.

Ne pas éditer les CSS générées dans `dist/` : elles seront remplacées au prochain build. Ne pas ajouter de CDN Tailwind ou d'icônes pour contourner la compilation locale.

### Interactions

Lire les contrats DOM dans [Architecture](architecture.md) avant de renommer un ID, un attribut `data-*` ou une classe utilisée par les modules. `app.js` initialise les modules une fois. Les filtres masquent les cartes existantes, ce qui préserve la position des comparateurs et les éléments équipés pour la visionneuse.

Une modification du menu doit conserver navigation clavier, fermeture par Échap, restauration du focus et adaptation desktop/mobile. Une modification de la visionneuse doit conserver le focus, l'arrière-plan `inert` et la restauration du défilement. Les textes et photos des réalisations doivent rester présents dans le HTML sans exécution de JavaScript.

### Ajouter une catégorie de réalisation

Un simple chantier utilise une catégorie existante. Pour étendre les catégories :

1. Ajouter la clé à l'ensemble `categories` dans `scripts/projects.mjs`.
2. Ajouter une prestation portant cette `category` dans `assets/config/services.json`, puis ajouter le bouton avec le même `data-filter` dans `realisations.html`, avec un libellé lisible et les attributs cohérents avec ses voisins.
3. Adapter la liste des catégories parcourues par le test de filtrage dans `tests/browser/site.spec.mjs` et les tests unitaires concernés.
4. Mettre à jour le tableau dans [Ajouter une réalisation](ajouter-realisation.md).
5. Vérifier les filtres, y compris une catégorie sans chantier, et l'absence de débordement des boutons sur mobile.

Le JavaScript de filtrage utilise les attributs ; il ne contient pas de liste de catégories à étendre.

## 6. Vérifications et CI

| Commande / fichier         | Ce qui est vérifié                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run format:check`     | Formatage des sources et de la documentation avec Prettier                                            |
| `npm test`                 | Projets et métadonnées, rendu, échappement, liens, canonical, JSON-LD, sitemap/images et mode preview |
| `npm run build`            | Chargement des JSON, validations, assemblage du HTML, génération CSS et copie des assets              |
| `npm run check`            | Les trois commandes précédentes, dans cet ordre                                                       |
| `npm run test:browser`     | Pages, liens locaux, interactions et erreurs navigateur sur desktop/mobile                            |
| `.github/workflows/ci.yml` | Installation Node 22, `npm ci`, `npm run check`, installation Chromium et tests navigateur            |

Pour corriger le formatage d'un fichier, préférer une commande ciblée telle que `npx prettier --write docs/maintenance.md`. `npm run format` formate l'ensemble du dépôt : inspecter ensuite le diff.

Les tests Playwright couvrent les pages principales, les villes, les prestations, les fiches chantier et la FAQ sur des viewports desktop 1440 × 1000 et mobile 390 × 844, ainsi que le menu, les filtres, les comparateurs, la visionneuse et la présence du portfolio, des fiches et des FAQ sans JavaScript. Ils vérifient les liens locaux et les erreurs de ressources ; le contrôle du débordement horizontal exclut actuellement Mentions légales. Ils ne remplacent pas une vérification visuelle du cadrage des photos ou de la disponibilité des images externes.

Installer Chromium une fois avec `npx playwright install chromium`. La CI utilise `--with-deps` pour installer aussi les bibliothèques système. Si un environnement fournit déjà un Chromium compatible, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` peut désigner son exécutable ; cette option est prévue dans `playwright.config.mjs`.

Playwright démarre automatiquement `npm run build && npm run preview`. Hors CI, il peut réutiliser un serveur existant : reconstruire avant le test ou arrêter ce serveur pour éviter de vérifier un ancien `dist/`.

Adapter les vérifications au risque réel. Une modification documentaire nécessite surtout formatage, liens et exactitude des exemples. Une modification du rendu partagé ou des interactions nécessite les tests correspondants et une vérification desktop/mobile. Les tests navigateur actuels supposent des données contenant au moins un chantier et un comparateur ; un portfolio volontairement vide nécessite d'adapter ces attentes.

## 7. Publication : le dossier `dist/`

**L'hébergement doit servir le résultat du build, donc `dist/`, jamais les HTML source avec leurs tokens.**

| Réglage                             | Valeur                                          |
| ----------------------------------- | ----------------------------------------------- |
| Répertoire de travail du build      | Racine du dépôt                                 |
| Installation                        | `npm ci`, dépendances de développement incluses |
| Commande de construction            | `npm run build`                                 |
| Dossier à publier                   | `dist`                                          |
| Configuration Cloudflare versionnée | `wrangler.jsonc` → `assets.directory: "./dist"` |

Il n'y a pas de script npm `deploy` ni de dépendance Wrangler dans le dépôt. Le workflow GitHub Actions versionné exécute des vérifications ; il ne déploie pas le site. Une éventuelle intégration Git Cloudflare, sa branche de production et ses déclencheurs sont des réglages de l'hébergement à consulter séparément. Ne pas déduire de la seule présence du workflow qu'un merge publie automatiquement.

### Domaine et SEO

Suivre le [guide SEO et recherches IA](seo.md). `assets/config/site.json` → `siteUrl` reste l’origine par défaut, actuellement `https://awz-renovation.jf-seignemorte.workers.dev`. `SITE_URL` permet de choisir une autre origine au build ; cette valeur alimente canonical, Open Graph, JSON-LD, sitemap et robots. Elle ne doit contenir aucun chemin, identifiant, paramètre ou fragment.

Le build est indexable par défaut. Un build de prévisualisation doit utiliser `SITE_INDEXABLE=false` : les pages portent `noindex, follow`, le sitemap est vide et `robots.txt` reste ouvert pour permettre aux moteurs de lire la directive. Ne pas utiliser ce réglage sur le site public à indexer.

Les URLs `.html` sont conservées par `assets.html_handling: "none"`. Publier le fichier `_redirects` généré avec `dist/` pour servir l’accueil et rediriger les anciens chemins sans extension. Voir le [guide SEO](seo.md#urls-html-et-cloudflare).

### Avant une mise en ligne

Vérifier que le build est terminé avec succès, que les sources prévues sont versionnées et que le domaine SEO correspond au domaine servi. Contrôler ensuite les pages et assets sur l'URL publiée. Une erreur de build ne doit pas conduire à publier une sortie partielle ; `dist/` est effacé et reconstruit à chaque build.

## 8. Limites connues à connaître

Ces points décrivent l'existant ; ils n'impliquent pas de les modifier lors d'une simple demande de contenu.

- Un chantier est identifié par sa date unique ; aucune publication programmée ou sélection manuelle n’existe. Sa date détermine aussi son URL détaillée : une correction de date après publication exige une redirection de l’ancienne URL.
- Les photos ne sont pas validées ni optimisées au build. Les assets d'images inutilisés sont copiés eux aussi.
- Les modules JavaScript sont copiés tels quels ; seules les CSS sont compilées/minifiées.
- Les liens vers les villes sont maintenus dans plusieurs blocs HTML, séparément de `cities.json`.
- La page Mentions légales conserve une composition CSS différente. Son texte comporte encore des mentions de formulaire et un emplacement d'information d'hébergement à compléter : vérifier le contenu réel avec le responsable du site avant une correction éditoriale, sans inventer ces informations.
- Il n'y a ni analytics applicatif, ni backend de devis, ni suivi des demandes dans ce dépôt.

Pour toute évolution du fonctionnement, mettre à jour la documentation concernée dans la même PR et indiquer les vérifications effectivement réalisées.
