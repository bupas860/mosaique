# Mosaïque — Matrice d’affichage des 17 biographies

- **Version :** 2.0
- **Statut :** matrice de contrôle validée, prête pour intégration fonctionnelle
- **Corpus canonique :** `046_Biographies_approfondies_17_personnages_V1.md`
- **Références complémentaires :** galeries `010` et `015`, casting visuel `020`
- **Périmètre :** P01 à P09 et XP01 à XP08

Le document `048_Matrice_affichage_17_biographies_V1.md` reste le document
historique de préparation.

## 1. Objet et mode d’emploi

Cette matrice contrôle l’affichage public des biographies. Elle ne crée aucune
donnée de personnage et ne remplace ni les descriptions courtes du jeu, ni les
biographies canoniques.

Elle vérifie pour chaque personnage :

- l’identité stable de l’enregistrement ;
- la correspondance avec le portrait et la description courte existants ;
- les accords nécessaires ;
- la présence des composants chronologie et cartographie ;
- les vigilances de confidentialité narrative ;
- la distinction avec les homonymes ;
- la présence des treize rubriques publiques ;
- l’exclusion absolue des rubriques documentaires 14 à 17.

La matrice comporte exactement 16 colonnes de contrôle pour chacun des 17
personnages. Elle ne modifie aucune donnée canonique et n’établit aucune
correspondance technique avec les situations, les matrices de jeu ou les
feedbacks.

Les mentions « identité ou caractéristiques publiques » désignent ce que le
lecteur de la fiche peut lire dans les rubriques 1 à 13. Elles ne signifient pas
que ces informations sont connues de tous les personnages dans l’univers de
Mosaïque.

## 2. Légende des sources et règles communes

- **DG** : description courte de la galerie générale, déjà utilisée dans le
  jeu et documentée dans `010_Galerie_des_personnages_V2.md`.
- **DX** : description courte de la galerie Intersectionnalités, déjà utilisée
  dans le jeu et documentée dans
  `015_Galerie_Intersectionnalites_V1.md`.
- Les noms `p01.webp` à `p09.webp`, puis `xp01.webp` à `xp08.webp`, sont des
  conventions attendues du casting visuel. Les chemins, les noms et les
  extensions réels doivent être vérifiés dans le dépôt avant intégration.
- Aucune copie ou conversion de portrait n’est décidée dans ce document.
- Chaque portrait est toujours associé au personnage par son identifiant
  stable.
- Aucune identité invisible n’est déduite de l’image.
- Les textes alternatifs utilisent uniquement les formulations déjà validées
  dans le cahier documentaire des illustrations.
- Aucun texte alternatif n’est généré automatiquement à partir de la
  biographie.
- Aucun texte alternatif ne déduit une orientation, une transidentité, une
  intersexuation, une religion ou une origine non visible.
- Tout portrait sans texte alternatif approuvé constitue un blocage de
  publication.
- La correspondance entre le texte alternatif, le bon identifiant et le bon
  portrait est vérifiée avant publication.
- Le futur travail technique doit localiser le document canonique des textes
  alternatifs avant toute publication.
- « 13/13 dans la source » confirme la présence des rubriques publiques dans le
  document 046. Le contrôle devra être répété sur la sortie effectivement
  générée.
- « Exclusion exigée » constitue une règle bloquante de la matrice. Elle ne
  pourra être marquée comme vérifiée qu’après inspection des données publiques
  produites et du contenu chargé par le navigateur.

### 2.1. Présentation fonctionnelle commune

- Les 17 biographies sont intégrées simultanément dans la première version.
- `Explorer → Personnages` ouvre sans attendre les autres sous-espaces
  d’Explorer.
- Chaque personnage dispose d’une page dédiée.
- Les descriptions courtes actuelles sont conservées dans le jeu.
- Aucun lien biographique n’est placé pendant une situation.
- Aucun lien biographique n’est encore ajouté depuis la sélection du
  personnage ni depuis le bilan.
- Le bilan constitue la prochaine possibilité d’accès à prévoir.
- Aucune rubrique 14 à 17 et aucune correspondance technique avec les
  situations, les matrices ou les feedbacks n’est intégrée.
- La « Vue d’ensemble » est ouverte par défaut ; « Son parcours », « Entourage
  et confidentialité » et « Au lycée » sont fermés par défaut.
