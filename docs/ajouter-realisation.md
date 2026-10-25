# Ajouter ou modifier une réalisation

[Accueil documentation](../README.md) · [Guide agent](../AGENTS.md) · [Architecture](architecture.md) · [Maintenance](maintenance.md)

Une réalisation correspond à **une entrée de métadonnées et un dossier de photos portant la même date**. Le build crée ensuite les cartes des différentes pages et une fiche `realisation-YYYY-MM-DD.html`, incluse au sitemap avec les photographies. Il n’y a pas de commande d’import automatique.

## 1. Rassembler les informations

Avant de modifier le dépôt, disposer de la date réelle du chantier, de sa catégorie, des textes et des photos à publier. Les exemples ci-dessous sont fictifs : remplacer la date et les descriptions par les informations fournies, sans inventer de travaux ou de localisation.

La date doit être une date de calendrier valide au format `YYYY-MM-DD`, et être unique dans le portfolio. Elle sert à la fois d’identifiant, de nom de dossier, de clé de tri et de composant de l’URL de la fiche. Vérifier les dates existantes dans [projects.json](../assets/images/realisations/projects.json).

**Deux chantiers le même jour ne sont pas représentables avec le modèle actuel.** Ne pas décaler arbitrairement une date : demander quelle donnée utiliser, ou prévoir une évolution explicite du modèle avec un identifiant distinct.

Il n'existe pas de mode brouillon ou de publication programmée. Une entrée avec une date future sera visible dès le prochain déploiement, au même titre que les autres.

## 2. Préparer les photos

Créer le dossier correspondant à la date retenue sous `assets/images/realisations/`. Par exemple, pour la date illustrative utilisée plus bas :

```bash
mkdir -p assets/images/realisations/2026-02-18
```

Choisir l'une des deux formes suivantes :

| Présentation                          | Fichiers à placer directement dans le dossier                       |
| ------------------------------------- | ------------------------------------------------------------------- |
| Comparateur avant/après               | `avant.webp` **et** `apres.webp`                                    |
| Galerie sans comparateur              | Au moins `1.webp`, puis éventuellement `2.webp`, `3.webp`, etc.     |
| Comparateur et galerie complémentaire | La paire `avant.webp` / `apres.webp`, plus `1.webp`, `2.webp`, etc. |

Les noms sont sensibles à la casse : utiliser exactement `avant.webp`, `apres.webp`, sans accent. `Avant.webp`, `après.webp`, `photo-1.webp`, `.jpg` et les photos dans des sous-dossiers ne sont pas reconnus comme images du chantier.

Les images numérotées sont triées numériquement : `1.webp`, `2.webp`, puis `10.webp`. Par convention, commencer à 1 et éviter les zéros initiaux ; le code reconnaît actuellement tout nom constitué de chiffres suivi de `.webp`.

### Qualité et poids

- Convertir réellement les images au format WebP : changer uniquement l'extension d'un JPEG ne suffit pas.
- Corriger l'orientation et vérifier visuellement chaque fichier. Le build valide les noms et leur présence, pas le décodage, les dimensions ou la qualité de l'image.
- Pour le comparateur, choisir des vues du même sujet avec un cadrage et des proportions proches. Ne pas fabriquer une photo « avant » si elle n'a pas été fournie ; utiliser une galerie.
- Adapter résolution et compression au rendu desktop, puis contrôler les détails. Le build ne redimensionne et ne recompresse aucune photographie.
- Conserver les originaux hors de `assets/images/` : tous les fichiers de ce répertoire, sauf les JSON, sont copiés dans `dist/`, même s'ils ne sont pas utilisés dans les cartes.

## 3. Ajouter les métadonnées

Ouvrir [assets/images/realisations/projects.json](../assets/images/realisations/projects.json). Ajouter l'objet ci-dessous **dans le tableau existant**, séparé des autres objets par une virgule. Ne pas remplacer tout le fichier par cet objet. Le JSON n'accepte ni commentaires ni virgule après le dernier élément.

Exemple fictif à adapter :

```json
{
  "date": "2026-02-18",
  "category": "pierre",
  "label": "Pierre & tuffeau",
  "title": "Restauration d'un mur en pierre",
  "description": "Reprise des joints et restauration des parties abîmées d'un mur en pierre.",
  "points": [
    "Préparation des supports existants",
    "Reprise des joints et des pierres abîmées",
    "Finitions adaptées au bâti"
  ]
}
```

Cet objet fonctionne aussi bien avec un comparateur qu'avec une galerie : **les fichiers présents déterminent le mode**, pas un champ supplémentaire.

