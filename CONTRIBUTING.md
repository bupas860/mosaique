# Contribuer à Mosaïque

Merci de l’intérêt porté à Mosaïque.

Le projet cherche à rester à la fois pédagogique, accessible, libre et réutilisable. Les contributions peuvent concerner le code, l’accessibilité, les contenus, les tests ou l’architecture multi-parcours.

## Avant de modifier le code

Prérequis : Node.js 22 et npm.

```bash
npm ci
npm run dev
```

Avant de proposer une modification :

```bash
npm run build
npm run lint
npm run check:public-navigation
npm run check:elea-context
```

Pour une modification d’interface ou de navigation, exécuter également :

```bash
npm run test:final-8g
npm run test:final-8g:dist
```

## Parcours thématiques

Un nouveau champ de discriminations ne doit pas être ajouté en dupliquant le moteur.

Lire d’abord :

- [`docs/ARCHITECTURE_PARCOURS.md`](docs/ARCHITECTURE_PARCOURS.md)
- [`docs/CONTRAT_DONNEES_PARCOURS.md`](docs/CONTRAT_DONNEES_PARCOURS.md)

Le parcours LGBTI+ est actuellement le seul parcours actif. Les autres parcours mentionnés dans le dépôt sont des réservations d’architecture, pas des contenus déjà disponibles.

## Contenus éditoriaux

Une partie des données publiques est générée à partir de sources éditoriales de travail.

Certains contrôles nécessitent donc `MOSAIQUE_IMPORT_DIR` ou un dossier frère `mosaique-import`. Voir [`docs/DEVELOPPEMENT.md`](docs/DEVELOPPEMENT.md).

Une contribution qui ne dispose pas de ces sources doit rester capable de lancer le build public et les contrôles ne dépendant pas de ce corpus.

## Accessibilité

Les contributions ne doivent pas dégrader :

- la navigation clavier ;
- le focus visible ;
- la structure des titres ;
- les noms accessibles ;
- le responsive design ;
- les zooms élevés ;
- les contrastes.

## IA générative

L’usage d’une IA comme assistance n’est pas interdit. Toute contribution doit toutefois rester relue et validée humainement, respecter les licences applicables et ne pas masquer volontairement une provenance significative.

Voir [`NOTICE-AI.md`](NOTICE-AI.md).

## Licences

En contribuant au **code**, la contribution est destinée à être distribuée sous **GPL-3.0-or-later**.

Les contributions aux **contenus pédagogiques, données éditoriales et illustrations** sont destinées à être distribuées sous **CC BY 4.0**, dans la mesure des droits effectivement détenus.

Ne pas ajouter de contenu tiers dont la licence serait incompatible ou incertaine.

## Proposer un changement

Pour un changement important, il est préférable d’ouvrir d’abord un ticket expliquant :

- le besoin pédagogique ou technique ;
- le comportement attendu ;
- les parcours concernés ;
- l’impact éventuel sur les routes, Éléa, les données ou l’accessibilité.

Les corrections ciblées peuvent être proposées directement avec une description précise et les contrôles exécutés.
