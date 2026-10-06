# Préparation des métadonnées publiques pour la Forge

Ce document conserve les valeurs proposées pour la création ou l’import du projet sur la Forge des communs numériques éducatifs.

Elles pourront être ajustées après vérification de l’URL Pages réelle.

## Projet

**Nom :** Mosaïque

**Chemin / slug recommandé :** `mosaique`

**Visibilité :** publique

**Description courte proposée :**

> Application pédagogique interactive pour explorer les mécanismes de privilèges et de discriminations — parcours actuel LGBTI+, architecture multi-parcours.

**Auteur / porteur :** Pascal Busac

## Tags / topics proposés

- éducation
- ressource éducative libre
- LGBTI+
- discriminations
- EVARS
- accessibilité
- Éléa
- marche des privilèges
- React
- TypeScript

Pour GitHub, utiliser des topics normalisés en minuscules et sans espaces, par exemple :

`education`, `open-educational-resources`, `lgbti`, `discrimination`, `privilege-walk`, `accessibility`, `elea`, `react`, `typescript`.

## Licences

- code : `GPL-3.0-or-later` ;
- contenus pédagogiques, données éditoriales et illustrations : `CC BY 4.0`, dans la mesure des droits effectivement détenus.

Les fichiers canoniques sont `LICENSE`, `LICENSE-CONTENT.md` et `NOTICE-AI.md`.

## Page publique

La page publique doit rendre visibles :

- le nom Mosaïque ;
- l’auteur Pascal Busac ;
- la licence du code ;
- la licence des contenus ;
- le parcours actif LGBTI+.

## Ressourcerie

Une proposition à la Ressourcerie pourra être faite une fois l’import Forge et GitLab Pages stabilisés.

Les métadonnées de la Ressourcerie sont gérées séparément du dépôt. Préparer alors un titre court, une description factuelle, les catégories pédagogiques, les tags, une image de présentation et les liens vers la page publique et le dépôt Forge.

## URL

Ne pas figer de nouvelle URL canonique avant le premier déploiement Forge.

La version actuellement publique reste :

https://bupas860.github.io/mosaique/

Après import, vérifier l’URL GitLab Pages réelle avant de modifier les métadonnées de dépôt et les liens publics. `vite.config.ts` utilise désormais `base: "./"`, de sorte que les assets ne dépendent plus d’un préfixe d’URL Forge particulier.
