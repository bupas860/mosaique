# Accès aux données V2

Cette couche charge les JSON générés dans `src/data/generated-v2/`. Ces fichiers sont produits par le pipeline éditorial et ne doivent pas être édités manuellement.

La couche reste isolée du runtime principal. `visibleObstaclesBank` constitue son point d’entrée prévu pour une future migration du moteur et de l’interface.
