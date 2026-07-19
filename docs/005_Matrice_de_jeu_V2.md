# 005 — Matrice de jeu (V2)

## Rôle du document

La matrice de jeu est le document de référence qui traduit les règles du moteur en résultats concrets.

Chaque résultat est la conséquence de :

1. la situation ;
2. des mécanismes sociaux mobilisés ;
3. des caractéristiques du personnage.

Le document ne contient pas les débriefs détaillés. Il expose la logique qui permettra de les produire.

---

# 1. Matrice générale

| Situation | M001/M... | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 |
|-----------|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| S01 – Le premier appel | M003, M007 | 0 | +1 | 0 | +1 | +1 | +1 | +1 | 0 |
| S02 – Les toilettes | M002 | 0 | +1 | 0 | +1 | +1 | +1 | +1 | 0 |
| S03 – Le formulaire | M004, M008 | +1 | +1 | +1 | +1 | 0 | +1 | 0 | +1 |
| S04 – Les vestiaires | M002 | 0 | +1 | 0 | +1 | +1 | +1 | +1 | 0 |
| S05 – Le voyage scolaire | M002 | 0 | +1 | 0 | +1 | +1 | +1 | +1 | 0 |
| … | … | … | … | … | … | … | … | … | … |

> **Remarque :** les mécanismes indiqués sont ceux qui expliquent le résultat. Ils devront être complétés et validés au fur et à mesure de la conception.

---

# 2. Analyse par situation

Chaque situation est analysée selon le même modèle.

## Modèle

### Situation

Sxx — Nom de la situation

### Mécanismes mobilisés

- Mxxx
- Mxxx

### Résultats

| Personnage | Résultat | Justification synthétique |
|------------|:--------:|---------------------------|
| P01 | 0 | Le mécanisme rencontre une caractéristique du personnage. |
| P02 | +1 | Aucun obstacle identifié. |

### Analyse

- Nombre de personnages concernés.
- Caractéristiques communes.
- Points de vigilance pour le débrief.

---

# 3. Analyse par personnage

Chaque personnage dispose d'une vue d'ensemble.

## Modèle

### Personnage

Pxx — Nom

### Situations avec obstacle

- S01
- S04
- S12

### Mécanismes rencontrés

- M002
- M007
- M008

### Bilan

- Nombre total d'obstacles.
- Principaux mécanismes rencontrés.
- Équilibre du parcours.

---

# 4. Vérification de cohérence

Cette section permet d'équilibrer le jeu.

## Répartition des obstacles par personnage

| Personnage | Obstacles | % des situations |
|------------|----------:|-----------------:|
| P01 | à calculer | |
| P02 | à calculer | |
| P03 | à calculer | |
| P04 | à calculer | |
| P05 | à calculer | |
| P06 | à calculer | |
| P07 | à calculer | |
| P08 | à calculer | |

## Répartition des mécanismes

| Mécanisme | Nombre de situations |
|-----------|---------------------:|
| M001 | à calculer |
| M002 | à calculer |
| M003 | à calculer |
| … | … |

Cette vue permet de détecter :
- les mécanismes surreprésentés ;
- les mécanismes peu exploités ;
- les personnages trop ou trop peu exposés aux obstacles.

---

# 5. Principes éditoriaux

- Les résultats ne sont jamais arbitraires.
- Chaque résultat doit pouvoir être relié à un ou plusieurs mécanismes sociaux.
- Une identité ne produit jamais un obstacle en elle-même.
- Les mécanismes sociaux expliquent les différences de résultats entre les personnages.
- Toute nouvelle situation doit pouvoir être intégrée à cette matrice sans modifier les règles du moteur.

---

# Évolution prévue

Cette V2 constitue le référentiel de conception.

La version utilisée par le moteur du jeu pourra ensuite être générée automatiquement à partir :
- des situations ;
- des personnages ;
- des mécanismes sociaux ;
- des règles du moteur.
