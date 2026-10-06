# Feuille de route de Mosaïque

Cette feuille de route décrit les grandes étapes publiques du projet. Elle ne constitue pas un calendrier contractuel.

## Socle actuel

- [x] parcours LGBTI+ jouable ;
- [x] 5 modes de jeu ;
- [x] espaces publics Personnages, Situations, Repères, Mots utiles et Quiz ;
- [x] intégration Éléa par `?context=elea` ;
- [x] contrat de données d’un parcours ;
- [x] manifeste machine du parcours LGBTI+ ;
- [x] licences séparées : GPL-3.0-or-later pour le code, CC BY 4.0 pour les contenus ;
- [x] notice de transparence sur l’usage de l’IA ;
- [x] recette Chrome/Chromium headless ;
- [x] pipeline GitLab Pages préparé.

## Préparation Forge

- [ ] importer le dépôt et son historique sur la Forge des communs numériques éducatifs ;
- [ ] vérifier l’URL GitLab Pages réelle et le `base` Vite ;
- [ ] rejouer le build, la recette Chrome et les liens Éléa depuis la Forge ;
- [ ] renseigner les métadonnées du projet sur la Forge ;
- [ ] décider du rôle futur de GitHub : miroir, archive ou dépôt secondaire ;
- [ ] décider si les masters graphiques doivent être migrés vers Git LFS ;
- [ ] proposer le projet à la Ressourcerie lorsque la publication Forge est stabilisée.

## Multi-parcours

Avant d’activer un deuxième parcours :

- [ ] rendre les identifiants de personnages et situations explicitement dépendants du parcours ;
- [ ] rendre les routes capables de porter un `parcoursId` sans casser les anciennes URL ;
- [ ] adapter la sauvegarde de partie pour enregistrer le parcours ;
- [ ] créer un chargeur de données de parcours ;
- [ ] conserver le parcours LGBTI+ comme référence de compatibilité.

Parcours envisagés, sans contenu annoncé à ce stade :

- handicap et validisme ;
- égalité filles-garçons et sexisme ;
- racisme.

## Principe de progression

Un nouveau parcours ne doit pas être présenté comme disponible avant d’avoir son corpus, ses médias, ses contrôles de qualité et sa validation pédagogique.
