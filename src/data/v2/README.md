# Accès aux données V2

Les données éditoriales V2 proviennent principalement des JSON générés dans `src/data/generated-v2/` et ne doivent pas être éditées manuellement.

Les galeries normalisées sont dans `galleries/`, les cinq modes dans `modes/`, et `index.json` décrit leurs chemins.

## Modes actifs

Les cinq modes sont désormais actifs dans l’application :

- `discovery` — Découverte ;
- `visible-obstacles` — Obstacles visibles ;
- `ordinary-norms` — Normes ordinaires ;
- `invisible-effects` — Effets invisibles ;
- `intersectionalities` — Intersectionnalités.

La liste canonique des modes actifs est portée par `activeModesRuntimeV2.ts`.

## Personnages

La galerie générale utilise les personnages P01 à P09.

Le mode Intersectionnalités utilise séparément XP01 à XP08 avec leur profil canonique et leur portrait explicitement associé à l’identifiant éditorial.

Les portraits de production sont associés par `characterPortraitsV2.ts`.

## Runtime

`activeModesRuntimeV2.ts` fournit l’API utilisée par l’interface pour les cinq modes actifs.

Chaque partie doit produire un lot ordonné de dix situations uniques.

`runtimeIndexV2.ts` expose en parallèle l’API runtime commune et les générateurs spécialisés des cinq modes. Cette API sert aux contrôles et aux usages qui ont besoin d’accéder aux banques normalisées sans passer par les composants d’interface.

Le mode Découverte compose des situations provenant des trois familles générales : Obstacles visibles, Normes ordinaires et Effets invisibles.

Le mode Intersectionnalités utilise sa propre galerie de personnages XP01 à XP08.

## Compatibilité historique

`generatedV2Data.ts` conserve encore certains chargements historiques nécessaires à la compatibilité du runtime et des validations.

`createVisibleObstaclesGameSet()` reste utilisé comme couche historique pour le mode Obstacles visibles, tandis que la couche active normalise sa sortie avec les autres modes.

Ces éléments ne signifient plus que les autres modes sont inactifs : les cinq modes sont bien raccordés au runtime actuel.

## Présentation

La configuration technique de présentation est séparée dans `presentationConfig.ts`.

Les contenus éditoriaux et les règles de jeu doivent rester séparés autant que possible du code de présentation.
