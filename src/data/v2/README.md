# Accès aux données V2

Les données éditoriales proviennent des JSON générés dans `src/data/generated-v2/` et ne doivent pas être éditées manuellement. Les galeries normalisées sont dans `galleries/`, les cinq modes dans `modes/` et `index.json` décrit leurs chemins.

`generatedV2Data.ts` continue de charger les fichiers historiques `characters.json` et `visible-obstacles.*.json`. Cette couche de compatibilité maintient la frontière runtime du seul mode actuellement activé.

La configuration technique de présentation est séparée dans `presentationConfig.ts` : elle associe explicitement une couleur à chaque personnage et conserve toutes les images à `null`. Aucun portrait historique n’est importé.

`visibleObstaclesRuntimeBank` expose les personnages et situations jouables, leurs mouvements explicites `advance`/`stay`, les feedbacks et les règles. `createVisibleObstaclesGameSet()` utilise le moteur contraint existant pour produire un lot ordonné de dix situations.

Les autres banques sont générées et validées mais ne sont pas encore reliées aux pages React. Découverte ne contient que ses règles et des références `{ id, originMode }` vers les trois banques générales.

`runtimeIndexV2.ts` expose l’API commune `createGameSet()` et les générateurs
spécialisés des cinq modes. Ce point d’entrée est séparé du barrel utilisé par
l’application afin que les banques inactives ne soient pas encore intégrées au
bundle joueur. Les situations communes conservent leur mode d’origine, leur
décision proposée et leur feedback individualisé.

Le moteur historique `createVisibleObstaclesGameSet()` reste inchangé pour
l’interface active. `createCommonVisibleObstaclesGameSet()` fournit en parallèle
la représentation runtime commune.

La galerie générale utilise les personnages jouables P01 à P09 existants.
Intersectionnalités expose séparément XP01 à XP08 avec leur profil canonique et
une image `null`, sans enrichissement éditorial ni rapprochement par prénom.
