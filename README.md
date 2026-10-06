# Mosaïque — La marche des privilèges

**Mosaïque** est une application pédagogique interactive pour explorer la manière dont des situations ordinaires peuvent réduire ou élargir la marge de manœuvre de personnages fictifs.

L’activité principale, **La marche des privilèges**, ne cherche ni à classer les personnes ni à hiérarchiser les discriminations. Elle met en discussion des obstacles, des normes, des protections et des effets parfois difficiles à percevoir.

**Parcours actuellement disponible : LGBTI+.**

[Essayer la version actuellement publiée](https://bupas860.github.io/mosaique/)

> La publication GitHub Pages reste la version publique actuelle pendant la préparation de la migration vers la Forge des communs numériques éducatifs.

## Ce que propose la version actuelle

- 5 modes : **Découverte**, **Obstacles visibles**, **Normes ordinaires**, **Effets invisibles** et **Intersectionnalités** ;
- 17 personnages jouables ;
- 61 situations éditoriales ;
- des parties de 10 situations uniques ;
- des espaces publics consacrés aux personnages, situations, Repères, Mots utiles et quiz ;
- un contexte d’intégration Éléa via `?context=elea` ;
- une interface testée au clavier, sur plusieurs largeurs d’écran et à fort niveau de zoom.

Le parcours LGBTI+ porte principalement sur les LGBTI-phobies, les orientations, les identités et expressions de genre, tout en intégrant leurs intersections avec d’autres rapports sociaux lorsque cela est pertinent.

## Une architecture destinée à plusieurs parcours

**Mosaïque** désigne le projet et la plateforme.  
**La marche des privilèges** désigne le dispositif pédagogique.  
Un **parcours thématique** fournit ensuite son propre corpus de personnages, situations, Repères, vocabulaire et quiz.

Le parcours LGBTI+ est le premier parcours actif. L’architecture réserve déjà la possibilité d’accueillir ultérieurement d’autres parcours, par exemple :

- handicap et validisme ;
- égalité filles-garçons et sexisme ;
- racisme.

Ces parcours futurs sont seulement planifiés : aucun contenu n’est annoncé comme disponible tant qu’il n’a pas été produit, vérifié et activé.

Voir :

- [Architecture des parcours thématiques](docs/ARCHITECTURE_PARCOURS.md)
- [Contrat de données d’un parcours](docs/CONTRAT_DONNEES_PARCOURS.md)
- [Vision pédagogique](docs/000_Vision_du_projet.md)

## Principes pédagogiques

Mosaïque cherche notamment à :

- partir de situations concrètes plutôt que d’identités abstraites ;
- montrer qu’une même situation peut être vécue différemment selon les parcours ;
- éviter de réduire un personnage à une seule caractéristique ;
- faire apparaître l’articulation de plusieurs mécanismes sociaux ;
- rendre visibles les ressources, soutiens et protections autant que les obstacles ;
- proposer des lectures argumentées plutôt qu’une vérité unique sur les personnes ;
- permettre un débrief pédagogique après l’activité.

Le [guide éditorial](docs/007_Guide_editorial.md) précise les principes de rédaction et de représentation.

## Vie privée et fonctionnement

Mosaïque est une application web statique :

- aucun compte utilisateur n’est demandé ;
- aucun serveur applicatif ou base de données distante n’est nécessaire au fonctionnement du jeu ;
- aucun outil de mesure d’audience ou traceur publicitaire n’est intégré ;
- l’état temporaire d’une partie et certains états de navigation utilisent uniquement `sessionStorage` dans le navigateur ;
- les liens vers des sources externes ne sont ouverts qu’à l’initiative de l’utilisateur.

Cette architecture limite fortement la collecte de données. Elle ne dispense pas de refaire une revue RGPD si de futures fonctions ajoutent des comptes, des statistiques ou un stockage distant.

## Accessibilité et qualité

Le dépôt contient une recette navigateur automatisée qui contrôle notamment :

- navigation clavier et gestion du focus ;
- structure des titres et noms accessibles des contrôles ;
- responsive design ;
- zooms 200 % et 400 % ;
- contrastes ;
- galeries, fiches, quiz et partie complète ;
- contexte Éléa ;
- version construite pour publication.

La recette complète est conçue pour être exécutée avec Chrome/Chromium headless.

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Node.js 22 pour le build et l’intégration continue

Le routage public utilise principalement des routes en hash afin de rester compatible avec un hébergement statique.

## Installation locale

Prérequis : **Node.js 22** et npm.

```bash
npm ci
npm run dev
```

Build de production :

```bash
npm run build
```

Contrôles principaux :

```bash
npm run lint
npm run check:parcours-contract
npm run check:data-boundaries
npm run check:bundle-boundaries
npm run check:ui-contracts
npm run check:public-navigation
npm run check:elea-context
npm run test:final-8g
npm run test:final-8g:dist
```

Certains contrôles éditoriaux complets nécessitent un corpus source externe non inclus dans le dépôt. Voir [`docs/DEVELOPPEMENT.md`](docs/DEVELOPPEMENT.md).

## Données éditoriales

Les données utilisées par l’application sont séparées autant que possible du moteur et du code d’interface.

Le parcours LGBTI+ possède un manifeste machine contrôlé automatiquement au build :

[`src/data/parcours/lgbti.manifest.json`](src/data/parcours/lgbti.manifest.json)

Une partie des données est générée à partir de sources éditoriales de travail, puis versionnée sous forme d’artefacts publics contrôlés. Les scripts de génération et de validation se trouvent dans `scripts/`.

Voir également [`src/data/v2/README.md`](src/data/v2/README.md).

## Transparence sur l’usage de l’IA

Des outils d’IA générative ont été utilisés comme assistance pour certaines illustrations, pour la préparation ou la révision de contenus pédagogiques et éditoriaux, ainsi que pour une partie du développement et de la revue du code.

Les choix pédagogiques, la sélection des contenus, les validations, les tests et la responsabilité éditoriale restent humains.

Le projet adopte une **mention centrale de transparence** plutôt qu’un marquage répétitif de chaque fichier. Voir [`NOTICE-AI.md`](NOTICE-AI.md).

## Licences

**Code source : GNU General Public License v3.0 ou ultérieure — `GPL-3.0-or-later`.**  
Copyright © 2026 Pascal Busac. Voir [`LICENSE`](LICENSE).

**Contenus pédagogiques, données éditoriales et illustrations : CC BY 4.0**, dans la mesure des droits effectivement détenus. Voir [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

Les dépendances tierces conservent leurs propres licences.

## Contribuer

Les retours pédagogiques, signalements de bugs et propositions d’amélioration sont bienvenus.

Avant une contribution de code, voir [`CONTRIBUTING.md`](CONTRIBUTING.md). L’architecture multi-parcours doit être respectée : un nouveau thème de discrimination doit être ajouté comme parcours de données plutôt que par duplication du moteur.

## Déploiement

Le déploiement public actuel utilise GitHub Pages depuis `main`.

La branche `prep-forge` prépare l’import sur la **Forge des communs numériques éducatifs** et contient également un pipeline GitLab Pages. Tant que la migration n’est pas validée, `main` et la version GitHub Pages restent la référence publique.

## Documentation

- [Architecture générale](ARCHITECTURE.md)
- [Vision du projet](docs/000_Vision_du_projet.md)
- [Architecture des parcours thématiques](docs/ARCHITECTURE_PARCOURS.md)
- [Contrat de données d’un parcours](docs/CONTRAT_DONNEES_PARCOURS.md)
- [Guide éditorial](docs/007_Guide_editorial.md)
- [Développement et sources éditoriales](docs/DEVELOPPEMENT.md)
- [Feuille de route](ROADMAP.md)
- [Notice IA — transparence et provenance](NOTICE-AI.md)
- [Licence du code — GPL-3.0-or-later](LICENSE)
- [Licence des contenus — CC BY 4.0](LICENSE-CONTENT.md)
