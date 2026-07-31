# Mosaïque — Espace « Comprendre »

## Spécification éditoriale et fonctionnelle d’intégration

| Métadonnée | Valeur |
|---|---|
| Version | V3 |
| Statut | document transversal validé |
| Périmètre | Future intégration publique de l’Espace « Comprendre » |
| Date | 31 juillet 2026 |
| Nature | Spécification sans code et sans choix de bibliothèque technique |

## 8.1 Périmètre public

### Contenus autorisés

L’application publique intègre exclusivement les douze sources canoniques suivantes :

| Module | Source publique canonique |
|---|---|
| M01 | `056_Espace_Comprendre_Module_01_Ce_que_Mosaique_met_en_jeu_V3.md` |
| M02 | `053_Espace_Comprendre_Module_02_De_la_marche_des_privileges_a_Mosaique_V3.md` |
| M03 | `058_Espace_Comprendre_Module_03_Privileges_positions_sociales_et_pouvoir_V2.md` |
| M04 | `060_Espace_Comprendre_Module_04_Normes_institutions_et_discriminations_V2.md` |
| M05 | `062_Espace_Comprendre_Module_05_Obstacles_visibles_V2.md` |
| M06 | `064_Espace_Comprendre_Module_06_Normes_ordinaires_V2.md` |
| M07 | `066_Espace_Comprendre_Module_07_Effets_invisibles_V2.md` |
| M08 | `055_Espace_Comprendre_Module_08_Intersectionnalite_et_articulation_des_rapports_sociaux_V3.md` |
| M09 | `068_Espace_Comprendre_Module_09_Dire_taire_ou_voir_divulgue_V2.md` |
| M10 | `070_Espace_Comprendre_Module_10_Parcours_trans_et_non_binaires_V2.md` |
| M11 | `076_Espace_Comprendre_Module_11_De_la_bienveillance_a_la_pedagogie_critique_V2.md` |
| M12 | `078_Espace_Comprendre_Module_12_Utiliser_Mosaique_en_formation_V2.md` |

Les autres contenus publics de l’espace sont :

- le sommaire et les parcours de lecture `080_Espace_Comprendre_Sommaire_et_parcours_de_lecture_V2.md` ;
- le glossaire transversal `081_Espace_Comprendre_Glossaire_transversal_V2.md` ;
- la bibliographie générale et l’index des sources `083_Espace_Comprendre_Bibliographie_generale_et_index_des_sources_V3.md` ;
- les seuls renvois explicitement approuvés de `082_Espace_Comprendre_Matrice_des_renvois_V3.md`, résolus vers des identifiants canoniques.

Le registre documentaire conserve les identifiants S001 à S174.
La vue publique de la bibliographie contient exclusivement S001 à S164.
Les entrées S165 à S174 sont internes et ne sont jamais livrées au navigateur.

Les marqueurs DRxxx constituent des informations de provenance internes. Ils ne sont pas sérialisés dans la vue publique. Les associations publiques utilisent exclusivement les identifiants M01 à M12.

Les huit corrections formelles de catégorie A ont été intégrées aux sources canoniques `053 V3`, `055 V3` et `056 V3`. La chaîne de publication doit reproduire ces sources corrigées et ne doit pas maintenir une table de substitution concurrente.

### Contenus interdits dans le navigateur et le bundle public

- dossiers de recherche `052`, `054`, `057`, `059`, `061`, `063`, `065`, `067`, `069`, `075`, `077` ;
- audits `050` et `079`, notes de validation et consignes de rédaction ;
- gabarits, brouillons et versions historiques remplacées par une version canonique plus récente ;
- matrices techniques, banques de mécanismes brutes et documents de travail ;
- contenus réservés au formateur provenant des biographies ;
- données biographiques non nécessaires à un renvoi public validé ;
- données confidentielles ou connues seulement du lecteur ;
- illustrations, textes alternatifs, décisions, feedbacks ou règles qui ne sont pas déjà destinés à la page appelée ;
- toute donnée libre provenant d’un dossier de recherche.

Les dossiers de recherche restent disponibles dans la documentation interne du dépôt, hors des ressources livrées au navigateur.

