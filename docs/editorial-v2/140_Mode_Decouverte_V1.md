---
document_id: mosaique-mode-discovery-v1
version: "1.0"
status: frozen
mode_id: discovery
bank_type: transversal
own_situation_count: 0
cards_per_game: 10
character_count: 9
source_mode_count: 3
intersectional_included: false
character_gallery: mosaique-gallery-characters-v2
source: "Mosaique_Mode_Decouverte_V1(1).docx"
---

# Mosaïque — Mode « Découverte »

**Document de fonctionnement — Version 1.0 figée**

Parcours transversal • 10 situations • 9 personnages de la galerie générale

Obstacles visibles • Normes ordinaires • Effets invisibles

*Projet pédagogique en contexte lycée*

> **PRINCIPE : LE MODE DÉCOUVERTE NE CRÉE AUCUNE SITUATION PROPRE**

## 1. Objet et statut du document

Ce document fixe le fonctionnement éditorial et technique du mode « Découverte » de Mosaïque. Ce mode constitue le parcours transversal recommandé pour une première partie. Il permet de rencontrer, dans une même marche, des obstacles visibles, des normes ordinaires et des effets invisibles.

Les textes, matrices, mécanismes et retours individualisés restent administrés dans les trois documents sources. Le mode Découverte ne les copie pas et conserve leurs identifiants d’origine.

> Principe de gel : toute modification d’une banque source, d’un profil général ou d’une règle de tirage doit entraîner une nouvelle validation du mode Découverte.

## 2. Sources utilisées

| Mode source | Identifiant technique | Cartes par partie | Ce qu’il fait observer |
| --- | --- | --- | --- |
| Obstacles visibles | `visible-obstacles` | 3 | Paroles, actes, refus, rumeurs ou réactions directement observables. |
| Normes ordinaires | `ordinary-norms` | 3 | Procédures, catégories, espaces et pratiques présentées comme neutres. |
| Effets invisibles | `invisible-effects` | 4 | Absences, représentations, cadrages, anticipation et autocensure. |

> Répartition fixe : 3 + 3 + 4 = 10 situations.

Documents canoniques requis :

- `010_Galerie_des_personnages_V2.md`, version 2.1 ;
- `100_Mode_Obstacles_visibles_V1.md` ;
- `110_Mode_Normes_ordinaires_V1.md` ;
- `120_Mode_Effets_invisibles_V1.md`.

## 3. Exclusion du mode « Intersectionnalités »

Aucune situation X01 à X16 n’est utilisée. Le mode « Intersectionnalités » possède une galerie spécifique `XP01` à `XP08` et des situations écrites pour des interactions précises entre plusieurs rapports sociaux.

Mélanger ces cartes avec la galerie générale rendrait plusieurs décisions artificielles ou indécidables. Une éventuelle découverte intersectionnelle constituerait un autre parcours.

## 4. Galerie utilisée

Le joueur choisit l’un des neuf personnages de la galerie générale `P01` à `P09`. Le personnage doit être choisi avant le tirage, car plusieurs contraintes dépendent de sa matrice.

## 5. Déroulement d’une partie

1. Le joueur choisit le mode « Découverte ».
2. Il choisit l’un des neuf personnages de la galerie générale.
3. Le moteur constitue un lot valide de dix situations : trois V, trois N et quatre I.
4. Le moteur ordonne les dix cartes selon les contraintes de progression.
5. Pour chaque carte, le joueur décide si le personnage avance ou reste sur place.
6. Après la décision, l’application affiche l’interprétation proposée, le retour individualisé, le mécanisme et la famille d’origine.
7. Le bilan présente le parcours du personnage et les écarts de lecture dans les trois familles.

## 6. Question et feedback

Question affichée : « Dans cette situation, que se passe-t-il pour [Prénom] ? »

- [Prénom] avance
- [Prénom] reste sur place

Après la réponse, l’application affiche :

- Votre réponse : avance / reste sur place.
- Interprétation proposée : avance / reste sur place.
- Pourquoi pour [Prénom] : retour individualisé provenant du document source.
- Mécanisme en jeu : mécanisme de la situation source.
- Famille : obstacle visible, norme ordinaire ou effet invisible.

> La famille n’est pas affichée avant la décision. Elle est révélée dans le feedback afin de ne pas orienter la réponse.

## 7. Règles obligatoires de sélection

### 7.1 Quotas

- exactement 3 cartes issues de `visible-obstacles` ;
- exactement 3 cartes issues de `ordinary-norms` ;
- exactement 4 cartes issues de `invisible-effects` ;
- aucun doublon.

### 7.2 Situations protectrices

La partie contient exactement deux protections :

- chacune provient d’un mode source différent ;
- le troisième mode ne fournit aucune protection ;
- un mode ne fournit jamais ses deux protections ;
- les huit autres cartes sont non protectrices ;
- les deux protections produisent toujours une avance pour les neuf personnages.

Protections disponibles :

