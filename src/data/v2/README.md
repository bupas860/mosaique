# Accès aux données V2

Les données éditoriales proviennent des JSON générés dans `src/data/generated-v2/` et ne doivent pas être éditées manuellement. `generatedV2Data.ts` contrôle et expose cette frontière éditoriale.

La configuration technique de présentation est séparée dans `presentationConfig.ts` : elle associe explicitement une couleur à chaque personnage et conserve toutes les images à `null`. Aucun portrait historique n’est importé.

`visibleObstaclesRuntimeBank` expose les personnages et situations jouables, leurs mouvements explicites `advance`/`stay`, les feedbacks et les règles. `createVisibleObstaclesGameSet()` utilise le moteur contraint existant pour produire un lot ordonné de dix situations.

Cette banque est encore isolée du runtime principal et n’est importée par aucune page React. Les valeurs `null` permettront aux futurs composants d’afficher les placeholders existants.
