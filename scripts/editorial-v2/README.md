# Pipeline éditorial V2

Les sources canoniques sont exclusivement :

- `docs/editorial-v2/010_Galerie_des_personnages_V2.md` ;
- `docs/editorial-v2/100_Mode_Obstacles_visibles_V1.md`.

Valider les sources avec :

```bash
npm run editorial:validate
```

Générer les données V2 validées avec :

```bash
npm run editorial:import
```

Cette commande génère :

- `src/data/generated-v2/characters.json` ;
- `src/data/generated-v2/modes/visible-obstacles.situations.json` ;
- `src/data/generated-v2/modes/visible-obstacles.matrix.json` ;
- `src/data/generated-v2/modes/visible-obstacles.feedbacks.json` ;
- `src/data/generated-v2/modes/visible-obstacles.rules.json` ;
- `src/data/generated-v2/modes/visible-obstacles.manifest.json`.

Le parseur charge en mémoire les personnages, les situations, la matrice, les feedbacks individualisés et les règles de sélection. Le validateur contrôle leur complétude, leur cohérence, les totaux attendus et les 1 123 combinaisons de tirage valides.

Les JSON générés sont déterministes et ne doivent pas être édités manuellement. Ils ne sont pas encore consommés par l’application. Les JSON historiques et l’ancien pipeline `scripts/import-editorial-data.mjs` restent inchangés.

## Moteur de sélection Obstacles visibles

Le moteur sélectionne huit situations variables et ajoute les deux situations obligatoires V09 et V10. Il énumère les 3 003 combinaisons possibles, met en cache les 1 123 combinaisons valides, puis choisit et mélange un lot grâce à une fonction aléatoire injectable.

Le vérifier avec :

```bash
npm run editorial:check-selection
```

Le moteur reste indépendant de React et n’est pas encore connecté à l’application.