| Mode source | Protections |
| --- | --- |
| Obstacles visibles | V09, V10 |
| Normes ordinaires | N12, N13 |
| Effets invisibles | I14, I15 |

### 7.3 Effets pour le personnage choisi

- le personnage reste sur place dans au moins une carte de chacune des trois familles ;
- sur l’ensemble des dix cartes, il reste sur place entre 3 et 7 fois ;
- Arthur reçoit obligatoirement I16 — Un seul modèle de garçon.

### 7.4 Diversité thématique

- au maximum une carte parmi V05, V13, V14 et V15 ;
- au maximum une carte parmi N04, N05 et N11 ;
- parmi les quatre cartes I, au moins une appartient à I01–I05 ;
- parmi les quatre cartes I, au moins une appartient à I06–I11 ou I16 ;
- pour Jade ou Mehdi, au moins une carte discriminante parmi I12 ou I13 est présente ;
- pour Camille, I13 est présente ;
- pour les autres personnages, I12 et I13 ne sont pas obligatoires, car elles produisent toutes deux une avance ; une autre carte I discriminante garantit alors l’obstacle dans cette famille.

> Cette dernière règle formalise la mention « sauf impossibilité liée au personnage » du document d’origine : la carte d’anticipation doit produire un effet réel pour le personnage, et non être présente uniquement pour satisfaire une catégorie.

## 8. Algorithme de constitution

Le moteur ne doit pas construire les millions de lots complets en mémoire.

1. Générer les sous-ensembles locaux valides : 3 cartes V, 3 cartes N et 4 cartes I.
2. Écarter localement les sous-ensembles contenant deux protections, aucun obstacle pour le personnage ou une violation thématique.
3. Tirer aléatoirement un sous-ensemble dans chacune des trois listes.
4. Accepter le triplet seulement s’il contient exactement deux protections de deux modes différents et entre 3 et 7 obstacles au total.
5. En cas d’échec, recommencer à l’étape 3.

L’audit exhaustif montre qu’après le filtrage local, un lot complet est accepté en moyenne après environ quatre à cinq essais selon le personnage. Cette méthode reste simple et ne crée pas de boucle longue.

## 9. Ordonnancement des dix cartes

Une fois le lot sélectionné, le moteur cherche un ordre satisfaisant toutes les contraintes :

- deux cartes consécutives ne proviennent jamais du même mode source ;
- la première carte n’est pas protectrice ;
- les deux protections ne sont pas consécutives ;
- au moins une protection apparaît dans les trois dernières cartes ;
- la série ne contient jamais plus de trois décisions identiques consécutives selon la matrice.

La répartition 3 V, 3 N et 4 I permet une alternance complète des modes. L’audit confirme que tout lot valide peut être ordonné selon ces cinq contraintes.

## 10. Bilan de fin de partie

| Élément | Affichage attendu |
| --- | --- |
| Parcours du personnage | Nombre de cartes où le personnage avance et position finale. |
| Lecture globale | « Votre lecture rejoint l’interprétation proposée dans X situations sur 10. » |
| Lecture par famille | Nombre de concordances : Obstacles visibles X/3 ; Normes ordinaires X/3 ; Effets invisibles X/4. |
| Situations à revoir | Liste des cartes pour lesquelles la réponse diffère de l’interprétation proposée. |

> Ces résultats ne constituent pas une note morale. Ils permettent d’identifier les familles de mécanismes les plus facilement reconnues et celles qui ont davantage surpris le joueur.

## 11. Données techniques

| Champ | Valeur ou règle |
| --- | --- |
| `modeId` | `discovery` |
| `bankType` | `transversal` |
| `characterPool` | Galerie générale P01 à P09 |
| `sourceModes` | `visible-obstacles`, `ordinary-norms`, `invisible-effects` |
| `situationCounts` | `{ visible: 3, ordinary: 3, invisible: 4 }` |
| `protectiveCount` | 2 exactement, provenant de deux modes différents |
| `intersectionalIncluded` | `false` |
| `feedbackSource` | Carte et personnage du mode source |
| `originMode` | Conservé et révélé seulement après la décision |

Structure minimale d’une carte réutilisée :

```text
{
  id,
  originMode,
  title,
  playerText,
  mechanism,
  effectsByCharacter,
  feedbacksByCharacter,
  protective
}
```

Le mode Découverte stocke uniquement les identifiants du lot et les métadonnées d’origine. Il ne duplique pas les textes, matrices ou feedbacks.

## 12. Contrôles de validation

- exactement 10 cartes ;
- exactement 3 V, 3 N et 4 I ;
- aucune carte X ;
- personnages P01 à P09 uniquement ;
- exactement deux protections de deux modes différents ;
- au moins un obstacle dans chaque famille ;
- entre 3 et 7 obstacles au total ;
- I16 obligatoire pour Arthur ;
- contraintes thématiques respectées ;
- aucun identifiant dupliqué ;
- chaque feedback correspond au personnage et à la carte source ;
- famille masquée avant la décision et révélée après ;
- ordre conforme aux cinq contraintes ;
- bilan non présenté comme une note morale.
