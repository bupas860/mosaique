# Mosaïque — Espace « Comprendre »

## Audit d’harmonisation générale

| Métadonnée | Valeur |
|---|---|
| Version | V2 |
| Statut | audit d’harmonisation validé |
| Périmètre | Douze modules publics validés — M01, M02 et M08 en V3, neuf autres en V2 — dossiers de recherche associés, architecture `050`, gabarit `051` et modes gelés `100`, `110`, `120`, `130`, `140` |
| Date de l’audit | 31 juillet 2026 |
| Nature du document | Contrôle transversal ; aucun module ni contenu gelé n’est modifié par le présent audit |

## 1. Objet, méthode et limites

L’audit vérifie la cohérence éditoriale, conceptuelle, bibliographique et fonctionnelle de l’Espace « Comprendre ». Il compare les douze modules publics dans leur version validée, contrôle leurs renvois vers le corpus gelé et distingue les écarts qui bloquent une intégration de ceux qui peuvent être traités plus tard.

Le contrôle porte sur les métadonnées, les titres et codes de situations, les dépendances pédagogiques, les notions, les formulations stables, les références, les contenus datés et les futures possibilités de liaison avec « Jouer » et « Explorer ». Il ne constitue ni une nouvelle recherche documentaire ni une réécriture des modules. Les divergences présentées ci-dessous conservent la trace des constats initiaux et de leur résolution.

### Corpus public contrôlé

| Ensemble | Documents publics validés |
|---|---|
| Fondations | M01 `056 V3`, M02 `053 V3`, M03 `058 V2`, M04 `060 V2` |
| Focales d’analyse | M05 `062 V2`, M06 `064 V2`, M07 `066 V2`, M08 `055 V3` |
| Information et parcours | M09 `068 V2`, M10 `070 V2` |
| Pédagogie et formation | M11 `076 V2`, M12 `078 V2` |

Les dossiers de recherche ont été utilisés pour vérifier les sources, les niveaux de preuve, les dates de vérification et les réserves. Les modes gelés ont été utilisés seulement comme référentiels canoniques pour les codes, titres et règles déjà validés.

## 2. Résultat d’ensemble

Le socle conceptuel est cohérent. Aucune contradiction de fond n’a été repérée entre les douze modules sur le statut du joueur, la fonction du feedback, le caractère situé des protections, la séparation entre droit et privilège, la distinction entre intention et effet, la prudence juridique ou l’absence de preuve d’efficacité propre à Mosaïque.

L’audit initial avait identifié trois familles d’écarts de catégorie A : trois libellés de situations non canoniques dans les métadonnées du module 2 et cinq renvois utilisant des noms automatiques de copies de travail dans les modules 1 et 8. Ces huit occurrences ont été corrigées dans les sources canoniques V3, sans modification de fond.

**Aucune correction de catégorie A ne reste ouverte avant intégration.**

| Catégorie | Nombre de constats | Effet principal |
|---|---:|---|
| A — correction obligatoire avant intégration | 3 | Constats résolus dans les sources canoniques V3 |
| B — harmonisation éditoriale recommandée | 5 | Présentation et métadonnées hétérogènes, sans contradiction conceptuelle |
| C — différence légitime à conserver | 5 | Variation liée à l’histoire, au thème ou au niveau de précision du module |
| D — amélioration non bloquante | 4 | Robustesse future de la navigation et de la maintenance |

## 3. Catégorie A — corrections obligatoires avant intégration

| ID | Document(s) et section | Formulation concernée | Catégorie | Correction recommandée | Justification |
|---|---|---|---|---|---|
| A1 | M02 `053`, métadonnées — « Situations mobilisées » | `N02 — formulaire « père–mère »` ; `I14 — représentation ordinaire d’une famille` ; `X13 — adaptation coordonnée` | A | Remplacer par `N02 — Le formulaire « Père — Mère »` ; `I14 — Une histoire ordinaire` ; `X13 — Une adaptation coordonnée`. | Les anciens libellés étaient des résumés non canoniques ; correction intégrée à `053_Espace_Comprendre_Module_02_De_la_marche_des_privileges_a_Mosaique_V3.md`. |
| A2 | M01 `056`, section « Bibliographie complète — Textes originaux et sources primaires » | Quatre références `100`, `110`, `120` et `130` utilisaient des noms automatiques de copies de travail. | A | Employer `100_Mode_Obstacles_visibles_V1.md`, `110_Mode_Normes_ordinaires_V1.md`, `120_Mode_Effets_invisibles_V1.md`, `130_Mode_Intersectionnalites_V1.md`. | Les anciens noms exposaient des renvois non canoniques ; correction intégrée à `056_Espace_Comprendre_Module_01_Ce_que_Mosaique_met_en_jeu_V3.md`. |
| A3 | M08 `055`, section « Bibliographie complète — Sources institutionnelles et professionnelles » | La référence au mode `130` utilisait un nom automatique de copie de travail. | A | Employer `130_Mode_Intersectionnalites_V1.md`. | Correction intégrée à `055_Espace_Comprendre_Module_08_Intersectionnalite_et_articulation_des_rapports_sociaux_V3.md`, sans modification du mode. |