## 8.2 Architecture publique attendue

| Page | Fonction minimale | Contenu principal |
|---|---|---|
| Entrée « Comprendre » | Présenter la fonction de l’espace et ses limites | Introduction courte, quatre ensembles, accès aux parcours, avertissement sur les contenus datés |
| Sommaire des modules | Parcourir les douze modules dans l’ordre canonique | Cartes ou liste M01 à M12, titre, question, durée, groupe thématique |
| Page d’un module | Lire un module autonome | En-tête, « L’essentiel », « Approfondir », débrief, liens et sources |
| Glossaire | Retrouver une définition validée | Entrées alphabétiques, distinctions, modules de référence, statut daté ou durable |
| Bibliographie et sources | Examiner les références et leur nature | Vue publique S001 à S164, filtres éditoriaux simples, registre des contenus à maintenir |
| Renvois vers « Jouer » et « Explorer » | Passer de l’analyse au corpus concerné | Liens approuvés vers les modes et les situations dont les routes existent |

Les pages de module ne sont pas enfermées dans de petites fenêtres modales. Elles disposent d’une adresse stable, d’un historique de navigation normal, d’un sommaire interne et d’un espace suffisant pour les tableaux, encadrés et références.

## 8.3 Identifiants et routes

### Identifiants stables

| Objet | Identifiant autorisé | Règle |
|---|---|---|
| Module | M01 à M12 | Un identifiant unique pour chaque numéro canonique |
| Situation | Codes V, N, I ou X suivis de deux chiffres | Résolution vers le titre canonique du mode gelé |
| Personnage Découverte | P01 à P09 | Aucun lien par prénom seul |
| Personnage intersectionnel | XP01 à XP08 | Galerie distincte de P ; aucun rapprochement par prénom |
| Mécanisme | Identifiant canonique de la banque gelée | Aucun lien généré depuis un titre libre |
| Source | S001 à S174 dans `083_Espace_Comprendre_Bibliographie_generale_et_index_des_sources_V3.md` | Registre interne complet ; seuls S001 à S164 sont sérialisables publiquement |
| Notion | Identifiant éditorial issu du terme canonique de `081_Espace_Comprendre_Glossaire_transversal_V2.md` | Résolution contrôlée, sans définition libre concurrente |

Les quatre couples d’homonymes Noé, Jade, Sofia et Lou ne doivent jamais être rapprochés entre galeries sans identifiant explicite. Une biographie ou une identité supposée ne produit aucun lien automatique.

### Routes conceptuelles

Le système de routes doit fonctionner sur un hébergement statique de type GitHub Pages et accepter une stratégie par fragments. La forme exacte reste un choix d’implémentation ultérieur. Les cibles conceptuelles minimales sont :

- entrée de l’Espace « Comprendre » ;
- sommaire et parcours de lecture ;
- un fragment stable par module M01 à M12 ;
- un fragment stable par section publique d’un module ;
- glossaire, avec possibilité de viser une entrée ;
- bibliographie, avec possibilité de viser une source ;
- retour vers une situation canonique dans « Explorer », si la route existe ;
- retour vers le mode pertinent dans « Jouer ».

Un changement de titre visible ne doit pas casser une route. Les relations sont construites par identifiants, jamais par titres, prénoms ou positions dans une liste. La première intégration ne crée aucune route publique vers un personnage ou un mécanisme et ne crée aucune page nouvelle dans « Explorer » pour forcer un renvoi.

## 8.4 Structure des données publiques

### Fiche module

