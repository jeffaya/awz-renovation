# SEO local et recherches IA

[Accueil documentation](../README.md) · [Architecture](architecture.md) · [Maintenance](maintenance.md)

Le site fournit du HTML complet, des informations d’entreprise cohérentes et des pages accessibles aux robots. Ces améliorations facilitent la compréhension et l’indexation ; elles ne garantissent ni une position dans Google, ni une citation dans ChatGPT, Copilot, Claude ou Perplexity.

## Contenus et sources

| Source                                     | Contenu publié                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `assets/config/artisan.json`               | Identité, coordonnées, SIRET et profils publics `sameAs`                                                |
| `assets/config/services.json`              | Six prestations : présentation, étapes, questions fréquentes et liens vers les chantiers correspondants |
| `assets/config/faq.json`                   | FAQ commune et premières questions sur l’accueil                                                        |
| `assets/config/cities.json`                | Dix pages locales avec textes propres et liens vers les prestations pertinentes                         |
| `assets/images/realisations/projects.json` | Une fiche par chantier, photos réelles et métadonnées facultatives vérifiées                            |

Les pages locales indiquent que l’entreprise est basée à Avoine. Elles ne présentent pas d’établissement fictif dans chaque ville. Les exemples du portfolio ne deviennent des références locales que si leur champ `city` le confirme. Les photographies de présentation des prestations sont explicitement signalées comme illustrations.

Pour enrichir une fiche chantier, ajouter uniquement les informations connues : commune, état initial, durée, surface, matériaux et détails des travaux. Voir [Ajouter une réalisation](ajouter-realisation.md). Aucun tarif, avis agrégé, certification, garantie ou localisation ne doit être inventé pour remplir une page. Les textes de FAQ et certains paragraphes contiennent des coordonnées éditoriales : les rechercher aussi lors d’un changement d’identité.

Les données structurées relient l’entreprise (`HomeAndConstructionBusiness`), le site (`WebSite`), les pages, les prestations (`Service`), les chantiers (`CreativeWork`) et les fils d’Ariane. Elles reprennent les contenus visibles. Le sitemap contient toutes les pages indexables et les images des fiches chantier. Il n’annonce pas de date de dernière modification artificielle.

## Choisir le domaine à indexer

L’origine par défaut reste `https://awz-renovation.jf-seignemorte.workers.dev`, dans `assets/config/site.json`. L’ancien domaine `awz-renovation.fr`, que le propriétaire indique ne plus maîtriser, n’est plus une destination de configuration. Aucune nouvelle adresse n’a été supposée.

Une origine contrôlée peut remplacer la configuration au build. Exemple illustratif, à remplacer par le domaine effectivement relié à l’hébergement :

```bash
SITE_URL=https://nouveau-domaine.example SITE_INDEXABLE=true npm run build
```

`SITE_URL` doit être une origine HTTP(S), sans chemin, identifiants, paramètres ni fragment. Elle s’applique aux canonical, Open Graph, JSON-LD, sitemap et à la déclaration de sitemap dans `robots.txt`. Pour un changement permanent, mettre aussi à jour `siteUrl` dans le JSON afin que le build local reste cohérent.

Avant de publier sur un nouveau domaine :

1. Relier le domaine à l’hébergement et vérifier son certificat HTTPS.
2. Choisir l’hôte principal, avec ou sans `www`, et configurer les redirections permanentes depuis les autres hôtes contrôlés vers la même page du domaine principal.
3. Construire avec la bonne origine et `SITE_INDEXABLE=true`, puis publier `dist/`.
4. Vérifier sur le domaine public l’accueil, une prestation et une réalisation, leurs canonical, le JSON-LD, `/robots.txt` et `/sitemap.xml`.
5. Vérifier la propriété dans Google Search Console et Bing Webmaster Tools, puis soumettre le sitemap du nouveau domaine.
6. Corriger l’adresse du site dans Google Business Profile, les profils publics, les annuaires et les autres liens que le propriétaire peut modifier.

Une redirection depuis l’ancien domaine nécessite d’en contrôler l’hébergement ou la configuration. Une modification de ce dépôt ne peut pas rediriger un domaine géré par un tiers. La migration ne transfère donc pas automatiquement les signaux de l’ancien site. Les changements de DNS, de comptes externes et de liens d’annuaires sont des actions distinctes du build.

## URLs HTML et Cloudflare