Les huit occurrences concernées — trois libellés et cinq noms de fichiers — étaient strictement formelles. Aucun titre de situation dans le corpus gelé et aucune règle de mode n’ont été modifiés.

### 3.1 Résolution des constats A1, A2 et A3

| Constat | Source canonique corrigée | État final |
|---|---|---|
| A1 — trois libellés de situations dans M02 | `053_Espace_Comprendre_Module_02_De_la_marche_des_privileges_a_Mosaique_V3.md` | Résolu : N02, I14 et X13 portent directement leurs titres canoniques. |
| A2 — quatre références de modes dans M01 | `056_Espace_Comprendre_Module_01_Ce_que_Mosaique_met_en_jeu_V3.md` | Résolu : les quatre références utilisent les noms canoniques. |
| A3 — une référence de mode dans M08 | `055_Espace_Comprendre_Module_08_Intersectionnalite_et_articulation_des_rapports_sociaux_V3.md` | Résolu : la référence utilise le nom canonique. |

La chaîne de publication doit désormais reproduire ces sources V3. Elle n’a plus à maintenir une table de substitution pour ces huit occurrences.

## 4. Catégorie B — harmonisations éditoriales recommandées

| ID | Document(s) et section | Formulation ou présentation concernée | Catégorie | Correction recommandée | Justification |
|---|---|---|---|---|---|
| B1 | M02 et M08, métadonnées | Absence de champ explicite `Version` | B | Afficher la version issue du registre documentaire dans l’interface, sans altérer les fichiers validés. | La plupart des autres modules possèdent ce champ ; l’écart gêne la maintenance mais pas la compréhension. |
| B2 | M02 et M08, métadonnées — statut | `module pilote validé`, contre `module validé` ailleurs | B | Arbitrage validé : conserver le statut historique et afficher un état public commun « Validé », complété par la mention « pilote ». | L’historique est utile ; l’état public de validation reste lisible. |
| B3 | M09 et M10, premier titre | Le titre du module ouvre directement le document, sans titre d’espace distinct. | B | Normaliser la hiérarchie visuelle dans le gabarit d’affichage, sans réécrire les titres internes. | Il s’agit d’une variation de structure, pas d’une divergence de titre canonique. |
| B4 | M08, métadonnées — public | Public formulé plus brièvement que dans plusieurs autres modules | B | Traiter les publics comme des indications non exclusives et utiliser une taxonomie d’interface commune. | Évite qu’une formulation courte soit interprétée comme une restriction d’accès. |
| B5 | M01 à M12, sections bibliographiques | Styles de citation, liens, DOI, capitales et ponctuation hétérogènes ; sources répétées sous des formes différentes | B | Utiliser l’index `083` comme couche dédupliquée et conserver les bibliographies historiques. | La normalisation améliore la recherche et la maintenance sans modifier les arguments. |

Ces harmonisations concernent la forme publique et la maintenance. Elles ne justifient pas une réécriture rétroactive des contenus validés.

## 5. Catégorie C — différences légitimes à conserver