| Champ | Exigence |
|---|---|
| Identifiant | M01 à M12, obligatoire et unique |
| Numéro | 1 à 12, ordre canonique contrôlé |
| Titre | Titre canonique issu des métadonnées du module |
| Résumé | Résumé validé du sommaire transversal |
| Question directrice | Formulation du module validé |
| Groupe thématique | Un des quatre ensembles de `080_Espace_Comprendre_Sommaire_et_parcours_de_lecture_V2.md` |
| Durée de lecture | Deux indications : « L’essentiel » et « Approfondir » |
| Dépendances | Identifiants de modules, informatifs et non bloquants |
| Situations utilisées | Codes canoniques, titres résolus depuis le référentiel |
| Notions | Identifiants d’entrées du glossaire |
| Références centrales | Identifiants publics S001 à S164 de `083_Espace_Comprendre_Bibliographie_generale_et_index_des_sources_V3.md` et citations de proximité |
| Contenu daté | Type, date de vérification, portée et consigne de maintenance |
| L’essentiel | Suite ordonnée de blocs autorisés |
| Approfondir | Suite ordonnée de blocs autorisés et sections adressables |
| Questions de débrief | Questions validées, sans production automatique |
| Bibliographie du module | Références historiques conservées, reliées si possible aux identifiants S |
| Renvois liés | Modules, notions du glossaire, situations et modes explicitement approuvés dans `082 V3`, sous réserve de l’existence de leur route |

### Vue publique de la bibliographie

La vue publique charge exclusivement les notices S001 à S164, leurs associations publiques M01 à M12, leur nature, leur statut, leurs liens et les informations de maintenance utiles au lecteur. Elle exclut S165 à S174, les noms de dossiers de recherche, d’audits et de gabarits, les identifiants `DRxxx`, ainsi que les banques et matrices brutes.

La provenance interne reste dans le registre documentaire et n’est jamais copiée dans les données publiques, les filtres, les routes ou les ressources de distribution.

### Blocs sérialisables autorisés

- titre avec niveau sémantique contrôlé ;
- paragraphe ;
- liste ordonnée ou non ordonnée ;
- citation courte ;
- encadré typé ;
- tableau avec en-têtes explicites ;
- définition reliée au glossaire ;
- question de débrief ;
- référence ;
- avertissement daté avec date, champ et source.

### Contenus et mécanismes interdits

- HTML arbitraire ;
- script ou attribut exécutable ;
- Markdown interprété directement dans le navigateur ;
- insertion directe de contenu HTML non filtré, notamment par `dangerouslySetInnerHTML` ;
- champ libre permettant d’injecter une donnée d’un dossier de recherche ;
- URL, relation ou identifiant construit depuis un titre ou un prénom ;
- contenu généré à l’exécution qui modifie une formulation validée ;
- duplication concurrente d’un même contenu créant deux versions accessibles.

La transformation des documents vers les données publiques intervient avant le déploiement, selon une liste d’autorisation structurelle. Le navigateur reçoit seulement des blocs validés et sérialisés.

## 8.5 Présentation d’un module

### En-tête

L’en-tête affiche le numéro, le titre, la question directrice, les deux durées de lecture, les dépendances utiles et, lorsqu’il y en a, un signal explicite sur les contenus datés. Les dépendances sont des suggestions de lecture, pas des verrous.

### « L’essentiel »

La partie est visible immédiatement, autonome et placée avant tout développement long. Elle propose un sommaire court lorsqu’il améliore l’orientation. Les sources centrales apparaissent près des affirmations qu’elles soutiennent ; leur nature et leurs limites restent identifiables.

### « Approfondir »

L’accès est explicite et utilisable au clavier. L’état ouvert ou fermé est annoncé de manière compréhensible. Chaque section importante peut recevoir un lien direct. Une seule version du contenu est exposée aux technologies d’assistance : le masquage visuel ne crée pas une duplication concurrente.

### Fin de page

La fin de page rassemble, dans cet ordre :

1. idées à retenir ;
2. question professionnelle ou questions de débrief validées ;
3. modules liés ;
4. situations associées ;
5. renvois approuvés vers les notions, situations ou modes dont la route existe ;
6. accès au glossaire ;
7. sources du module ;
8. date de vérification des contenus évolutifs et rappel de leur portée.

Les libellés de liens restent sobres : « Lire aussi », « Revoir la définition », « Comprendre le mode » ou « Voir la situation dans Explorer ». Les termes « preuve », « cas réel », « personnage type » et toute formulation attribuant une réponse à une identité sont interdits.

## 8.6 Contenus destinés particulièrement aux formateurs

Les contenus d’animation des modules 11 et 12 restent publics. Un repère visible indique qu’ils s’adressent particulièrement aux formateurs, animateurs et professionnels, sans fermer l’accès aux autres lecteurs.