- Les quatre accordéons sont indépendants et le sommaire comprend quatre liens.
- La première version ne comporte pas de commande globale « Tout ouvrir / Tout
  fermer ». Cette décision n’empêche pas son ajout ultérieur.

### 2.2. Identité visible et cartographie

Chaque galerie et chaque page affichent systématiquement, mais discrètement :

- le prénom ;
- l’âge ;
- la classe ;
- le libellé textuel de la galerie ;
- l’identifiant `Pxx` ou `XPxx`.

L’identifiant ne devient pas le titre principal et la galerie n’est jamais
indiquée uniquement par une couleur.

Exemples :

> Noé  
> 15 ans · Seconde  
> Galerie générale · P01

> Noé  
> 15 ans · Seconde  
> Galerie Intersectionnalités · XP08

Sur ordinateur et sur les écrans suffisamment larges, la cartographie des
dévoilements utilise un tableau à deux colonnes : « espace ou groupe » et
« situation actuelle ». Sur mobile et dans les mises en page étroites, chaque
ligne devient un bloc vertical :

> **[Espace ou groupe]**  
> [Situation actuelle]

Le tableau à défilement horizontal n’est pas retenu comme comportement
principal. Les blocs conservent l’ordre canonique et les formulations
complètes, restent lisibles à fort agrandissement, fonctionnent avec un lecteur
d’écran et ne dépendent ni d’une couleur ni d’une icône.

### 2.3. Notes narratives validées

La note principale est exactement :

> **À propos de cette fiche**  
> Cette fiche donne au lecteur des informations que le lycée fictif, les autres
> personnages ou l’entourage ne connaissent pas nécessairement. Elles ne
> doivent pas être utilisées comme si elles étaient publiques dans l’histoire.

Dans l’ensemble « Entourage et confidentialité », le rappel court est
exactement :

> Les personnes informées varient selon les espaces. Lire cette fiche ne rend
> pas ces informations publiques dans l’histoire.

Ces notes ne prétendent pas que les informations seraient techniquement
confidentielles sur le site public. Elles expliquent uniquement leur statut
dans l’univers narratif.

## 3. Matrice des 17 personnages

