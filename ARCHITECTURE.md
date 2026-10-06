# Architecture de Mosaïque

Mosaïque est une application web statique construite avec React, TypeScript et Vite.

## Principes

L’architecture sépare autant que possible :

- le moteur et les composants communs ;
- les parcours thématiques ;
- les données éditoriales ;
- les médias de production ;
- les artefacts publics générés ;
- les scripts de génération, validation et recette.

Le projet distingue également quatre notions :

1. **Mosaïque** — le projet et la plateforme ;
2. **La marche des privilèges** — le dispositif pédagogique ;
3. **le parcours thématique** — le corpus de contenus ;
4. **le mode de jeu** — l’angle de lecture pédagogique.

Le parcours **LGBTI+** est actuellement le seul parcours actif.

## Routage et hébergement

Le routage public repose principalement sur des routes en hash afin de rester compatible avec un hébergement statique. Vite utilise `base: "./"` : les assets restent relatifs et le même build peut être servi depuis GitHub Pages sous `/mosaique/`, depuis un domaine Pages Forge unique à la racine ou depuis une URL Forge avec sous-chemin.

Le paramètre `?context=elea` active une présentation adaptée à l’intégration Éléa.

## Données de parcours

Le contrat cible d’un parcours est documenté dans :

- [`docs/ARCHITECTURE_PARCOURS.md`](docs/ARCHITECTURE_PARCOURS.md)
- [`docs/CONTRAT_DONNEES_PARCOURS.md`](docs/CONTRAT_DONNEES_PARCOURS.md)

Le premier manifeste machine est :

- [`src/data/parcours/lgbti.manifest.json`](src/data/parcours/lgbti.manifest.json)

Le build exécute automatiquement `npm run check:parcours-contract`.

## Organisation principale

```text
src/
  components/        composants d’interface partagés
  data/              données publiques, données générées et manifestes
  features/          espaces fonctionnels
  game/              moteur et interface de partie
  pages/             pages publiques
  utils/             routage et utilitaires

scripts/              génération, validations et recettes
public/               fichiers statiques servis tels quels
docs/                 documentation pédagogique et technique
```

## Sources éditoriales

Certains contrôles amont utilisent un corpus éditorial externe non inclus dans le dépôt. Le build public reste reproductible sans ce corpus.

Voir [`docs/DEVELOPPEMENT.md`](docs/DEVELOPPEMENT.md) pour `MOSAIQUE_IMPORT_DIR` et les contrôles concernés.

## Déploiement

Deux pipelines sont présents pendant la transition :

- GitHub Pages pour la publication actuelle ;
- GitLab Pages pour préparer la Forge des communs numériques éducatifs.

La configuration GitLab Pages utilise le mot-clé actuel `pages.publish: dist`. Après import, l’URL réelle du projet devra encore être vérifiée, mais le build n’est plus dépendant d’un préfixe `/mosaique/` codé en dur.