| ID | Document(s) et section | Formulation ou différence | Catégorie | Correction recommandée | Justification |
|---|---|---|---|---|---|
| C1 | M02 et M08, métadonnées — statut | `module pilote validé` | C | Aucune correction documentaire ; préserver la mention. | Elle documente le rôle historique de ces modules et n’invalide pas leur validation. |
| C2 | M09, M10 et M12, encadrés et sources datés | Niveau de détail juridique, sanitaire ou professionnel supérieur à celui d’autres modules | C | Aucune uniformisation par suppression ; maintenir dates et limites. | Le niveau de détail dépend du sujet et du risque d’usage hors contexte. |
| C3 | M09, définition opérationnelle et réserve | `Le terme « outing » est utilisé plus largement dans ce module que dans certains usages médiatiques.` | C | Conserver la formulation et sa réserve. | L’extension pédagogique est déclarée et séparée d’une définition juridique universelle. |
| C4 | M08 et mode `130`, titres et définitions | `Intersectionnalités` au pluriel pour le mode ; `intersectionnalité` au singulier pour le concept | C | Conserver les deux formes dans leurs fonctions respectives. | Le pluriel désigne une focale de jeu ; le singulier désigne le concept. |
| C5 | M11 et M12, architecture générale | Contenus plus réflexifs et opérationnels que les modules notionnels | C | Aucune correction. | Leur fonction est de préparer l’analyse, le débrief, l’action et l’évaluation, non d’introduire une nouvelle famille de situations. |

## 6. Catégorie D — améliorations non bloquantes

| ID | Document(s) et section | Amélioration concernée | Catégorie | Action facultative | Justification |
|---|---|---|---|---|---|
| D1 | `083`, ensemble de l’index | Sources dédupliquées sans identifiant transversal antérieur | D | Utiliser les identifiants S001 à S174 proposés. | Facilite les mises à jour sans dupliquer les références. |
| D2 | M04 à M06, M09, M10, M12, contenus datés | Dates présentes mais dispersées | D | Maintenir le registre périodique de `083`. | Évite qu’un repère évolutif soit présenté hors de sa date de contrôle. |
| D3 | M01 à M12, métadonnées | Version, statut, dépendance et public présentés selon plusieurs formes | D | Générer l’affichage depuis un registre validé. | Uniformise l’interface sans modifier les documents historiques. |
| D4 | M01 à M12, notions, situations et encadrés | Ancres transversales non normalisées | D | Définir des ancres stables fondées sur les identifiants canoniques. | Permet des liens précis depuis « Jouer », « Explorer » et le glossaire. |

## 7. Cohérence des métadonnées et de l’architecture

Les douze modules suivent l’ordre intellectuel prévu par `050` : comprendre l’activité et son héritage, distinguer positions, normes et institutions, apprendre les quatre focales, traiter la circulation d’informations et la pluralité des parcours, puis préparer une pédagogie critique et un usage en formation.

Les dépendances annoncées sont compatibles avec cet ordre. Elles ne doivent pas devenir des barrières d’accès : un lecteur peut ouvrir directement un module, tandis que l’interface signale les prérequis utiles. Les quatre ensembles de lecture retenus dans `080` permettent de présenter cette progression sans ajouter de module.

Les modules conservent tous une partie « L’essentiel » et une partie « Approfondir ». Les différences de hiérarchie de titres et de présentation des métadonnées peuvent être absorbées par l’interface. Elles ne touchent pas au contenu pédagogique.

## 8. Cohérence conceptuelle

| Formulation stable | Résultat du contrôle transversal |
|---|---|
| Le joueur suit un personnage sans devenir cette personne. | Cohérent dans M01, M02, M11 et M12 ; aucune promesse d’accès direct au vécu n’apparaît ailleurs. |
| Une situation illustre une analyse ; elle ne constitue pas une preuve empirique. | Cohérent dans les focales M05 à M08 et repris dans les limites de transfert. |
| Le feedback est une interprétation argumentée et contestable. | Cohérent avec le débrief et la conduite du désaccord ; aucun verdict moral automatique n’est installé. |
| Une avance est située et ne forme pas un score global de privilège. | Cohérent de M01 à M04 puis dans les modules de formation. |
| Un droit, une ressource, une protection, un privilège et un pouvoir ne sont pas équivalents. | Cohérent dans M03, M04, M06, M09, M11 et M12. Le droit au respect n’est pas traité comme un privilège à retirer. |
| Une protection est située et peut être ponctuelle. | Cohérent dans les modes et dans les exemples V10, N12, N13, I14, I15, X13 et X14. |
| Une norme descriptive porte sur ce qui est perçu comme fréquent ou habituel. | Cohérent entre M04 et M06 ; la perception n’est pas présentée comme une mesure statistique. |
| L’intention et l’effet doivent être distingués. | Cohérent dans M04, M05, M07, M11 et M12 ; aucune intention n’est déduite automatiquement. |
| L’analyse sociologique ne vaut pas qualification juridique automatique. | Cohérent dans les modules 3 à 10 et dans les dossiers ; les qualifications demeurent conditionnelles. |
| Le coming out n’est ni obligatoire ni nécessairement unique. | Cohérent dans M09 ; une divulgation accomplie n’est pas présentée comme matériellement annulable. |
| Mosaïque n’a pas d’efficacité propre démontrée. | Cohérent dans M01, M11 et M12 ainsi que dans les réserves sur le transfert et l’évaluation. |