| Champ         | Valeur attendue                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `date`        | Date réelle et unique ; identique au nom du dossier                                                       |
| `category`    | Une des six valeurs exactes ci-dessous, sans accent                                                       |
| `label`       | Libellé visible, par exemple « Pierre & tuffeau »                                                         |
| `title`       | Titre du chantier                                                                                         |
| `description` | Description courte des travaux réalisés                                                                   |
| `points`      | Tableau de textes non vides décrivant les interventions ; `[]` est accepté si aucun point n'est renseigné |

Les cinq premiers champs sont des chaînes obligatoires non vides. Écrire les textes normalement, avec accents, apostrophes et `&`. Ne pas insérer de HTML ou d'entités telles que `&amp;` : le rendu échappe déjà les valeurs. Le libellé `label` ne détermine pas le filtre ; c'est `category` qui le fait.

### Informations facultatives et vérifiées

| Champ         | Valeur et effet                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `city`        | Commune réelle du chantier ; chaîne non vide, correspondance exacte avec `cities.json` pour le maillage local |
| `context`     | État initial / problème à résoudre, sans HTML                                                                 |
| `duration`    | Durée réellement connue, sous forme de texte                                                                  |
| `surface`     | Surface réellement connue avec unité, sous forme de texte                                                     |
| `materials`   | Tableau de noms de matériaux non vides                                                                        |
| `workDetails` | Tableau de paragraphes non vides détaillant les travaux réalisés                                              |

Omettre une information inconnue ; ne pas écrire une valeur vide ni déduire la commune de l’adresse de l’entreprise. Les photos et descriptions déjà présentes suffisent pour générer la fiche. La date du chantier n’est pas présentée comme une date de publication.

### Catégories autorisées

| `category`   | Domaine               |
| ------------ | --------------------- |
| `maconnerie` | Maçonnerie            |
| `interieur`  | Rénovation intérieure |
| `pierre`     | Pierre et tuffeau     |
| `facades`    | Façades et extérieurs |
| `terrasses`  | Terrasses             |
| `finitions`  | Sols et finitions     |

Choisir la catégorie principale d'un chantier mixte. Il n'y a qu'une catégorie par entrée. Pour créer une nouvelle catégorie, voir [Maintenance](maintenance.md) : cela nécessite de modifier aussi la validation, les filtres et les tests.

Ne pas ajouter `id`, `file`, `mode`, `cat`, `copy`, `before`, `after`, `gallery` ou `images` dans le JSON : le build les calcule. Seules les métadonnées facultatives documentées ci-dessus enrichissent la fiche.

## 4. Comprendre où le chantier apparaîtra

L'ordre des objets dans le JSON est libre : le build les trie par date décroissante.

| Page                | Comportement                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `realisations.html` | Tous les chantiers, du plus récent au plus ancien ; catégorie disponible dans le filtre correspondant        |
| `index.html`        | Comparateur le plus récent ; en l'absence de tout comparateur, chantier le plus récent en galerie            |
| Pages locales       | Jusqu’à trois chantiers dont `city` correspond exactement ; sinon trois exemples récents du portfolio global |

Les pages de prestations proposent jusqu’à trois chantiers de leur catégorie (ou des exemples généraux si aucun ne correspond). La fiche individuelle reprend toutes les photographies, les textes et les informations facultatives renseignées. Les cartes de l’accueil, des villes et du portfolio pointent vers cette fiche.

Ajouter une galerie plus récente ne remplace donc pas le comparateur de l'accueil. Ne pas changer artificiellement la date pour forcer une mise en avant. Si une sélection manuelle est demandée, faire évoluer explicitement `renderHomeProject()` dans `scripts/render-projects.mjs` et documenter la nouvelle règle.

Sur Réalisations, une galerie d'une seule image l'affiche en grand ; avec deux images ou plus, les deux premières occupent le bloc principal et les suivantes apparaissent en petites vignettes. Un comparateur peut avoir autant de photos numérotées complémentaires que nécessaire. Sur l'accueil, ces compléments ne sont pas affichés.

## 5. Construire et vérifier

Depuis la racine du dépôt, après `npm ci` si nécessaire :

```bash
npx prettier --write assets/images/realisations/projects.json
npm run check
npm run preview
```

Le serveur reste actif dans le terminal. Ouvrir `http://127.0.0.1:4173/realisations.html`. Après une correction des sources, relancer `npm run build` dans un autre terminal puis actualiser la page.

Contrôler les points suivants :

