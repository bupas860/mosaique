# Chaîne éditoriale V2

Les sept fichiers Markdown déclarés dans `editorial-config.mjs` sont les seules
sources éditoriales. Les fichiers DOCX et les rapports d’audit ne sont jamais
lus par l’import.

- `editorial-config.mjs` centralise galeries, modes, préfixes, cardinalités,
  protections et règles de sélection.
- `parse-editorial-v2.mjs` contient le parseur commun des galeries, matrices,
  fiches et feedbacks.
- `validate-editorial-v2.mjs` contrôle les structures, références, décisions,
  protections et valeurs combinatoires.
- `selection-analysis.mjs` effectue les audits exhaustifs locaux et agrège les
  signatures du mode Découverte sans matérialiser ses millions de lots.
- `import-editorial-v2.mjs` écrit atomiquement et de façon déterministe
  `src/data/generated-v2/`.
- `check-visible-obstacles-selection.mjs` conserve le nom historique de la
  commande npm mais contrôle désormais les cinq modes.
- `check-runtime-v2.mjs` vérifie les nouvelles banques générées et la frontière
  runtime existante d’Obstacles visibles.

Les anciens fichiers `characters.json` et
`modes/visible-obstacles.*.json` restent générés comme couche de compatibilité
pour le runtime actuellement actif. Les quatre nouveaux modes ne sont pas
encore branchés aux pages React.
