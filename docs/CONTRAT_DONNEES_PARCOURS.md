# Contrat de données d’un parcours Mosaïque

## Objet

Ce document définit le contrat commun permettant d’ajouter un parcours thématique à **Mosaïque — La marche des privilèges** sans dupliquer le moteur de jeu.

Le contrat sépare :

- le moteur et les composants partagés ;
- l’identité du parcours ;
- les personnages ;
- les situations et règles de sélection ;
- les contenus publics d’accompagnement ;
- les médias ;
- les contrôles de qualité et de publication.

Le premier parcours conforme est **LGBTI+**. Les futurs parcours Handicap et validisme, Égalité filles-garçons / sexisme ou Racisme devront satisfaire le même contrat.

## 1. Identité obligatoire

Chaque parcours possède un manifeste avec :

- `schemaVersion` : version du contrat ;
- `id` : identifiant technique stable ;
- `slug` : segment d’URL futur ;
- `publicLabel` : libellé court affichable ;
- `title` : intitulé développé ;
- `description` : description pédagogique ;
- `status` : `draft`, `playable`, `active` ou `archived` ;
- `scope` : thèmes principaux et axes intersectionnels assumés.

Un parcours ne doit pas être présenté comme disponible lorsque son statut n’est pas `active`.

## 2. Identifiants et espace de noms

Les identifiants de personnages et de situations sont **locaux au parcours**.

Le parcours LGBTI+ peut donc conserver ses identifiants historiques `P01`, `XP01`, `V01`, etc.

Lorsqu’un identifiant global est nécessaire, la forme canonique est :

```text
<parcoursId>:<identifiantLocal>
```

Exemples :

```text
lgbti:P01
lgbti:V01
handicap-validisme:P01
```

Cette règle évite d’imposer un renommage destructif au corpus LGBTI+ tout en permettant à chaque nouveau parcours de repartir avec une nomenclature locale lisible.

## 3. Modes de jeu

Un parcours déclare :

- un mode par défaut ;
- la liste des modes disponibles ;
- ses banques de situations et règles de sélection pour chaque mode.

Les cinq modes actuellement pris en charge par le moteur sont :

- `discovery` ;
- `visible-obstacles` ;
- `ordinary-norms` ;
- `invisible-effects` ;
- `intersectionalities`.

Le **parcours thématique** et le **mode de jeu** sont deux axes différents. Un futur parcours Handicap peut utiliser plusieurs de ces modes.

## 4. Personnages

Un parcours jouable doit fournir au moins une galerie de personnages.

Pour chaque personnage public, le parcours doit disposer au minimum de :

- un identifiant local stable ;
- un nom ;
- un âge ;
- un niveau ou contexte scolaire ;
- les informations utiles à l’incarnation et aux accords ;
- une présentation publique ;
- un portrait ou une règle explicite d’absence de portrait ;
- un texte alternatif lorsque le portrait est informatif ;
- les données nécessaires aux effets des situations ;
- les éventuelles biographies publiques.

Les personnages ne doivent pas être réduits à une caractéristique protégée ou à un mécanisme de discrimination.

Une galerie intersectionnelle séparée est possible mais n’est pas obligatoire pour tous les parcours.

## 5. Situations

Une situation jouable doit fournir au minimum :

- un identifiant local stable ;
- un mode ou une famille d’analyse ;
- un titre ;
- le texte présenté au joueur ;
- une question de décision ;
- le mécanisme pédagogique étudié ;
- un rôle principal : obstacle ou protection ;
- les effets proposés pour les personnages concernés ;
- un feedback argumenté par personnage ;
- les éventuels champs d’interprétation, vigilance et test intersectionnel ;
- les données publiques nécessaires à la fiche Situation ;
- une illustration ou une règle explicite d’absence d’illustration ;
- un texte alternatif lorsque l’image est informative.

Un parcours doit disposer d’un nombre suffisant de situations pour satisfaire ses règles de tirage. Pour le moteur actuel, une partie complète contient dix situations uniques.

## 6. Focales et familles d’analyse

Les focales actuelles V, N, I et X correspondent respectivement à :

- Obstacles visibles ;
- Normes ordinaires ;
- Effets invisibles ;
- Intersectionnalités.

Elles constituent aujourd’hui la grammaire commune de Mosaïque.

Un nouveau parcours doit réutiliser ces focales tant qu’aucune évolution du moteur n’a été décidée. Les catégories de discrimination ne doivent pas devenir des focales : « LGBTI+ », « Handicap » ou « Racisme » sont des **parcours**, pas des modes.

## 7. Contenus publics d’accompagnement

Un parcours publiable peut fournir :

- des Repères ;
- des Mots utiles ;
- des Mots et parcours ;
- un quiz Personnages ;
- un quiz Situations ;
- des ressources et références.

Le manifeste indique les chemins et cardinalités attendues.

Ces contenus doivent être rattachés au parcours et ne pas être injectés implicitement dans les autres parcours.

## 8. Médias, accessibilité et provenance

Chaque parcours indique les racines de ses médias.

Les exigences minimales sont :

- formats web adaptés pour les médias servis au public ;
- textes alternatifs pour les images informatives ;
- absence de dépendance à un chemin local de poste de travail ;
- provenance et licence documentées ;
- conservation des signaux de provenance C2PA lorsqu’ils existent et qu’aucune transformation nécessaire ne les retire ;
- aucune obligation de publier les prompts de travail.

Les masters lourds peuvent rester hors du bundle public et, à terme, être placés sous Git LFS si l’infrastructure Forge retenue le permet.

## 9. Niveaux de maturité

### draft

Le périmètre et les sources éditoriales existent, mais le parcours n’est pas jouable.

### playable

Le parcours possède au minimum :

- une galerie jouable ;
- un mode disponible ;
- des situations et règles permettant de produire une partie complète ;
- les feedbacks nécessaires.

### active

Le parcours est publiable et doit en plus avoir :

- ses données publiques cohérentes ;
- ses médias accessibles ;
- les contrôles automatiques réussis ;
- sa licence et sa provenance documentées ;
- sa navigation et son intégration Éléa vérifiées lorsqu’elles sont exposées.

### archived

Le parcours reste conservé mais ne doit plus être proposé comme actif.

## 10. Compatibilité des routes

Tant que LGBTI+ est le seul parcours actif, les routes historiques restent canoniques.

Quand plusieurs parcours seront actifs, la cible envisagée est :

```text
#/parcours/<slug>/jouer
#/parcours/<slug>/personnages
#/parcours/<slug>/situations
#/parcours/<slug>/reperes
```

Les anciennes routes devront rester des alias du parcours LGBTI+ afin de préserver les liens déjà utilisés dans Éléa.

## 11. Manifeste machine

Chaque parcours actif doit disposer d’un fichier :

```text
src/data/parcours/<id>.manifest.json
```

Le manifeste décrit l’inventaire publié et les chemins canoniques. Il ne remplace pas les données métier ; il permet au build de vérifier que le paquet de contenu attendu est complet.

Le parcours LGBTI+ fournit le premier manifeste de référence.

## 12. Contrôles automatiques

La commande :

```bash
npm run check:parcours-contract
```

doit vérifier au minimum :

- présence et version du manifeste ;
- unicité des modes ;
- présence du mode par défaut ;
- existence des fichiers déclarés ;
- cardinalités des personnages, repères, mots utiles et quiz ;
- nombre et répartition des situations publiques ;
- cohérence des galeries du parcours actif.

Ce contrôle est destiné à devenir une barrière commune du build pour tout nouveau parcours.
