# AWZ-Rénovation — Guide de maintenance

Site vitrine statique d'AWZ-Rénovation.

Ce README explique les modifications courantes sans avoir besoin de connaître l'architecture du site.

## Lancer le site

Installer les dépendances une première fois :

```bash
npm install
```

Construire le site :

```bash
npm run build
```

Le build crée le dossier `dist/`, qui est la version à publier.

Le déploiement Cloudflare utilise `dist/`.

## Organisation principale

```text
/
├── index.html
├── realisations.html
├── contact.html
├── zones-intervention.html
├── ... pages villes ...
├── assets/
│   ├── images/
│   │   ├── realisations/
│   │   │   ├── projects.json
│   │   │   ├── 2026-01-28/
│   │   │   └── ...
│   │   └── ...
│   └── js/
│       └── projects.js       ← généré automatiquement
├── scripts/
│   └── build-site.mjs
└── wrangler.jsonc
```

## Modifier le téléphone, l'e-mail, l'adresse ou le SIRET

Les coordonnées actuellement utilisées sont :

- Téléphone : `06 78 81 66 96`
- E-mail : `antonywouenzell@yahoo.fr`
- Adresse : `2 rue du Gros Chillou, 37420 Avoine`
- SIRET : `511 157 307 00022`

Pour modifier une coordonnée, rechercher son ancienne valeur dans le projet et la remplacer partout.

Exemple pour changer le téléphone : rechercher `06 78 81 66 96` dans tous les fichiers HTML, puis remplacer la valeur affichée **et** les liens `tel:` correspondants.

Faire ensuite `npm run build`.

## Modifier le logo

Les images générales du site sont dans :

```text
assets/images/
```

Pour remplacer un logo sans toucher au HTML, le plus simple est de remplacer le fichier actuel par le nouveau fichier en conservant exactement **le même nom, le même format et le même emplacement**.

Si le nom du fichier change, rechercher l'ancien nom du logo dans les fichiers HTML et remplacer son chemin.

Après modification :

```bash
npm run build
```

## Ajouter une réalisation

C'est la partie volontairement standardisée du site.

### 1. Créer le dossier

Dans :

```text
assets/images/realisations/
```

créer un dossier portant la date du chantier au format :

```text
YYYY-MM-DD
```

Exemple :

```text
assets/images/realisations/2026-01-28/
```

Une date ne peut correspondre qu'à une seule réalisation.

### 2. Ajouter les photos

Deux possibilités.

Avec un avant/après :

```text
2026-01-28/
├── avant.webp
├── apres.webp
├── 1.webp
├── 2.webp
└── 3.webp
```

`avant.webp` et `apres.webp` activent automatiquement le comparateur avant/après.

Les fichiers `1.webp`, `2.webp`, `3.webp`, etc. sont les photos supplémentaires de la galerie.

Sans avant/après :

```text
2026-01-28/
├── 1.webp
├── 2.webp
└── 3.webp
```

La réalisation sera automatiquement affichée sous forme de galerie.

Utiliser des images WebP. Il n'est pas nécessaire d'écrire leurs chemins dans le JSON.

### 3. Ajouter le projet dans projects.json

Le seul fichier de données à modifier est :

```text
assets/images/realisations/projects.json
```

Il contient **toutes les réalisations**.

Ajouter par exemple :

```json
{
  "date": "2026-01-28",
  "category": "facades",
  "label": "Ravalement & façade",
  "title": "Ravalement d’une façade en pierre",
  "description": "Nettoyage et reprise d’une façade en pierre afin de retrouver une façade propre et homogène.",
  "points": [
    "Nettoyage de la façade",
    "Reprise des surfaces",
    "Mise en valeur de la pierre"
  ]
}
```

Ne mettre aucun chemin d'image dans cette entrée.

La valeur `date` indique automatiquement au site qu'il doit utiliser :

```text
assets/images/realisations/2026-01-28/
```

### 4. Builder

```bash
npm run build
```

Le build :

- lit `projects.json` ;
- vérifie le format des dates ;
- vérifie que chaque répertoire existe ;
- détecte automatiquement `avant.webp` et `apres.webp` ;
- détecte automatiquement `1.webp`, `2.webp`, `3.webp`... ;
- génère `assets/js/projects.js` ;
- construit `dist/` ;
- échoue volontairement si une réalisation est mal configurée.

