# Développement et sources éditoriales

Ce document décrit les conditions nécessaires pour reproduire le build de Mosaïque et exécuter les contrôles éditoriaux complets.

## Environnement

Le déploiement GitHub Pages utilise Node.js 22.

Installation :

```bash
npm ci
```

Développement local :

```bash
npm run dev
```

Build de production :

```bash
npm run build
```

Le build de production utilise les artefacts éditoriaux déjà présents dans le dépôt et ne nécessite pas, dans son état actuel, le corpus externe `mosaique-import`.

## Contrôles principaux

```bash
npm run lint
npm run check:data-boundaries
npm run check:bundle-boundaries
npm run check:ui-contracts
npm run check:public-navigation
npm run check:public-addressing
npm run check:elea-context
```

## Corpus éditorial externe

Certains scripts de génération et de contrôle relisent les sources éditoriales de travail.

Ces sources ne sont pas incluses dans ce dépôt Git.

Les scripts cherchent le corpus dans cet ordre :

1. le chemin défini dans la variable d’environnement `MOSAIQUE_IMPORT_DIR` ;
2. à défaut, un dossier frère du dépôt nommé `mosaique-import`.

Exemple :

```bash
export MOSAIQUE_IMPORT_DIR="/chemin/vers/mosaique-import"
npm run check:public-situations
```

Autre organisation possible :

```text
parent/
├── mosaique/
└── mosaique-import/
```

Dans ce cas, aucune variable d’environnement n’est nécessaire.

## Scripts concernés

La dépendance à `MOSAIQUE_IMPORT_DIR` ou `../mosaique-import` est utilisée par les chaînes suivantes :

- situations publiques ;
- personnages publics ;
- repères et mots utiles ;
- quiz publics.

Commandes associées :

```bash
npm run situations:generate-public
npm run check:public-situations

npm run characters:generate-public
npm run check:public-characters

npm run reference:generate-public
npm run check:public-reperes
npm run check:public-useful-words

npm run quiz:generate-public
npm run check:public-character-quiz
npm run check:public-situation-quiz
```

Sans le corpus externe, ces commandes peuvent échouer avec un message demandant de définir `MOSAIQUE_IMPORT_DIR` ou de placer `mosaique-import` à côté du dépôt.

Ce comportement est attendu : il permet de vérifier que les artefacts publics versionnés correspondent toujours aux sources éditoriales de référence.

## Reproductibilité

Un clone autonome du dépôt doit pouvoir :

- installer ses dépendances ;
- lancer l’application ;
- construire `dist` ;
- exécuter les contrôles qui ne nécessitent pas les sources éditoriales externes.

Pour reproduire également les générations et vérifications éditoriales amont, il faut fournir le corpus `mosaique-import`.

Avant d’ouvrir le projet à des contributions externes, il faudra décider si ce corpus doit :

- rester une source de travail séparée ;
- être documenté comme dépendance réservée aux mainteneurs ;
- ou être remplacé progressivement par des sources publiables directement dans le dépôt.

## Branche de préparation Forge

La branche `prep-forge` sert aux travaux de préparation avant migration :

- nettoyage du dépôt ;
- documentation ;
- clarification des licences ;
- préparation de GitLab CI ;
- vérification de la compatibilité GitLab Pages.

La branche `main` reste la source du déploiement GitHub Pages tant que la migration n’est pas validée.