| Identifiant | Prénom | Âge | Classe | Galerie | Portrait attendu | Description courte conservée | Identité ou caractéristiques publiques principales | Pronoms ou accords nécessaires | Chronologie | Cartographie des dévoilements | Particularité d’affichage éventuelle | Vigilance de confidentialité | Distinction avec un homonyme | Contrôle des rubriques 1 à 13 | Confirmation d’exclusion des rubriques 14 à 17 |
|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P01 | Noé | 15 ans | Seconde | Générale | `p01.webp` — silhouette compacte et sportive, boucles courtes, bracelet de basket | Oui — DG P01, sans réécriture | Garçon trans et hétérosexuel ; basket et jeux de stratégie ; prénom administratif encore visible sur certains documents | Il ; accords masculins | Oui — rubrique 4 | Oui — rubrique 6 | Aucun composant spécifique hors chronologie et cartographie | La majorité des camarades ignore sa transidentité ; quelques professionnels seulement connaissent les données administratives utiles | À distinguer de XP08 : galerie générale, orientation hétérosexuelle, univers du basket ; aucune dépendance à l’internat retenue | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P02 | Jade | 16 ans | Première | Générale | `p02.webp` — carré ondulé, veste utilitaire, appareil photo ou carnet | Oui — DG P02, sans réécriture | Fille cisgenre et lesbienne ; photographie et journal du lycée ; relation avec une fille d’une autre classe | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Faire apparaître les centres d’intérêt avant les enjeux de dévoilement | Petite amie et trois amis informés ; famille, majorité de la classe et professionnels non informés | À distinguer de XP05 : photographie et journal ; famille non informée ; expression de genre non définie comme masculine | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P03 | Sam | 17 ans | Terminale | Générale | `p03.webp` — silhouette grande et fine, coupe courte asymétrique, lunettes et stylet | Oui — DG P03, sans réécriture | Personne non binaire se définissant comme pansexuel·le ; musique et illustration numérique ; prénom administratif Sam | Iel ; accords inclusifs ; employer Sam pour éviter des reprises artificielles | Oui — rubrique 4 | Oui — rubrique 6 | Préserver le pronom « iel » et les accords inclusifs lors de toute transformation de texte | Les amis proches connaissent la non-binarité ; famille, majorité du lycée et personnels ne la connaissent pas | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P04 | Arthur | 16 ans | Première | Générale | `p04.webp` — carrure trapue, cardigan, vernis discret, sac de théâtre | Oui — DG P04, sans réécriture | Garçon cisgenre et hétérosexuel ; théâtre et danse contemporaine ; expression parfois jugée insuffisamment virile | Il ; accords masculins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas utiliser le vernis ou les activités comme pictogrammes d’orientation | Il ne détient pas dans son profil d’identité LGBT confidentielle à révéler ; ne rien inventer à partir des rumeurs | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P05 | Sofia | 15 ans | Seconde | Générale | `p05.webp` — petite silhouette ronde, boucles au carré, barrettes colorées | Oui — DG P05, sans réécriture | Fille cisgenre et hétérosexuelle ; vit avec ses deux mères ; famille vécue comme ordinaire | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Nommer les deux mères de façon équivalente ; ne pas symboliser la famille par un badge permanent | Les responsables sont connues de l’administration, mais la composition familiale ne l’est pas nécessairement partout | À distinguer de XP06 : orientation hétérosexuelle ; aucune caractéristique raciale des mères n’est retenue ici | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P06 | Mehdi | 17 ans | Terminale | Générale | `p06.webp` — grande stature athlétique, veste d’entraînement, sac de football | Oui — DG P06, sans réécriture | Garçon cisgenre et gay ; footballeur ; fréquente un garçon ; famille et amis proches soutenants | Il ; accords masculins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas transformer le football ou la virilité en caricature visuelle | Parents et trois amis environ informés ; coéquipiers, majorité de la classe et adultes du sport non informés | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P07 | Camille | 16 ans | Première | Générale | `p07.webp` — silhouette longiligne, tresses relevées, lunettes rondes et livre | Oui — DG P07, sans réécriture | Fille cisgenre, aromantique et asexuelle ; amitiés centrales ; ne souhaite pas former de couple | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas présenter l’absence de couple comme une attente ou un manque à combler | Trois amis informés ; famille, majorité de la classe et professionnels non informés | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P08 | Lou | 16 ans | Première | Générale | `p08.webp` — silhouette moyenne à petite, carré cuivré, cardigan sombre | Oui — DG P08, sans réécriture | Fille cisgenre présentant une variation intersexe ; identité de fille clairement affirmée ; aucun aménagement scolaire particulier retenu | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Éviter tout pictogramme anatomique ou médical dans le résumé et le portrait | Variation connue de la famille, de l’infirmière et de quelques professionnels ; détails corporels et orientation non publics dans le récit | À distinguer de XP07 : galerie générale, pas d’aménagement scolaire particulier ; portrait au carré cuivré | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| P09 | Inès | 17 ans | Terminale | Générale | `p09.webp` — grande silhouette, frange droite, petites créoles et veste structurée | Oui — DG P09, sans réécriture | Fille cisgenre et bisexuelle ; actuellement en couple avec un garçon | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas laisser la relation actuelle effacer la bisexualité dans les titres ou résumés | Une amie connaît sa bisexualité ; famille, petit ami, majorité de la classe et professionnels ne connaissent pas cette étiquette | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP01 | Alex | 16 ans | Première | Intersectionnalités | `xp01.webp` — fauteuil manuel, coupe très courte, bomber rouge sombre, roue visible | Oui — DX XP01, sans réécriture | Fille trans utilisant un fauteuil roulant manuel ; prénom Alex utilisé ; mention de sexe administrative non modifiée ; orientation sans étiquette | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Le portrait conserve une grande roue et un châssis identifiable ; la transidentité n’est pas codée visuellement | Besoins d’accessibilité connus ; transidentité et décalage administratif connus seulement d’un cercle professionnel restreint | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP02 | Maya | 17 ans | Terminale | Intersectionnalités | `xp02.webp` — fauteuil manuel sombre distinct, longues tresses, cardigan coloré | Oui — DX XP02, sans réécriture | Fille cisgenre et lesbienne utilisant un fauteuil roulant manuel ; relation avec une fille du lycée | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Préserver le cadrage du fauteuil ; ne pas représenter la petite amie comme accompagnatrice | Accessibilité connue ; relation connue seulement d’une partie du lycée ; cause du handicap et détails médicaux privés | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP03 | Yanis | 17 ans | Terminale | Intersectionnalités | `xp03.webp` — grande silhouette, boucles courtes, surchemise bleu marine | Oui — DX XP03, sans réécriture | Garçon cisgenre et gay ; famille franco-marocaine ; pratique religieuse importante ; aucune relation actuelle définie | Il ; accords masculins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas réduire la foi ou l’origine familiale à un symbole, une icône ou un accessoire | Orientation connue de la famille et de quelques amis, pas automatiquement du lycée ; conversations religieuses privées | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP04 | Charlie | 16 ans | Première | Intersectionnalités | `xp04.webp` — silhouette fine, frange géométrique, lunettes et palette sobre | Oui — DX XP04, sans réécriture | Personne non binaire et autiste ; pronom « iel » ; besoins sensoriels liés notamment au bruit, à la lumière et aux environnements chargés | Iel ; accords inclusifs ; employer Charlie pour éviter des reprises artificielles | Oui — rubrique 4 | Oui — rubrique 6 | Préserver les accords inclusifs ; ne pas coder l’autisme par un casque permanent ou une posture infantile | Les cercles connaissant l’autisme et le pronom ne se recouvrent pas entièrement ; ne jamais expliquer le genre par un dossier | Aucun homonyme | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP05 | Jade | 16 ans | Première | Intersectionnalités | `xp05.webp` — carrure athlétique, cheveux crépus très courts, veste de travail en jean | Oui — DX XP05, sans réécriture | Fille noire et lesbienne ; expression de genre masculine ; relation avec une fille du lycée ; participation affirmée en classe | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas utiliser l’apparence comme raccourci vers l’orientation ; préserver une expression ferme non caricaturale | Relation connue d’une partie du lycée ; choix de visibilité et conversations familiales non publics dans le récit | À distinguer de P02 : fille noire, expression masculine, relation dans le même lycée, famille informée | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP06 | Sofia | 15 ans | Seconde | Intersectionnalités | `xp06.webp` — allure vive, boucles aux épaules, plusieurs pinces colorées | Oui — DX XP06, sans réécriture | Fille cisgenre vivant avec ses deux mères, l’une noire et l’autre blanche ; orientation non définie ; aucune relation actuelle | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Ne pas déduire l’apparence, la filiation ou le lien biologique de Sofia à partir de ses mères | Le lycée connaît les deux responsables, mais ne connaît ni les stratégies familiales ni une orientation qui reste indéfinie | À distinguer de P05 : orientation non définie ; mères noire et blanche explicitement retenues ; portrait distinct | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP07 | Lou | 16 ans | Première | Intersectionnalités | `xp07.webp` — grande silhouette robuste, cheveux attachés, pull rouille et dossier fermé | Oui — DX XP07, sans réécriture | Fille cisgenre et intersexe ; bénéficie d’un aménagement médical scolaire ; besoins fonctionnels distingués des informations corporelles | Elle ; accords féminins | Oui — rubrique 4 | Oui — rubrique 6 | Distinguer visuellement les besoins fonctionnels des données médicales ; aucun signe corporel ou médical détaillé | L’infirmière et les personnes nécessaires connaissent les besoins ; la variation intersexe relève d’un cercle plus restreint | À distinguer de P08 : aménagement médical scolaire, grande silhouette et dossier fermé ; circulation fonctionnelle limitée | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |
| XP08 | Noé | 15 ans | Seconde | Intersectionnalités | `xp08.webp` — silhouette trapue, vêtements pratiques, grand sac d’internat | Oui — DX XP08, sans réécriture | Garçon trans vivant en zone rurale et dépendant de l’internat ; prénom administratif et mention de sexe non modifiés ; orientation sans étiquette | Il ; accords masculins | Oui — rubrique 4 | Oui — rubrique 6 | Faire de l’internat et du transport un contexte, pas une esthétique folklorique ; aucun marqueur médical dans le résumé | Cercle professionnel restreint informé ; majorité des internes et camarades non informée ; démarche médicale et budget détaillé privés | À distinguer de P01 : galerie Intersectionnalités, internat et transports ruraux, deux données administratives non modifiées, orientation sans étiquette | 13/13 dans 046 ; sortie à contrôler | Exclusion exigée ; preuve à établir sur la sortie publique |

