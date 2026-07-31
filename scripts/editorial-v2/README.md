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

## Biographies publiques

La chaîne des biographies publiques lit le document canonique `046`, découpe
chaque fiche avant le volet formateur et autorise uniquement les rubriques 1 à
13. Elle joint ensuite, par identifiant stable, les descriptions courtes des
galeries existantes et les textes alternatifs validés du cahier `074`.

- `parse-public-biographies-v2.mjs` transforme le Markdown en blocs publics
  restreints, sans HTML brut.
- `validate-public-biographies-v2.mjs` contrôle les cardinalités, les sections,
  les homonymes et l’absence de données réservées.
- `import-public-biographies-v2.mjs` écrit atomiquement et de façon déterministe
  `src/data/generated-v2/public-biographies.json`.
- `check-public-biographies-v2.mjs` compare la sortie aux sources et inspecte
  aussi les fichiers textuels de `dist`.

Commandes : `biographies:validate`, `biographies:import`,
`biographies:check-public` et `biographies:check-dist`. Le build exécute la
chaîne complète avant et après Vite.

## Espace Comprendre

La chaîne Comprendre lit exclusivement les douze modules canoniques déclarés
dans `parse-understand-v2.mjs` (M01, M02 et M08 en V3 ; les neuf autres en V2),
ainsi que les documents transversaux 080 à 083. Les documents internes 079 et
084 servent uniquement au contrôle de présence et ne sont jamais sérialisés.

- `understand:validate` contrôle versions, statuts, structures et cardinalités :
  12 modules, 4 ensembles, 4 parcours, 68 notions, 24 situations, 174 sources
  lues dont 164 publiques et 10 internes exclues.
- `understand:import` produit atomiquement et sans horodatage variable les 17
  fichiers de `src/data/generated-v2/understand/`.
- `understand:check-public` reconstruit les données depuis les sources, contrôle
  les relations et refuse identifiants de recherche, références S165 à S174,
  chemins locaux, HTML brut et autres contenus internes.

Deux générations à sources identiques produisent les mêmes octets. Aucun
Markdown n’est interprété dans le navigateur. L’interface, les routes et le
contrôle public de `dist` seront ajoutés dans une mission distincte.