Tous les modules affichent un état public commun indiquant qu’ils sont validés. M02 et M08 conservent en complément la mention historique `pilote`.

Ce repère ne les transforme pas en volet secret, en règle juridique universelle ou en donnée biographique confidentielle. Le contrat de participation, la conduite du désaccord, le traitement proportionné des incidents, les formats de formation, les limites du débrief et les distinctions d’évaluation sont rendus avec leur contexte.

L’interface ne promet ni secret absolu, ni obligation de dévoilement, ni consensus, ni conscientisation, ni efficacité propre de Mosaïque.

## 8.7 Accessibilité

### Exigences structurelles

- une hiérarchie sémantique continue des titres ;
- une région principale et des repères de navigation explicites ;
- un sommaire interne accessible pour chaque page longue ;
- des liens compréhensibles hors contexte ;
- des tableaux avec en-têtes et solution de consultation adaptée sur petit écran ;
- des notes, citations et avertissements annoncés par leur fonction, pas seulement par leur apparence ;
- des contenus datés signalés par du texte explicite.

### Interaction et perception

- navigation intégrale au clavier ;
- ordre de focus conforme à l’ordre de lecture ;
- focus visible ;
- aucun piège clavier ;
- information jamais portée uniquement par la couleur, une icône ou une animation ;
- fonctionnement avec un agrandissement à 200 % et à 400 % sans perte d’information ;
- mise en page réactive sans défilement horizontal global ;
- respect de la préférence de réduction des animations ;
- liens externes identifiés comme tels ;
- cible tactile suffisante et espacement adapté ;
- langue principale et changements de langue signalés.

### Contenu

Les acronymes institutionnels sont développés à leur première occurrence ou reliés au glossaire. Les avertissements juridiques et sanitaires restent lisibles sans jargon inutile. Les titres des situations et les identifiants ne remplacent pas une description de la destination du lien.

## 8.8 Chargement et performance

L’Espace « Comprendre » ne doit pas alourdir le chargement initial de « Jouer ».

Exigences :

- chargement différé de l’entrée, du glossaire, de la bibliographie et des pages de module ;
- séparation des données de « Comprendre » du paquet principal de « Jouer » ;
- chargement par module ou par groupe lorsque le gain est mesurable ;
- aucune inclusion des dossiers de recherche, audits, brouillons ou corpus internes dans les ressources publiques ;
- partage contrôlé des seules données canoniques nécessaires aux liens ;
- absence de duplication intégrale d’une bibliographie dans chaque ressource chargée lorsque des identifiants suffisent ;
- contrôle après intégration de la taille totale, de la taille initiale et des ressources chargées à la demande ;
- maintien d’une lecture utile si une ressource secondaire ou un lien externe échoue ;
- absence de dépendance à un service tiers pour afficher le texte validé.

Le contrôle de performance doit mesurer le bundle actuel avant intégration, conserver « Comprendre » hors du chargement initial de « Jouer », mesurer les ressources différées après intégration et documenter toute augmentation. Le chargement des douze modules au démarrage de « Jouer » constitue un échec.

Aucune bibliothèque, aucun cadre technique et aucun seuil chiffré arbitraire ne sont imposés dans cette spécification. Les budgets doivent être fixés après mesure de l’application existante.

## 8.9 Génération et validation

La chaîne future de préparation des données publiques doit :