## 4. Contrôle spécifique des quatre couples d’homonymes

Les différences ci-dessous servent uniquement à empêcher les fusions de données
et les confusions d’interface. Elles ne comparent ni la valeur des personnages,
ni la gravité de leurs expériences, ni le niveau de difficulté d’un mode.

| Couple | Premier personnage | Second personnage | Différences qui doivent rester visibles |
|---|---|---|---|
| P01 Noé / XP08 Noé | **P01 — Galerie générale.** Garçon trans et hétérosexuel ; basket et jeux de stratégie ; prénom administratif encore visible sur certains documents ; portrait compact et sportif | **XP08 — Intersectionnalités.** Garçon trans sans étiquette d’orientation ; zone rurale, internat et transports ; prénom administratif et mention de sexe non modifiés ; grand sac d’internat | Identifiant, galerie, description courte, orientation, contexte scolaire, données administratives, portrait et route distincts |
| P02 Jade / XP05 Jade | **P02 — Galerie générale.** Photographie et journal ; relation avec une fille d’une autre classe ; famille non informée ; carré ondulé et appareil photo | **XP05 — Intersectionnalités.** Fille noire ; expression de genre masculine ; relation avec une fille du lycée ; famille informée ; carrure athlétique et veste de travail | Identifiant, galerie, centres d’intérêt, visibilité familiale et scolaire, expression de genre, portrait et route distincts |
| P05 Sofia / XP06 Sofia | **P05 — Galerie générale.** Fille cisgenre et hétérosexuelle ; deux mères ; petite silhouette ronde et barrettes | **XP06 — Intersectionnalités.** Fille cisgenre dont l’orientation n’est pas définie ; deux mères, l’une noire et l’autre blanche ; allure vive et pinces multiples | Identifiant, galerie, orientation, données familiales explicitement retenues, portrait et route distincts ; aucune apparence ou filiation déduite |
| P08 Lou / XP07 Lou | **P08 — Galerie générale.** Fille cisgenre et intersexe ; aucun aménagement scolaire particulier retenu ; petite silhouette et carré cuivré | **XP07 — Intersectionnalités.** Fille cisgenre et intersexe ; aménagement médical scolaire ; distinction entre besoins fonctionnels et informations corporelles ; grande silhouette et dossier fermé | Identifiant, galerie, aménagement, niveaux de circulation de l’information, portrait et route distincts |

