# 004 — Règles du moteur

## Objectif

Ce document décrit les règles qui permettent au moteur de jeu de déterminer si une situation constitue ou non un obstacle pour un personnage.

Il constitue le lien entre :

- les situations ;
- les personnages ;
- les mécanismes sociaux ;
- la matrice de jeu ;
- les débriefs.

L'objectif est que les résultats du jeu soient cohérents, explicables et évolutifs.

---

# 1. Les objets du jeu

## Les situations

Une situation décrit un contexte concret rencontré dans la vie quotidienne.

Chaque situation est associée à un ou plusieurs mécanismes sociaux.

Une situation ne cible jamais un personnage.

---

## Les personnages

Chaque personnage est défini par :

- son identité ;
- son contexte ;
- ses caractéristiques stables ;
- ses facteurs de protection.

Les personnages ne sont jamais définis par les situations.

---

## Les mécanismes sociaux

Les mécanismes sociaux expliquent pourquoi une situation peut produire un privilège, un obstacle ou une discrimination.

Ils constituent la base scientifique du jeu.

---

# 2. Principe général

Le moteur applique toujours le même raisonnement.

Situation
→ Mécanisme(s)
→ Caractéristiques du personnage
→ Évaluation
→ Résultat
→ Débrief

---

# 3. Règles de décision

## Règle 1

Chaque situation active un ou plusieurs mécanismes sociaux.

## Règle 2

Chaque mécanisme agit uniquement sur les personnages possédant les caractéristiques concernées.

## Règle 3

Si aucun mécanisme n'affecte le personnage, le résultat est 0.

## Règle 4

Si un ou plusieurs mécanismes créent un obstacle, le résultat est +1.

## Règle 5

Un facteur de protection peut supprimer ou atténuer l'obstacle. Dans la première version du jeu, il est principalement utilisé dans le débrief plutôt que dans le calcul.

---

# 4. Algorithme de décision

Pseudo-code :

```
pour chaque personnage :
    obstacle = faux

    pour chaque mécanisme de la situation :
        si le personnage possède les caractéristiques concernées :
            obstacle = vrai

    si obstacle :
        résultat = +1
    sinon :
        résultat = 0
```

---

# 5. Exemples

## Exemple 1

Situation :
Appel en classe avec le prénom administratif.

Mécanisme :
Outing involontaire.

Personnage :
Noé.

Résultat :
+1.

Justification :
Le prénom administratif peut révéler une information personnelle.

---

## Exemple 2

Même situation.

Personnage :
Arthur.

Résultat :
0.

Justification :
Aucune information sensible n'est révélée.

---

# 6. Évolutivité

L'ajout d'un nouveau personnage nécessite uniquement :

- sa fiche personnage ;
- ses caractéristiques.

L'ajout d'une nouvelle situation nécessite uniquement :

- sa description ;
- les mécanismes sociaux associés.

Les règles du moteur restent inchangées.

---

# 7. Principes éditoriaux

- Les résultats ne sont jamais arbitraires.
- Une identité ne produit jamais un obstacle à elle seule.
- Ce sont les mécanismes sociaux qui produisent les obstacles.
- Les personnages permettent d'observer des effets différents d'un même mécanisme.
- Les débriefs expliquent le raisonnement suivi par le moteur.

Ce document constitue la référence technique du projet. Toute évolution du jeu doit rester compatible avec ces règles afin de garantir la cohérence de l'ensemble.