Les URLs canoniques conservent l’extension `.html`, sauf l’accueil `/`. Cloudflare retire cette extension par défaut ; `wrangler.jsonc` fixe donc `assets.html_handling` à `none`. Le build produit `dist/_redirects` : l’accueil sert `index.html` par une réécriture interne, `/index.html` redirige vers `/`, et les anciens chemins sans extension ou avec slash redirigent en 301 vers leur page `.html`. Les règles explicites évitent les chaînes et conservent les liens existants.

Publier `_redirects` avec le reste de `dist/`. Un autre hébergeur doit reprendre ces règles dans son propre format. Le serveur `npm run preview` sert seulement les fichiers ; il ne simule pas les règles Cloudflare. Pour les contrôler, utiliser Wrangler en local ou vérifier les réponses après publication. Tester `/`, `/index.html`, `/contact`, `/contact/` et `/contact.html` : une seule redirection au plus, puis une réponse 200 sur l’URL canonique.

Contrôle facultatif avec Wrangler (outil non inclus dans les dépendances du dépôt, sans déploiement) :

```bash
npx wrangler dev --local --ip 127.0.0.1 --port 8787 --inspector-port 9230
```

## Prévisualisations et robots

Pour une prévisualisation accessible publiquement mais à exclure des moteurs :

```bash
SITE_URL=https://preview.example SITE_INDEXABLE=false npm run build
```

Ce mode ajoute `noindex, follow` dans chaque page, laisse un sitemap vide et retire sa déclaration de `robots.txt`. L’exploration reste autorisée afin que les moteurs puissent lire `noindex`. Ce réglage n’est pas une protection d’accès : les contenus confidentiels nécessitent une authentification. Ne pas utiliser `SITE_INDEXABLE=false` sur la production à indexer.

En production, `User-agent: *` et `Allow: /` autorisent déjà l’exploration, y compris pour les robots de recherche IA qui respectent `robots.txt`. Il n’est pas nécessaire de multiplier les blocs identiques par robot. Les règles de pare-feu et de protection contre les robots de l’hébergement restent indépendantes de ce fichier.

Dans Cloudflare, vérifier que les robots de recherche autorisés ne reçoivent pas de challenge ni de réponse 403/429. S’appuyer sur les mécanismes de vérification et les plages IP officielles lorsqu’elles sont publiées ; ne pas désactiver globalement la protection ni faire confiance au seul User-Agent. Examiner les règles concernant notamment `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, Googlebot et Bingbot.

L’accès pour la recherche et l’utilisation pour l’entraînement sont des choix distincts. Par exemple, `OAI-SearchBot` sert à la recherche OpenAI et `GPTBot` à la collecte susceptible de servir à l’entraînement. Cette PR ne change pas la politique existante d’entraînement. Le fichier `llms.txt` n’est pas un prérequis pour Google AI et n’est pas ajouté comme promesse de référencement.

## Mesurer après publication

- Google Search Console : indexation, erreurs d’exploration, pages canoniques retenues et requêtes locales.
- Bing Webmaster Tools : indexation et, lorsque disponible dans le compte, le rapport AI Performance pour les citations.
- Journaux Cloudflare : accès effectif des robots et éventuels blocages.
- Référents et demandes de devis : évolution des visites et contacts si un dispositif de mesure est mis en place séparément.

La présence dans une réponse IA varie selon la requête, la date et le contexte. Évaluer des recherches portant sur les services et les communes réellement desservies, et conserver les dates des observations. Le dépôt ne contient ni soumission automatique aux moteurs, ni suivi analytique, ni intégration IndexNow.

## Vérifier une modification

```bash
npm run check
npm run test:browser
```

Les tests SEO construisent avec une origine de test, vérifient les canonical, les liens, le JSON-LD, les photos du sitemap et le mode non indexable, puis restaurent le build configuré. Playwright parcourt les pages sur desktop et mobile et contrôle aussi les contenus sans JavaScript. Les robots d’un moteur réel et les règles Cloudflare doivent être contrôlés après déploiement, hors de ces tests locaux.

## Références officielles

- [Google : fonctionnalités IA et site Web](https://developers.google.com/search/docs/appearance/ai-features)
- [Google : données structurées LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [OpenAI : robots et usages](https://developers.openai.com/api/docs/bots)
- [Perplexity : robots et plages IP](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Anthropic : exploration et contrôle des robots](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Cloudflare : règles de blocage des robots IA](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/)
- [Bing : rapport AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)

- [Cloudflare : traitement des URLs HTML](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Cloudflare : redirections et réécritures](https://developers.cloudflare.com/workers/static-assets/redirects/)
