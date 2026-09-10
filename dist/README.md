# V28

- Open Graph / WhatsApp configuré sur `https://awz-renovation.netlify.app`.
- Ajout de `config/site.json` comme configuration centrale.
- Domaine, nom de marque, téléphone, email, adresse, SIRET et image sociale sont centralisés.
- Ajout d’un build Netlify sans dépendance : `node scripts/build-site.mjs`.
- Netlify publie désormais le dossier `dist`.
- Les balises SEO statiques (canonical, `og:url`, `og:image`, Twitter Card et JSON-LD) sont générées au build, donc lisibles par WhatsApp/Facebook/LinkedIn sans exécuter JavaScript.
- Cette structure prépare une future déclinaison marque blanche : on pourra faire évoluer davantage de textes, couleurs, logo et zones via le même JSON.

## Configuration

Modifier simplement `config/site.json`, puis pousser le commit. Netlify relance le build automatiquement.

# V27
- Ajout d'une image sociale premium AWZ pour les partages WhatsApp, Facebook, LinkedIn, X et autres plateformes.
- Image Open Graph 1200×630 en JPEG, plus une version WebP.
- Balises og:image, og:image:width/height/type/alt et twitter:image ajoutées à toutes les pages.
- URL sociale absolue : https://www.awz-renovation.fr/assets/images/awz-social-share.jpg

# V26
- Remplacement de `zone-intervention-awz.webp` par la nouvelle carte validée.
- Image optimisée en WebP, carte statique sans Google Maps/Leaflet.

# V25
- Remplacement de la carte Leaflet/GoogleMap par le visuel statique validé des zones d’intervention.
- Visuel optimisé en WebP et intégré à la page Zones d’intervention.

# V24
- Correction de l’affichage de la carte Zones d’intervention (Leaflet responsive).
- Correction du positionnement de Chinon.

AWZ-Rénovation V17

- Header complet + intervention rapide sur toutes les pages
- Comparateurs avant/après nettoyés et reconstruits sans zoom
- Images services réalignées avec leurs métiers
- Maillage interne entre pages villes

# AWZ-Rénovation V15

V15 orientée conversion et crédibilité : formulaire Netlify avec envoi de photos, galerie plein écran, assurance décennale, intervention rapide, SEO local étendu, WebP, métadonnées Open Graph et données structurées LocalBusiness.

## Formulaire
Le formulaire `demande-devis` utilise Netlify Forms (`data-netlify=true`) et accepte jusqu’à 5 photos côté interface. Après déploiement sur Netlify, vérifier dans **Forms** que le formulaire est bien détecté et configurer la notification e-mail vers `antonywouenzell@yahoo.fr`.

Les images de réalisations déjà présentes ont été conservées. Elles devront être remplacées progressivement par les photos réelles AWZ provenant des sources/archives validées.


V16 : avis Travaux.com ajoutés, hero simplifié, avant/après corrigés sans zoom ni inversion visuelle, pictogrammes métier, nettoyage des images inutilisées, mention 24/7 retirée.


## V19
- suppression du bloc redondant « Nous desservons aussi les villes suivantes » sur les pages locales ; le footer conserve les zones d’intervention ;
- ajout d’un visuel local contextualisé sur chaque page ville + nouvelle page Angers ;
- remplacement des six visuels de services de la homepage par des images propres sans curseur ni élément parasite.


## V20
Pages villes premium : visuel patrimonial intégré au hero, suppression de l'encart City Visual et du bloc zones redondant.


## V21
- Nouvelle page dédiée `zones-intervention.html`.
- Carte interactive OpenStreetMap/Leaflet avec 10 villes cliquables.
- Cartes visuelles des villes reliées à leurs pages locales.
- Header/footer conservés selon le design system existant.
- Liens « Zones d’intervention » du site redirigés vers la nouvelle page.


## V22 — photographies locales réelles
Les visuels des villes ont été remplacés par de vraies photographies issues de Wikimedia Commons. Elles sont servies en WebP via wsrv.nl pour conserver le format optimisé du site. Les crédits/licences figurent dans mentions-legales.html.