### Règles d’interface pour les homonymes

- La clé d’accès, la route, le portrait et les données sont toujours fondés sur
  l’identifiant, jamais sur le seul prénom.
- Dans la galerie et les résultats de recherche, le prénom est accompagné de
  l’identifiant et d’un libellé textuel de galerie.
- L’identifiant reste discret et ne devient pas le titre principal.
- Le retour depuis une fiche renvoie vers la galerie dont provient
  l’identifiant.
- Les portraits des homonymes ne partagent ni visage, ni coiffure, ni silhouette
  principale.
- Aucune fusion de statistiques, d’historique de consultation ou de liens
  éditoriaux n’est autorisée sur la base du prénom.
- Un texte alternatif ne doit pas servir à introduire une différence invisible
  qui n’apparaît pas dans l’image.

## 5. Contrôles globaux avant publication

### 5.1. Contrôles déjà établis dans les sources

- Le document 046 contient exactement 17 biographies.
- La galerie générale comporte 9 personnages, de P01 à P09.
- La galerie Intersectionnalités comporte 8 personnages, de XP01 à XP08.
- Chaque fiche canonique comporte les rubriques 1 à 13 destinées à la partie
  accessible.
- Chaque personnage possède une chronologie indicative et une cartographie des
  dévoilements.
- Les quatre couples d’homonymes sont distincts dans le corpus et dans le
  casting visuel.

### 5.2. Liste d’autorisation des données publiques

La sortie publique applique une liste d’autorisation stricte :

- seules les rubriques 1 à 13 sont autorisées ;
- les rubriques 14 à 17 sont interdites ;
- le titre « Volet réservé au formateur » est interdit ;
- les listes de situations particulièrement concernées sont interdites ;
- les conflits avec la matrice sont interdits ;
- les notes techniques sont interdites ;
- aucun contenu formateur n’est présent dans les métadonnées, le JSON, le
  JavaScript, le HTML généré ou les fichiers publics.

