# Validation éditoriale V2

Les sources canoniques sont exclusivement :

- `docs/editorial-v2/010_Galerie_des_personnages_V2.md` ;
- `docs/editorial-v2/100_Mode_Obstacles_visibles_V1.md`.

Lancer la validation avec :

```bash
npm run editorial:validate
```

Le parseur charge en mémoire les personnages, les situations du mode Obstacles visibles, la matrice, les feedbacks individualisés et les règles de sélection. Le validateur contrôle leur complétude, leur cohérence, les totaux attendus et les 1 123 combinaisons de tirage valides.

Cette étape ne génère aucun JSON V2. Les JSON existants et l’ancien pipeline `scripts/import-editorial-data.mjs` restent inchangés.
