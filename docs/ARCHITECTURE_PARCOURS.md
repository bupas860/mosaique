# Architecture des parcours thématiques

## Trois niveaux à distinguer

Mosaïque sépare trois notions qui ne doivent plus être confondues :

1. **Mosaïque** : le projet et la plateforme pédagogique.
2. **La marche des privilèges** : le dispositif commun, fondé sur des personnages fictifs et des situations contextualisées.
3. **Le parcours thématique** : le corpus de situations, de personnages, de repères et de ressources consacré à un champ de discriminations.

La version actuelle correspond au **parcours LGBTI+**.

## Un deuxième axe : les modes de lecture

Les parcours thématiques sont indépendants des modes de jeu.

Les cinq modes actuels restent transversaux :

- Découverte ;
- Obstacles visibles ;
- Normes ordinaires ;
- Effets invisibles ;
- Intersectionnalités.

À terme, un parcours « Handicap et validisme » pourra donc lui aussi proposer plusieurs de ces modes, sans créer un second moteur de jeu.

## Parcours envisagés

Le catalogue technique distingue actuellement :

- **LGBTI+** — actif ;
- **Handicap et validisme** — planifié ;
- **Égalité filles-garçons** — planifié ;
- **Racisme** — planifié.

Un parcours planifié n’implique pas qu’un contenu soit déjà produit. Il réserve uniquement une place dans l’architecture.

## Règle de conception

Chaque parcours doit pouvoir posséder ses propres :

- personnages ;
- situations ;
- repères ;
- mots utiles ;
- quiz ;
- textes de débrief ;
- ressources et références.

Les composants d’interface, le moteur de sélection, la navigation, les règles d’accessibilité et les mécanismes de partie doivent être mutualisés autant que possible.

Les contenus LGBTI+ ne doivent donc pas être progressivement transformés en un corpus générique mêlant toutes les discriminations. Ils constituent le premier parcours autonome de Mosaïque.

## Intersectionnalité

Un parcours thématique peut contenir des situations qui croisent plusieurs rapports sociaux.

Par exemple, le parcours LGBTI+ actuel contient déjà des situations où l’accès à une ressource LGBTI+ est aussi affecté par le handicap, la neurodivergence, la ruralité ou la précarité.

Cela ne transforme pas pour autant le parcours en parcours « handicap » ou « ruralité » : l’axe LGBTI+ reste le point d’entrée, et l’intersectionnalité permet d’observer comment d’autres rapports sociaux modifient la situation.

## Navigation future

Tant qu’un seul parcours est actif, les routes publiques existantes restent canoniques :

- `#/jouer`
- `#/personnages`
- `#/situations`
- `#/reperes`

Cette règle préserve notamment les liens déjà utilisés dans Éléa.

Lorsque plusieurs parcours seront réellement disponibles, une nouvelle étape de sélection pourra être ajoutée avant la préparation de la partie. Une forme de route telle que `#/parcours/<slug>/...` pourra alors être introduite, avec maintien des anciennes routes comme alias du parcours LGBTI+ afin de préserver les liens existants.

## Identité publique

L’identité recommandée est :

- marque/projet : **Mosaïque** ;
- activité : **La marche des privilèges** ;
- parcours actif : **LGBTI+**.

La page d’accueil peut donc présenter « La marche des privilèges » comme activité et préciser « Parcours actuel : LGBTI+ ».

## Positionnement du terme « marche des privilèges »

Le terme est utilisé comme appellation descriptive d’une méthode pédagogique largement documentée sous les noms « marche des privilèges », « privilege walk » ou variantes proches.

Mosaïque ne revendique pas d’exclusivité sur cette appellation et ne reprend pas automatiquement les listes de questions ou scénarios publiés par d’autres organismes. Les situations du projet sont éditées comme un corpus propre.

Avant un éventuel dépôt de marque, une recherche formelle d’antériorités par classes de produits et services resterait nécessaire.