- partir des trois fichiers canoniques V3 de M01, M02 et M08, des neuf fichiers canoniques V2 de M03 à M07 et M09 à M12, et des seuls documents transversaux validés, notamment `080 V2`, `081 V2`, `082 V3` et `083 V3` ;
- appliquer une liste d’autorisation de documents, champs et types de blocs ;
- échouer si un module manque ou si un treizième module apparaît ;
- vérifier exactement soixante-huit entrées du glossaire et vingt-quatre situations dans la matrice des renvois ;
- conserver cent soixante-quatorze identifiants de source dans le registre interne, sérialiser exactement cent soixante-quatre notices publiques S001 à S164 et exclure exactement dix notices internes S165 à S174 ;
- échouer si un identifiant de module, situation, personnage, mécanisme, notion ou source est dupliqué ;
- vérifier les numéros M01 à M12, leur ordre et leurs titres canoniques ;
- vérifier la présence distincte de « L’essentiel » et « Approfondir » ;
- vérifier les codes et titres de situations contre les modes gelés ;
- vérifier que les titres N02, I14 et X13 proviennent directement de `053 V3` ;
- vérifier que les cinq références aux modes proviennent directement de `055 V3` et `056 V3` ;
- refuser tout rapprochement P/XP construit depuis un prénom ;
- appliquer exclusivement le statut fonctionnel de `082 V3` : liens vers les modules, les notions énumérées du glossaire et les vingt-quatre situations, ainsi que liens vers un mode ou « Jouer » et vers « Explorer — situations » lorsque leur route existe ;
- vérifier chaque renvoi approuvé et, si sa route n’existe pas, conserver le code ou le titre informatif, signaler la cible comme indisponible et ne produire aucun lien cassé ;
- refuser les liens vers les personnages et les mécanismes, les liens inférés et tout lien absent de `082 V3` ;
- ne créer aucune page nouvelle dans « Explorer » pour rendre artificiellement une route disponible ;
- vérifier la présence d’une date, d’une portée et d’une source pour chaque contenu évolutif ;
- refuser tout champ ou texte issu d’un dossier de recherche dans les données publiques ;
- échouer si un marqueur correspondant à `DR[0-9]{3}` apparaît dans les données publiques ;
- produire un résultat déterministe à sources identiques ;
- contrôler les seules ressources publiques finales — données, pages, bundles, chunks, manifestes, filtres, routes et fichiers de distribution — afin d’y détecter `Dossier_de_recherche`, `Audit_et_Architecture`, `Audit_harmonisation`, `Gabarit_editorial`, tout marqueur correspondant à `DR[0-9]{3}`, les identifiants S165 à S174, les suffixes automatiques `(1)`, les versions historiques remplacées et les contenus réservés des biographies ;
- échouer si un suffixe automatique de copie de travail réapparaît dans un nom de fichier ;
- ne jamais corriger silencieusement les huit occurrences déjà résolues dans les sources V3.

La génération ne réécrit pas les formulations validées. Une différence de contenu entre la source canonique et le rendu est un échec, sauf transformation typographique explicitement approuvée.

Ces contrôles d’exclusion portent uniquement sur les ressources publiques produites et distribuées. Ils ne s’appliquent pas aux documents internes conservés dans le dépôt, où les noms documentaires, les marqueurs `DRxxx` et les identifiants S165 à S174 restent nécessaires à la traçabilité.

## 8.10 Hors périmètre de la première intégration

- moteur de recherche plein texte ;
- annotation personnelle ;
- quiz, score, badge, niveau de compétence ou certification ;
- suivi individualisé des lectures ;
- commentaires publics ;
- modification des modules depuis l’application ;
- refonte générale de « Jouer » ;
- refonte des mécanismes, situations, biographies, matrices ou feedbacks ;
- intégration publique des dossiers de recherche ;
- automatisation de la veille juridique, sanitaire ou institutionnelle ;
- recommandation juridique ou médicale individualisée ;
- inférence de personnages ou de contenus depuis une identité ;
- création d’un module 13 ou d’un mode supplémentaire.

## 8.11 Critères d’acceptation

### Contrôles automatisables