Le contrôle porte sur la sortie réellement produite et chargée par le
navigateur, et pas seulement sur l’interface visible.

### 5.3. Contrôles à effectuer sur la future sortie publique

- [ ] Les 17 identifiants attendus sont présents une seule fois.
- [ ] Chaque enregistrement contient exactement les rubriques 1 à 13.
- [ ] L’ordre et le titre des rubriques sont conservés.
- [ ] Aucune rubrique 14 à 17 n’est présente dans les fichiers générés.
- [ ] Le titre « Volet réservé au formateur » est absent.
- [ ] Les listes de situations particulièrement concernées sont absentes.
- [ ] Les conflits potentiels avec la matrice sont absents.
- [ ] Les descriptions courtes correspondent octet pour octet, ou selon la
  normalisation éditoriale validée, aux descriptions actuellement utilisées par
  le jeu.
- [ ] Les pronoms « iel » et les accords inclusifs de Sam et Charlie sont
  conservés.
- [ ] Chaque portrait correspond au bon identifiant.
- [ ] Chaque portrait dispose d’un texte alternatif approuvé, issu du cahier
  documentaire canonique des illustrations et correspondant au bon portrait.
- [ ] Les fauteuils d’Alex et de Maya restent identifiables dans tous les
  cadrages.
- [ ] L’identifiant et le libellé textuel de la galerie sont visibles pour
  chaque personnage et distinguent explicitement les homonymes.
- [ ] La cartographie mobile utilise des blocs verticaux, conserve l’ordre
  canonique et reste lisible à fort agrandissement et avec un lecteur d’écran.
- [ ] La note narrative principale et le rappel court sont présents dans leur
  formulation exacte.
- [ ] Aucune donnée de la matrice, des feedbacks ou du volet formateur n’apparaît
  dans la page, les métadonnées, les données embarquées ou le contenu chargé par
  le navigateur.

## 6. Prérequis techniques avant publication

La matrice est validée sur le fond. Les vérifications techniques préalables à
la publication portent sur :

- les chemins, noms et extensions réels des 17 fichiers de portraits dans le
  dépôt ;
- leur association par identifiant stable, sans décider ici d’une copie ou
  d’une conversion ;
- la localisation du cahier documentaire canonique des textes alternatifs ;
- la présence, pour chaque portrait, d’un texte alternatif déjà approuvé et
  correspondant au bon identifiant et au bon portrait ;
- la source technique exacte des descriptions courtes actuellement servies par
  le jeu ;
- la preuve d’exclusion des rubriques 14 à 17 et de tout contenu formateur dans
  la sortie réellement produite et chargée par le navigateur.

## 7. Contrôle documentaire de la version 2

- [x] 17 personnages sont présents : 9 P et 8 XP.
- [x] La matrice comporte 16 colonnes de contrôle pour chaque personnage.
- [x] Les quatre couples d’homonymes sont conservés et distingués.
- [x] Les treize rubriques publiques sont autorisées ; les rubriques 14 à 17
  sont explicitement exclues.
- [x] Une page dédiée est retenue pour chaque personnage.
- [x] La Vue d’ensemble est ouverte et les trois autres ensembles sont fermés
  par défaut.
- [x] Les accordéons sont indépendants, le sommaire comporte quatre liens et
  aucune commande globale n’est prévue dans la première version.
- [x] La cartographie mobile de référence utilise des blocs verticaux.
- [x] Le prénom, l’âge, la classe, le libellé textuel de la galerie et
  l’identifiant sont systématiquement visibles.
- [x] La note narrative principale et le rappel court sont fixés dans leur
  formulation exacte.
- [x] Les conventions de portraits restent des correspondances éditoriales à
  vérifier dans le dépôt ; aucune copie ou conversion n’est décidée.
- [x] Les textes alternatifs doivent provenir du cahier canonique et leur
  absence constitue un blocage.
- [x] Aucune biographie, description courte, matrice, situation, illustration
  ou donnée opératoire canonique n’est modifiée.

Aucune incohérence de personnage n’a été repérée lors de la préparation de
cette matrice. Les différences relevées entre homonymes correspondent aux
profils canoniques et ne requièrent aucune modification des biographies, des
descriptions courtes, des matrices, des situations ou des illustrations.