**Ne jamais modifier `assets/js/projects.js` à la main.**

## Modifier une réalisation existante

Pour modifier son texte, éditer uniquement son entrée dans :

```text
assets/images/realisations/projects.json
```

Pour changer une photo, remplacer simplement le fichier correspondant dans son dossier.

Exemple :

```text
assets/images/realisations/2026-01-28/apres.webp
```

Puis relancer :

```bash
npm run build
```

## Supprimer une réalisation

1. Supprimer son entrée dans `projects.json`.
2. Supprimer son dossier `YYYY-MM-DD`.
3. Lancer `npm run build`.

## Où les réalisations sont utilisées ?

La même source alimente :

- la page d'accueil ;
- la page Réalisations ;
- les pages locales / villes.

Il ne faut donc jamais recopier manuellement une URL d'image de réalisation dans une page HTML.

La Home sélectionne automatiquement une réalisation récente disposant d'un avant/après. Les pages villes utilisent les réalisations les plus récentes.

## Ajouter une ville / zone d'intervention

Les pages locales sont des fichiers HTML à la racine, par exemple :

```text
angers.html
tours.html
langeais.html
renovation-saumur.html
```

Lorsqu'une nouvelle page ville est créée, penser également au maillage interne et à `sitemap.xml`.

## Modifier les textes de la Home

La page d'accueil est :

```text
index.html
```

Les contenus généraux peuvent être modifiés directement dans ce fichier.

Ne pas remettre de chemins de photos de réalisations en dur dans la Home : elles doivent rester alimentées par `projects.js`.

## Modifier les services

Les cartes et textes de services sont actuellement intégrés dans les pages HTML.

Pour changer le texte d'un service, rechercher son titre dans `index.html` et dans les pages concernées.

Les images de service se trouvent sous `assets/images/`.

## Contact / formulaire de devis

Le formulaire principal est dans :

```text
contact.html
```

Il utilise le formulaire Netlify `demande-devis` et permet l'ajout de plusieurs photos.

Lors d'une modification du formulaire, conserver le champ caché `form-name` et le honeypot utilisés par Netlify.

## SEO

Les principaux fichiers sont :

```text
robots.txt
sitemap.xml
```

Lors de l'ajout ou de la suppression d'une page publique, vérifier `sitemap.xml`.

Les pages villes possèdent leur propre contenu SEO : éviter de les remplacer par du contenu identique entre toutes les villes.

## Règle importante

Pour les réalisations :

**1 dossier daté + 1 entrée dans `projects.json` = 1 réalisation.**

Il ne doit y avoir :

- aucun `project.json` dans les dossiers ;
- aucun chemin de photo dans `projects.json` ;
- aucun chemin de photo de réalisation recopié dans la Home ou les pages villes ;
- aucune modification manuelle de `assets/js/projects.js`.

Le build s'occupe du reste.

## SEO technique

Le build injecte aussi les réalisations en HTML dans `dist/`. Les pages publiques ont title, meta description, canonical et Open Graph. La Home contient le JSON-LD LocalBusiness. `robots.txt` référence `sitemap.xml`. `merci.html` est en `noindex`.


## Configuration artisan — source unique

Toutes les coordonnées de l'artisan sont centralisées dans `assets/config/artisan.json` :
nom, téléphone, e-mail, adresse, SIRET et URL du site.

Ne modifiez plus ces informations directement dans les pages HTML. Le build injecte automatiquement
les valeurs de `artisan.json` dans toutes les pages générées dans `dist/`.

Le formulaire de contact est indépendant de Netlify et envoie vers `/api/contact`.
L'implémentation de cette route dépend de l'hébergement choisi ; elle devra lire la même configuration
artisan côté build/serveur pour utiliser l'adresse e-mail destinataire.



## Contact — V59

Il n'y a plus de formulaire ni de backend d'envoi d'e-mail. Tous les boutons « Demander un devis »
ouvrent le client e-mail du visiteur via un lien `mailto:`. L'adresse et l'objet sont générés au build
depuis `assets/config/artisan.json`.

La page `contact.html` reste une page de coordonnées complète : entreprise, téléphone, e-mail,
adresse, SIRET et zone d'intervention.

Cette solution est entièrement statique et fonctionne de la même manière sur Cloudflare, OVH,
Netlify ou tout autre hébergement de fichiers statiques, sans clé API ni service d'e-mail.