| Domaine | Critère |
|---|---|
| Corpus | Exactement douze modules M01 à M12 sont présents : M01, M02 et M08 issus des fichiers V3 autorisés ; neuf autres issus des fichiers V2 autorisés. |
| Glossaire | Exactement soixante-huit entrées validées sont présentes. |
| Sources | Le registre interne conserve 174 identifiants S001 à S174 ; la vue publique contient 164 notices S001 à S164 ; les 10 notices S165 à S174 en sont absentes. |
| Ordre et titres | Numéros, ordre et titres correspondent au registre canonique. |
| Structure | Chaque module possède un en-tête, « L’essentiel », « Approfondir », ses questions et ses sources attendues. |
| Fidélité | Les titres N02, I14 et X13 ainsi que les cinq références aux modes proviennent directement des sources V3 ; toute divergence source-rendu constitue un échec, hors transformation typographique explicitement approuvée. |
| Identifiants | Aucun identifiant de module, situation, personnage, mécanisme, notion ou source n’est dupliqué ou inconnu. |
| Situations | Exactement vingt-quatre situations sont enregistrées ; leurs codes et titres correspondent aux modes gelés ; N02, I14 et X13 utilisent leurs titres canoniques. |
| Personnages et mécanismes | Aucun lien public n’est produit ; aucun lien n’est établi par prénom ; les espaces P et XP restent distincts. |
| Renvois | Seuls les renvois approuvés par `082 V3` sont présents ; chacun possède une route existante, sinon le code ou le titre reste informatif et la cible est signalée comme indisponible sans lien. |
| Provenance | Aucun marqueur correspondant à `DR[0-9]{3}` n’est présent dans les données publiques ; les associations publiques utilisent uniquement M01 à M12. |
| Contenus datés | Chaque contenu évolutif affiche une date et une source de maintenance. |
| Exclusion | Aucun nom `Dossier_de_recherche`, `Audit_et_Architecture`, `Audit_harmonisation` ou `Gabarit_editorial`, aucun identifiant S165 à S174, suffixe `(1)`, fichier historique remplacé ou contenu biographique réservé ne figure dans les ressources publiques ou de distribution. |
| Sécurité éditoriale | Aucun HTML arbitraire, script, Markdown interprété dans le navigateur ou champ libre interne n’est livré. |
| Déterminisme | Deux générations à partir des mêmes sources produisent les mêmes données publiques. |
| Déploiement | Les routes directes et rechargements fonctionnent sur GitHub Pages. |
| Performance | « Jouer » ne charge pas les douze modules au démarrage ; les ressources différées sont mesurées et documentées. |

### Contrôles humains

| Domaine | Critère |
|---|---|
| Lecture | « L’essentiel » est immédiatement compréhensible et « Approfondir » clairement accessible. |
| Navigation | Sommaire, retour, liens directs et modules liés sont prévisibles au clavier, sur mobile et sur grand écran. |
| Accessibilité | Focus, titres, tableaux, agrandissement, réduction des animations et annonces des contenus datés sont vérifiés avec des technologies d’assistance. |
| Fidélité conceptuelle | Aucun droit n’est présenté comme privilège, aucune identité comme diagnostic, aucune situation comme preuve et aucune focale comme rang de gravité. |
| Prudence | Aucune intention ou réaction psychologique n’est certaine ; aucune qualification juridique ou efficacité propre de Mosaïque n’est automatique. |
| Débrief | Les modules 11 et 12 conservent le droit de ne pas parler de soi, les limites de confidentialité, la conduite du désaccord et les quatre temps du débrief. |
| Bibliographie | Les 164 sources publiques, leurs associations M01 à M12, leurs natures, statuts, liens et informations de maintenance sont lisibles ; aucune provenance interne n’apparaît. |
| Mode Découverte | Les règles exactes restent inchangées et aucun mode « Découverte intersectionnelle » n’apparaît. |
| Confidentialité | Aucune donnée biographique réservée, sensible ou connue seulement du lecteur n’est exposée. |

### Décisions humaines restant ouvertes avant intégration

1. résolution des routes existantes pour les seuls renvois approuvés dans `082 V3`, sans création de page nouvelle et sans activation de lien personnage, mécanisme ou inféré ;
2. choix de l’implémentation technique exacte des routes, blocs et chargements, dans les limites de cette spécification ;
3. fixation des budgets chiffrés de performance à partir des mesures réelles du dépôt ;
4. revérification des contenus juridiques, sanitaires et institutionnels datés avant publication ;
5. recette éditoriale, professionnelle, fonctionnelle et d’accessibilité avant publication.

## Conclusion

Cette spécification définit une intégration publique fidèle, limitée et maintenable. Elle sépare les contenus publics des preuves et documents internes, protège les identifiants canoniques, rend visibles les contenus datés et garde les modules indépendants de toute promesse d’efficacité, de diagnostic ou de qualification automatique.