- Le chantier apparaît au bon endroit avec les bons textes et des images chargées.
- Son filtre l'affiche ; les autres catégories le masquent.
- Le comparateur, s'il existe, déplace correctement les vues avant/après.
- Les images de galerie s'ouvrent dans la visionneuse et se ferment avec Échap.
- L’accueil et les pages locales affichent la sélection attendue.
- La fiche `realisation-YYYY-MM-DD.html` est accessible, son lien figure dans le portfolio et son URL ainsi que ses photos figurent dans `dist/sitemap.xml`.
- Le cadrage et la lisibilité conviennent sur desktop et mobile.
- Le diff Git contient seulement les métadonnées, les photos voulues et les éventuels changements documentaires ; aucun fichier de `dist/`.

Si le changement touche aussi le rendu ou les interactions, lancer les tests navigateur :

```bash
npx playwright install chromium
npm run test:browser
```

Un build réussi ne publie rien à lui seul. Livrer les sources selon le workflow Git du projet ; l'hébergement doit reconstruire puis servir `dist/` comme expliqué dans [Maintenance](maintenance.md).

## 6. Modifier ou retirer un chantier

| Modification                          | Action                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Corriger le texte ou la catégorie     | Modifier l'entrée JSON, reconstruire et contrôler le filtre                                                        |
| Remplacer une photo                   | Remplacer le fichier WebP correspondant, reconstruire et contrôler le rendu                                        |
| Ajouter une photo de détail           | Ajouter le prochain fichier numéroté dans le dossier, sans modifier le JSON                                        |
| Passer d'une galerie à un comparateur | Ajouter ensemble les deux fichiers `avant.webp` et `apres.webp` ; les images numérotées deviennent des compléments |
| Passer d'un comparateur à une galerie | Conserver au moins une photo numérotée et retirer les deux fichiers de la paire                                    |
| Corriger la date                      | Modifier la date dans le JSON et renommer le dossier avec la même valeur ; vérifier les sélections et l'unicité    |
| Retirer un chantier                   | Retirer son entrée et, si ses photos ne sont plus utilisées ailleurs, son dossier ; reconstruire                   |

Après publication, corriger une date change aussi l’URL `realisation-YYYY-MM-DD.html`. Prévoir une redirection permanente depuis l’ancienne URL sur l’hébergement et vérifier qu’elle aboutit à la nouvelle fiche. Le build n’en crée pas automatiquement.

Avant de supprimer un dossier, rechercher son chemin dans le dépôt. Retirer seulement l'entrée masque la carte mais laisse les photos copiées et accessibles dans la sortie publiée. Retirer seulement le dossier fait échouer le build.

## 7. Dépannage

| Erreur ou symptôme                                        | Cause probable / correction                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `projects.json doit contenir un tableau`                  | Conserver les crochets `[` et `]` autour de la liste d'objets                                    |
| Erreur JSON au chargement                                 | Vérifier guillemets doubles, virgules entre objets, absence de commentaires et de virgule finale |
| `champ … manquant ou vide`                                | Fournir le champ obligatoire avec une chaîne non vide                                            |
| `date invalide ou dupliquée`                              | Vérifier format, existence réelle de la date et absence de doublon                               |
| `catégorie inconnue`                                      | Utiliser exactement une valeur du tableau des catégories                                         |
| `points doit contenir des textes non vides`               | Utiliser un tableau de chaînes ; retirer les chaînes vides                                       |
| `répertoire manquant`                                     | Vérifier que la date et le dossier correspondent exactement                                      |
| `avant.webp et apres.webp doivent être présents ensemble` | Ajouter le membre manquant de la paire, ou utiliser seulement des photos numérotées              |
| `aucune image trouvée`                                    | Vérifier noms, extension en minuscules et emplacement direct dans le dossier                     |
| Build réussi, image illisible                             | Vérifier que le fichier est un vrai WebP non corrompu ; le build ne décode pas les photos        |
| Nouveau chantier absent de l'accueil                      | Vérifier la règle « comparateur le plus récent » et reconstruire                                 |
| Modifications absentes de l'aperçu                        | Le serveur sert l'ancien `dist/` : reconstruire puis actualiser                                  |

## 8. Instruction prête à donner à un agent

Copier et compléter cette demande, puis fournir les photos correspondantes :

> Lis `AGENTS.md` puis `docs/ajouter-realisation.md`. Ajoute une réalisation avec la date réelle [date], la catégorie [catégorie], le titre [titre] et les travaux décrits ici : [description et points]. Utilise les photos jointes ; leur rôle est [avant, après, détails / galerie seule]. Conserve les autres réalisations. Prépare les WebP, ajoute l'entrée JSON, vérifie le build et le rendu desktop/mobile des pages concernées. Indique les fichiers modifiés et si ce chantier devient la vignette de l'accueil. Si une information nécessaire manque ou si la date est déjà utilisée, signale précisément le problème sans inventer de contenu.
