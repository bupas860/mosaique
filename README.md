# Mosaïque — La marche des privilèges

**Mosaïque** est un projet pédagogique consacré à la compréhension des mécanismes sociaux qui influencent les parcours de vie.

Son expérience principale, **La marche des privilèges**, propose d’incarner différents personnages confrontés à des situations ordinaires. Le but n’est pas de classer les personnes ni les souffrances, mais de rendre visibles des obstacles, des normes, des protections et des effets parfois difficiles à percevoir.

## État actuel

L’application comprend actuellement :

- 5 modes jouables : **Découverte**, **Obstacles visibles**, **Normes ordinaires**, **Effets invisibles** et **Intersectionnalités** ;
- 17 personnages jouables : 9 personnages généraux et 8 personnages intersectionnels ;
- 61 situations éditoriales ;
- des parties de 10 situations uniques ;
- des espaces publics consacrés aux personnages, aux situations, aux repères, aux mots utiles et aux quiz ;
- un contexte d’intégration Éléa pris en charge par le paramètre `?context=elea`.

Le projet est conçu pour des usages pédagogiques en autonomie, en classe, en formation ou en accompagnement collectif.

### Parcours thématique actuel

La version actuelle correspond au **parcours LGBTI+**. Ses situations sont centrées sur les LGBTI-phobies, les orientations, les identités et expressions de genre, ainsi que sur leurs intersections avec d’autres rapports sociaux.

Mosaïque est conçu pour pouvoir accueillir d’autres parcours thématiques sans dupliquer le moteur de jeu, notamment autour du handicap et du validisme, de l’égalité filles-garçons et du sexisme, ou du racisme.

## Principes pédagogiques

Mosaïque cherche notamment à :

- partir de situations concrètes plutôt que d’identités abstraites ;
- montrer qu’une même situation peut être vécue différemment selon les parcours ;
- éviter les personnages réduits à une seule caractéristique ;
- prendre en compte plusieurs mécanismes sociaux et leur articulation ;
- montrer aussi les ressources, les soutiens et les protections ;
- proposer des lectures argumentées plutôt qu’une vérité unique sur les personnes.

La vision détaillée du projet se trouve dans [`docs/000_Vision_du_projet.md`](docs/000_Vision_du_projet.md).

## Architecture multi-parcours

Mosaïque distingue le projet, l’activité **La marche des privilèges**, le **parcours thématique** et les **modes de jeu**. Cette séparation permet de faire évoluer les corpus sans transformer les cinq modes actuels en catégories de discriminations.

Voir [`docs/ARCHITECTURE_PARCOURS.md`](docs/ARCHITECTURE_PARCOURS.md) et [`docs/CONTRAT_DONNEES_PARCOURS.md`](docs/CONTRAT_DONNEES_PARCOURS.md).

## Technologies

Le projet utilise notamment :

- React 19 ;
- TypeScript ;
- Vite ;
- Tailwind CSS ;
- Node.js 22 pour le build et l’intégration continue.

Le routage public repose principalement sur des routes en hash, ce qui permet un hébergement statique.

## Installation locale

Prérequis : Node.js 22 et npm.

```bash
npm ci
npm run dev
```

Pour construire la version de production :

```bash
npm run build
```

Pour contrôler le code :

```bash
npm run lint
npm run check:data-boundaries
npm run check:bundle-boundaries
npm run check:ui-contracts
npm run check:public-navigation
npm run check:elea-context
```

Certains contrôles éditoriaux complets nécessitent un corpus source externe non inclus dans ce dépôt. Voir [`docs/DEVELOPPEMENT.md`](docs/DEVELOPPEMENT.md).

## Données éditoriales

Les données utilisées par l’application sont séparées du moteur et du code d’interface.

Une partie des données est générée à partir de sources éditoriales de travail, puis versionnée sous forme d’artefacts publics contrôlés. Les scripts de génération et de validation sont conservés dans `scripts/`.

La documentation technique des données V2 se trouve dans [`src/data/v2/README.md`](src/data/v2/README.md).

## Transparence sur l’usage de l’IA

Des outils d’IA générative ont été utilisés comme assistance pour certaines illustrations, pour la préparation ou la révision de contenus pédagogiques et éditoriaux, ainsi que pour une partie du développement et de la revue du code.

Les choix pédagogiques, la sélection des contenus, les validations, les tests et la responsabilité éditoriale restent humains. Le projet adopte une mention centrale de transparence plutôt qu’un marquage répétitif de chaque fichier.

Voir [`NOTICE-AI.md`](NOTICE-AI.md) pour la politique de provenance et de transparence.

## Déploiement

Le déploiement actuel est réalisé sur GitHub Pages depuis la branche `main`, via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

La branche `prep-forge` prépare une migration vers la **Forge des communs numériques éducatifs**. Tant que cette migration n’est pas validée, `main` et le déploiement GitHub Pages restent inchangés.

## Licences

**Code source : GNU General Public License v3.0 ou ultérieure — `GPL-3.0-or-later`.**  
Copyright © 2026 Pascal Busac. Voir [`LICENSE`](LICENSE).

**Contenus pédagogiques, données éditoriales et illustrations : CC BY 4.0**, dans la mesure des droits effectivement détenus. Voir [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

Cette séparation permet de garder le logiciel sous une licence libre à réciprocité tout en utilisant une licence adaptée aux ressources éducatives.

## Documentation utile

- [Vision du projet](docs/000_Vision_du_projet.md)
- [Architecture des parcours thématiques](docs/ARCHITECTURE_PARCOURS.md)
- [Contrat de données d’un parcours](docs/CONTRAT_DONNEES_PARCOURS.md)
- [Guide éditorial](docs/007_Guide_editorial.md)
- [Développement et sources éditoriales](docs/DEVELOPPEMENT.md)
- [Notice IA — transparence et provenance](NOTICE-AI.md)
- [Licence du code — GPL-3.0-or-later](LICENSE)
- [Licence des contenus — CC BY 4.0](LICENSE-CONTENT.md)