### Contrôles conceptuels complémentaires

| Élément contrôlé | Résultat |
|---|---|
| `Intersectionnalités` au pluriel pour le mode ; `intersectionnalité` au singulier pour le concept et M08 | Distinction stable et légitime ; aucune correction proposée. |
| Coming in, coming out et outing | M09 sépare reconnaissance éventuelle pour soi, divulgation volontaire située et divulgation sans consentement. L’usage pédagogique élargi d’`outing` est annoncé et n’est pas érigé en définition juridique universelle. |
| Identité, incongruence, dysphorie et souffrance | M10 ne traite pas l’identité comme diagnostic, l’incongruence comme souffrance automatique ni la dysphorie comme preuve de légitimité. |
| Transidentité et intersexuation | M10 maintient la distinction et précise qu’une personne intersexe peut être cisgenre, trans ou non binaire. |
| Bienveillance, empathie et pédagogie critique | M11 présente la bienveillance comme utile mais insuffisante, l’empathie comme effet possible et la pédagogie critique comme problématisation et praxis, sans obligation émotionnelle. |
| Débrief en quatre temps | M12 conserve la séquence : décrire ; analyser ; relier aux pratiques ; préparer une action. |
| Mode Découverte | Les nombres, familles, protections, règles de révélation et absence de note morale correspondent à `140`. |

## 9. Cohérence des situations, personnages et modes

Vingt-quatre situations sont explicitement citées dans les métadonnées des modules publics : cinq V, six N, sept I et six X. Leurs codes et titres canoniques sont enregistrés dans `082`. Les exemples V04, N02, N03, N06, N07, N12, N13, I14 et X13 conservent leur rôle ; aucun reclassement n’est proposé.

Les galeries de personnages P01 à P09 et XP01 à XP08 constituent des référentiels distincts. Quatre prénoms sont partagés entre les deux galeries — Noé, Jade, Sofia et Lou — sans identité de personnage. Les modules publics ne citent pas d’identifiant P ou XP dans leurs métadonnées : aucun lien personnage ne doit donc être inféré à partir d’un prénom ou d’une situation.

Le mode Découverte reste conforme à sa spécification gelée : galerie P01 à P09, dix situations, trois V, trois N, quatre I, aucune X, exactement deux protections issues de deux modes différents, huit situations non protectrices, famille analytique cachée avant la décision et révélée dans le feedback, bilan sans note morale. Aucun mode « Découverte intersectionnelle » n’est créé.

## 10. Cohérence juridique, sanitaire et scientifique

Les modules distinguent correctement l’explication pédagogique, l’analyse sociologique, la qualification juridique et le conseil individuel. Les contenus juridiques et sanitaires restent attachés à leur date de vérification et à leur champ : personnels concernés, faits, mission, destinataire, territoire et procédure locale.

Les réserves sur la transposition française des directives européennes de 2024, la portée des circulaires, les recommandations de la HAS, les mineurs, l’état civil, les recherches médiatiques et les transferts d’études étrangères sont maintenues. L’index `083` ne doit pas transformer une source institutionnelle en preuve scientifique ni une source scientifique en règle de droit.

## 11. Décision proposée avant intégration

L’intégration publique peut être préparée à partir des trois modules V3, des neuf autres modules V2 et des documents transversaux validés. Les constats A1, A2 et A3 sont clos. Les catégories B restent des harmonisations éditoriales non bloquantes ; les catégories C demeurent des différences légitimes ; les catégories D restent des améliorations facultatives.

Les décisions encore ouvertes concernent uniquement l’activation de renvois non déjà approuvés, les choix techniques d’intégration, les budgets chiffrés établis après mesure et la revérification des contenus datés avant publication.

## 12. Conclusion de l’audit

L’Espace « Comprendre » est conceptuellement harmonisé et forme un ensemble public cohérent. Les écarts formels bloquants ont été résolus dans les sources canoniques V3. Aucune donnée gelée, aucune incertitude et aucune réserve méthodologique n’ont été modifiées pour les résoudre.
