# Illustrations

Déposer les fichiers sans modifier les composants :

- `ui/home-hero.avif` ou `ui/home-hero.webp` pour l’accueil ;
- `characters/P01.avif` ou `characters/P01.webp` pour un personnage ;
- `situations/<identifiant>.webp` pour une situation V2.

AVIF est prioritaire lorsqu’un fichier AVIF et un fichier WebP portent le même nom. Les formats PNG et JPEG sont acceptés comme solutions de repli. Les identifiants et la casse doivent correspondre aux données de l’application.

## Illustrations de situations V2

Les 61 situations sont identifiées par `V01` à `V16`, `N01` à `N13`, `I01` à `I16` et `X01` à `X16`.

- Les masters validés se trouvent dans `docs/illustrations/masters/situations/`.
- Les fichiers utilisés par l’application se trouvent dans `src/assets/illustrations/situations/`.
- Les exports applicatifs sont nommés `<identifiant>.webp`, avec l’identifiant en minuscules.
- Le mapping actif est `src/data/v2/situationIllustrationsV2.ts`.
