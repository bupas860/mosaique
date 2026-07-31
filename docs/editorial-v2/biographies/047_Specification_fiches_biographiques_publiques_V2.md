# Mosaïque — Spécification des fiches biographiques publiques

- **Version :** 2.0
- **Statut :** spécification validée, prête pour intégration fonctionnelle
- **Corpus canonique :** `046_Biographies_approfondies_17_personnages_V1.md`
- **Charte de référence :** `040_Charte_biographies_approfondies_V2.md`
- **Périmètre :** P01 à P09 et XP01 à XP08

Le document `047_Specification_fiches_biographiques_publiques_V1.md` reste le
document historique de préparation.

## 1. Cadre et règles non négociables

Les descriptions courtes déjà utilisées pendant le jeu restent inchangées.
Elles continuent à fournir les informations nécessaires pour choisir un personnage et suivre son parcours sans consulter une biographie.

Les biographies approfondies sont des récits fictifs contextualisés. Elles
servent l’analyse pédagogique, mais ne donnent pas un accès direct, exhaustif
ou certain au vécu intérieur d’une personne réelle. Leur consultation reste
toujours facultative.

La fiche constitue une médiation narrative. La personne qui joue ne devient
pas le personnage, ne vit pas réellement son expérience, ne ressent pas
nécessairement ce que le personnage ressent et n’accède pas complètement au
vécu intérieur du personnage. Elle choisit un personnage, suit son parcours et
peut consulter volontairement sa biographie pour l’approfondir.

Seules les rubriques 1 à 13 du document canonique peuvent alimenter les fiches
publiques :

1. Identité dans le jeu ;
2. Vie quotidienne et centres d’intérêt ;
3. Histoire de son rapport à soi ;
4. Chronologie indicative ;
5. Coming in et questionnement ;
6. Cartographie des dévoilements ;
7. Réactions de l’entourage ;
8. Ressources et soutiens ;
9. Parcours d’affirmation, démarches et accompagnements éventuels ;
10. Vécu scolaire ;
11. Expériences positives et ordinaires ;
12. Souhaits et limites actuels ;
13. Ce que le lycée sait réellement.

Les rubriques 14 à 17, le « Volet réservé au formateur », les listes de
situations particulièrement concernées et les avertissements techniques de
compatibilité avec la matrice ne doivent jamais être intégrés aux données
chargées par le navigateur. Les masquer dans l’interface ne constituerait pas
une protection : ils doivent être absents du contenu public généré.

La première version n’intègre aucune correspondance technique avec les
situations, les matrices ou les feedbacks.

## A. Finalité

### A.1. Pourquoi proposer les biographies

Les biographies permettent de :

- replacer chaque décision de jeu dans un parcours, des relations et une
  temporalité ;
- montrer que l’identité ou la caractéristique principalement mobilisée par le
  jeu ne résume pas la personne ;
- rendre visibles les centres d’intérêt, les ressources, les expériences
  positives, les choix et les limites du personnage ;
- distinguer ce que le lecteur apprend de ce qui est effectivement connu par le
  lycée fictif ;
- faire comprendre qu’une même règle scolaire peut produire des effets
  différents selon les personnes et les contextes ;
- soutenir une analyse plus fine sans alourdir le déroulement d’une partie.

### A.2. Apport par rapport aux descriptions courtes

| Description courte | Biographie approfondie |
|---|---|
| Sert au choix rapide du personnage. | Sert à l’approfondissement volontaire. |
| Contient les repères immédiatement nécessaires au jeu. | Ajoute temporalité, entourage, ressources, vécu scolaire et vie ordinaire. |
| Reste visible avant ou pendant la partie. | Est principalement consultée dans `Explorer → Personnages`. |
| Doit rester strictement inchangée. | Reprend uniquement les rubriques publiques validées du corpus canonique. |
| Ne demande pas un temps de lecture important. | Assume une lecture longue, structurée et progressive. |

La fiche approfondie ne remplace donc jamais la carte courte et ne devient pas
un prérequis implicite pour répondre aux situations.

### A.3. Ce que les biographies ne prétendent pas apporter

Elles ne constituent :

- ni un dossier administratif ou médical ;
- ni un diagnostic ;
- ni un modèle universel d’une identité ;
- ni une explication complète de toutes les réponses d’un personnage ;
- ni la preuve qu’un adulte du lycée connaît une information ;
- ni une autorisation à déduire des caractéristiques non écrites ;
- ni une liste de bonnes ou de mauvaises manières d’être LGBT+, cisgenre,
  hétérosexuel, intersexe, en situation de handicap ou membre d’une famille
  donnée.

### A.4. Articulation avec les espaces de Mosaïque

| Espace | Rôle des biographies |
|---|---|
| **Jouer** | Les descriptions courtes restent la référence. La biographie n’est jamais nécessaire pour commencer, comprendre une consigne ou répondre. |
| **Explorer** | `Explorer → Personnages` constitue l’espace principal de consultation des 17 fiches approfondies et ouvre dès la première version, sans attendre les autres sous-espaces d’Explorer. |
| **Comprendre** | Les notions, normes et mécanismes sont expliqués pour eux-mêmes. Une biographie peut ultérieurement offrir un exemple contextualisé, sans transformer le personnage en illustration d’un seul concept. |
| **Sélection du personnage** | Aucun lien biographique dans la première version. Un accès secondaire pourra être étudié ultérieurement, sans concurrencer l’action principale de sélection. |
| **Bilan** | Aucun lien biographique dans la première version. Le bilan est la prochaine possibilité d’accès à prévoir, sans suggérer que la biographie contient la « bonne réponse ». |

### A.5. Prévention de l’essentialisation

L’interface doit rappeler que dix-sept personnages ne représentent pas dix-sept
catégories de personnes. Pour prévenir l’essentialisation :

- les centres d’intérêt et les expériences ordinaires apparaissent dès la vue
  d’ensemble ;
- les difficultés ne sont pas présentées avant tout le reste ;
- les identités ne sont pas transformées en pictogrammes permanents ;
- aucune photographie ou illustration ne rend visuellement détectables une
  orientation, une transidentité ou une intersexuation ;
- les formulations évitent « les personnes comme… » lorsqu’un fait ne concerne
  que le personnage ;
- les personnes cisgenres et hétérosexuelles conservent elles aussi une histoire
  et un rapport aux normes ;
- les parcours trans peuvent comporter reconnaissance, joie et euphorie de
  genre, sans dysphorie automatique ni parcours médical obligatoire ;
- l’intersexuation n’est pas assimilée à une identité de genre ;
- la non-binarité n’entraîne pas automatiquement l’étiquette « trans » lorsque
  le personnage ne l’emploie pas.

### A.6. Principes transversaux préservés

- La transidentité n’est ni une maladie ni une souffrance en elle-même.
- La dysphorie n’est jamais attribuée automatiquement.
- Une éventuelle incongruence n’implique pas nécessairement une souffrance.
- Aucun parcours social, administratif ou médical n’est obligatoire.
- Une démarche médicale ne prouve jamais une identité.
- Les parcours peuvent comporter reconnaissance, joie et euphorie de genre.
- L’intersexuation ne constitue pas automatiquement une identité de genre.
- Une personne non binaire n’est pas automatiquement désignée comme trans si
  elle ne se définit pas ainsi.
- Le coming out n’est ni unique, ni total, ni obligatoire.
- Une famille soutenante peut connaître des inquiétudes, des maladresses et des
  évolutions ; elle n’est pas idéalisée.
- Les personnages cisgenres et hétérosexuels ont eux aussi un rapport aux
  normes, aux contraintes et aux privilèges.

## B. Publics et contextes d’usage

| Public ou contexte | Besoin principal | Usage recommandé | Vigilance particulière |
|---|---|---|---|
| Personne souhaitant approfondir le personnage qu’elle suit | Comprendre son parcours au-delà de la carte courte | Consultation volontaire avant ou après une partie, principalement depuis Explorer | Ne pas donner l’impression qu’il fallait lire la fiche pour bien jouer |
| Professionnel utilisant Mosaïque en formation | Préparer une discussion, contextualiser une réponse, comparer les effets d’une norme | Consultation libre des seules rubriques publiques, éventuellement projetée | Le volet formateur documentaire ne figure pas dans l’application publique |
| Personne consultant librement Explorer | Découvrir les personnages sans lancer de partie | Parcours par galerie, puis lecture d’une fiche dédiée | Expliquer le caractère fictif et pédagogique des biographies |
| Usage individuel | Lecture à son rythme, navigation non linéaire | Accordéons indépendants, sommaire et reprise de lecture | Ne pas imposer l’ouverture de toutes les sections |
| Usage collectif projeté | Lecture commentée par un groupe ou un formateur | Page stable, titres visibles, largeur lisible et sections ouvrables séparément | Ne pas projeter une information comme si elle était connue des adultes du récit |
| Usage collectif animé | Analyse guidée d’une situation ou d’un mécanisme | Sélection préalable de quelques sections publiques pertinentes | Ne pas utiliser les correspondances techniques du volet formateur dans la fiche |

Le même contenu public est proposé à tous ces publics. Il n’existe pas dans le
navigateur de version cachée, de bouton secret ou de mode « formateur » donnant
accès aux rubriques 14 à 17.

## C. Points d’accès

### C.1. Décisions validées

| Point d’accès | Première version | Évolution prévue ou possible |
|---|---|---|
| `Explorer → Personnages` | Point d’accès principal, ouvert sans attendre les autres sous-espaces d’Explorer | Peut être enrichi par des filtres ou une recherche |
| Bilan de partie | Aucun lien biographique | Prochaine possibilité d’accès à prévoir, sous la forme d’un lien facultatif |
| Sélection du personnage | Aucun lien biographique | Peut être étudié après l’accès depuis le bilan, sans ralentir le choix |
| Situation en cours | Aucun lien biographique | Aucun accès à prévoir pendant une situation |

### C.2. Règles communes aux accès

- Lorsqu’un accès facultatif sera ajouté, le lien pourra utiliser le libellé de
  travail **« Découvrir son parcours »**.
- L’action principale de l’écran reste « Choisir », « Jouer », « Continuer » ou
  « Voir le bilan » selon le contexte.
- La fiche ne s’ouvre jamais automatiquement.
- La consultation ne modifie ni la partie, ni les réponses, ni la position du
  personnage.
- Un retour conserve autant que possible la galerie, les filtres et la position
  de défilement antérieurs.
- Aucun lien n’est placé au milieu d’une situation dans la première version.
- La première version n’établit aucune correspondance technique entre une
  biographie et les situations, les matrices ou les feedbacks.

## D. Architecture de la fiche

### D.1. Regroupement des treize rubriques

L’architecture proposée est retenue, avec quatre ensembles thématiques. Les
titres originaux des treize rubriques restent visibles à l’intérieur de ces
ensembles afin de préserver le lien avec le corpus canonique.

| Ensemble | Rubriques canoniques | État initial validé | Présentation |
|---|---|---|---|
| **Vue d’ensemble** | 1. Identité dans le jeu ; 2. Vie quotidienne et centres d’intérêt ; 11. Expériences positives et ordinaires ; 12. Souhaits et limites actuels | Ouvert | Quatre sous-sections de lecture continue ; la personne et sa vie ordinaire apparaissent avant les difficultés |
| **Son parcours** | 3. Histoire de son rapport à soi ; 4. Chronologie indicative ; 5. Coming in et questionnement ; 9. Parcours d’affirmation, démarches et accompagnements éventuels | Fermé | Accordéon thématique ; chronologie comme composant interne autonome |
| **Entourage et confidentialité** | 6. Cartographie des dévoilements ; 7. Réactions de l’entourage ; 8. Ressources et soutiens ; 13. Ce que le lycée sait réellement | Fermé | Accordéon thématique ; cartographie adaptée aux petits écrans ; note de confidentialité rappelée |
| **Au lycée** | 10. Vécu scolaire | Fermé | Accordéon court, directement ciblable depuis le sommaire |

Les accordéons sont indépendants : ouvrir un ensemble ne ferme pas les autres.
Lorsqu’un lien interne ou un futur lien profond cible une rubrique, l’ensemble
concerné s’ouvre automatiquement et le focus est placé de manière prévisible
sur son titre.

### D.2. Niveau d’ouverture

La **Vue d’ensemble** est ouverte par défaut. Elle donne immédiatement accès à
une représentation équilibrée de la personne et évite qu’une fiche apparaisse
comme une succession de difficultés ou de dévoilements.

Les trois autres ensembles sont fermés au premier affichage. Ce choix réduit la
longueur perçue sans supprimer de contenu. La première version ne comporte
aucune commande globale « Tout ouvrir / Tout fermer ». Chaque accordéon possède
sa propre commande. Cette absence dans la première version n’empêche pas
l’ajout ultérieur d’une commande globale accessible.

### D.3. Navigation interne

Une navigation interne légère est utile compte tenu de la longueur des fiches :

- quatre liens correspondant aux quatre ensembles, et non treize liens ;
- sur ordinateur, sommaire latéral pouvant rester visible sans masquer le
  contenu ;
- sur mobile, bouton « Sommaire de la fiche » ouvrant une liste compacte dans
  le flux de la page ;
- lien « Revenir en haut de la fiche » après les ensembles longs ;
- lien « Retour aux personnages » avant le titre et à la fin de la fiche.

Le sommaire n’est pas indispensable pour comprendre la page : l’ordre des
titres reste cohérent lorsque les styles, le positionnement fixe ou les scripts
ne sont pas disponibles.

### D.4. Chronologie indicative

La chronologie conserve l’ordre et le texte canoniques. Sa forme de base est
une liste chronologique structurée. Une ligne verticale, des repères ou des
cartes peuvent enrichir la présentation visuelle, mais :

- les âges et périodes restent écrits dans le texte ;
- l’ordre ne dépend ni de la position horizontale ni de la couleur ;
- aucune animation n’est nécessaire à la compréhension ;
- le qualificatif « indicative » reste visible ;
- la chronologie n’est pas transformée en progression obligatoire ou en
  modèle de parcours.

### D.5. Cartographie des dévoilements

La cartographie conserve les deux informations fondamentales : l’espace ou le
groupe concerné, puis la situation actuelle.

Sur ordinateur et sur les écrans suffisamment larges, elle prend la forme d’un
tableau à deux colonnes :

- espace ou groupe ;
- situation actuelle.

Sur mobile et dans les mises en page étroites, chaque ligne devient un bloc
vertical selon le modèle suivant :

> **[Espace ou groupe]**  
> [Situation actuelle]

Le tableau à défilement horizontal n’est pas retenu comme comportement
principal.

La transformation mobile doit préserver une structure compréhensible par un
lecteur d’écran. Aucun statut ne repose uniquement sur une couleur, une icône
de cadenas ou un pictogramme. Les nuances « informé », « partiellement informé »,
« non informé » et « information non pertinente » restent formulées en toutes
lettres. Le contenu conserve l’ordre canonique et les formulations complètes,
reste lisible à fort agrandissement et ne dépend ni d’une couleur ni d’une
icône.

### D.6. Retour à la galerie

Le retour utilise l’historique de navigation lorsque la fiche a été ouverte
depuis une galerie. Il restaure la galerie générale ou Intersectionnalités, les
éventuels filtres et la position de lecture. Un lien explicite vers
`Explorer → Personnages` reste disponible si aucun état précédent n’existe.

## E. Résumé initial

### E.1. Contenu validé

Avant les ensembles détaillés, l’en-tête de fiche comprend :

- le portrait canonique ;
- le prénom ;
- l’âge et la classe ;
- le libellé textuel de la galerie d’appartenance ;
- l’identifiant `Pxx` ou `XPxx` ;
- la description courte déjà utilisée dans le jeu, reprise sans modification ;
- deux ou trois centres d’intérêt déjà présents dans la rubrique 2 ;
- la note de confidentialité narrative ;
- les liens vers les quatre ensembles.

Le prénom, l’âge, la classe, le libellé textuel de la galerie et l’identifiant
sont systématiquement visibles, avec une présentation discrète de
l’identifiant. Celui-ci ne devient pas le titre principal. La galerie n’est
jamais indiquée uniquement par une couleur.

Exemples :

> Noé  
> 15 ans · Seconde  
> Galerie générale · P01

> Noé  
> 15 ans · Seconde  
> Galerie Intersectionnalités · XP08

### E.2. Ce que le résumé ne doit pas devenir

Le résumé initial n’est pas une dix-huitième rubrique ni une nouvelle
biographie courte. Il ne doit :

- ni reformuler librement l’identité, les relations ou la famille ;
- ni extraire des données du volet formateur ;
- ni annoncer une difficulté comme trait principal ;
- ni déduire une orientation, une identité, un diagnostic ou une information
  familiale à partir du portrait ;
- ni remplacer la description courte canonique du jeu.

Les centres d’intérêt sont sélectionnés dans la rubrique 2 et font l’objet
d’un contrôle éditorial. Ils ne sont pas générés à partir d’une liste de
stéréotypes.

## F. Ergonomie sur ordinateur et mobile

### F.1. Comparaison des contenants

| Option | Avantages | Limites | Décision validée |
|---|---|---|---|
| Page dédiée | URL stable, vraie profondeur de lecture, historique, sommaire, bonne adaptation mobile et accessibilité robuste | Demande un aller-retour vers la galerie | **Retenue pour toutes les fiches** |
| Panneau latéral sur ordinateur | Maintient la galerie visible et convient à un aperçu bref | Largeur insuffisante pour treize rubriques ; comportement différent sur mobile ; focus et retour plus complexes | Non retenu pour la biographie complète ; éventuellement réservé plus tard à un aperçu court |
| Fenêtre modale | Mise en œuvre visuellement compacte | Mauvaise adaptation aux textes longs, défilement imbriqué, gestion du focus et fermeture délicates | Écartée |

Une longue biographie ne doit jamais être enfermée dans une petite fenêtre
modale. La page dédiée est retenue sur ordinateur comme sur mobile afin de
conserver un modèle d’interaction unique.

### F.2. Lecture sur ordinateur

- L’ensemble de la page peut atteindre environ 70 à 76 rem, mais la colonne de
  texte courant reste proche de 65 à 75 caractères par ligne.
- Le portrait et le résumé peuvent occuper deux colonnes au-dessus de 900 px ;
  les contenus longs restent dans une colonne principale.
- Le sommaire latéral ne réduit pas la colonne de texte sous une largeur
  confortable.
- Les tableaux conservent des en-têtes visibles et suffisamment d’espace entre
  les lignes.
- Aucun défilement interne n’est ajouté dans les accordéons.

### F.3. Lecture sur mobile

- L’en-tête passe en une seule colonne : portrait, identité, description courte,
  note narrative, puis sommaire.
- Le portrait reste assez grand pour être reconnu, sans repousser tout le texte
  sous le premier écran.
- Les accordéons occupent toute la largeur disponible et leurs boutons ont une
  zone d’activation confortable.
- Les lignes de la cartographie deviennent des blocs verticaux associant
  explicitement l’espace ou le groupe à sa situation actuelle ; le tableau à
  défilement horizontal n’est pas le comportement principal.
- Aucun élément fixe ne masque le titre ciblé, le bouton de retour ou la fin du
  contenu.

### F.4. Défilement, retour et position de lecture

- Le défilement appartient à la page, jamais à une modale ou à un panneau
  imbriqué.
- Le retour à la galerie restaure la position précédente pendant la session de
  navigation.
- Un retour depuis une autre application ou un rechargement ouvre la fiche à
  son début, sauf si un lien cible explicitement une section.
- L’état des accordéons peut être conservé pendant la visite de la fiche ; il
  n’a pas besoin de devenir une préférence permanente.
- Une section ciblée par un lien est ouverte avant le déplacement du focus.

## G. Accessibilité

### G.1. Structure et navigation

- Une seule balise de titre principal correspond au prénom. L’identifiant reste
  visible et associé à ce titre, mais n’en devient pas le contenu principal.
- Les quatre ensembles utilisent un niveau de titre cohérent ; les treize
  rubriques conservent le niveau immédiatement inférieur.
- Toutes les actions sont accessibles au clavier dans un ordre correspondant à
  l’ordre visuel.
- Le focus reste nettement visible sur les liens, boutons d’accordéon et
  commandes de retour.
- Les liens portent des intitulés explicites, par exemple « Retour aux
  personnages » ou « Découvrir le parcours de Sam », plutôt que « En savoir
  plus » seul.

### G.2. Accordéons

- Chaque en-tête d’accordéon est un bouton.
- Son nom comprend le titre de l’ensemble.
- Son état ouvert ou fermé est annoncé aux technologies d’assistance.
- La relation entre le bouton et le panneau est exposée.
- Le contenu fermé n’est pas parcouru par le clavier.
- Les accordéons restent utilisables à 200 % et 400 % d’agrandissement.
- La première version ne propose pas de commande globale « Tout ouvrir / Tout
  fermer ». Son ajout ultérieur reste possible, sans remplacer les commandes
  propres à chaque accordéon.

### G.3. Couleurs, mouvement et mise en page

- Aucune information n’est portée uniquement par la couleur.
- Les contrastes des textes, liens, bordures et états de focus respectent les
  exigences d’accessibilité retenues pour l’application.
- Le contenu reste utilisable lorsque le texte est agrandi et lorsque la mise en
  page se réorganise en une colonne.
- Les éventuelles animations d’ouverture sont réduites ou supprimées lorsque
  la préférence `prefers-reduced-motion` est active.
- Aucun mouvement automatique, carrousel ou défilement forcé n’est utilisé.

### G.4. Portraits et textes alternatifs

- Les portraits sont toujours associés au personnage par son identifiant
  stable.
- Les textes alternatifs utilisent uniquement les formulations déjà validées
  dans le cahier documentaire des illustrations.
- Aucun texte alternatif n’est généré automatiquement à partir de la
  biographie.
- Aucun texte alternatif ne déduit une orientation, une transidentité, une
  intersexuation, une religion ou une origine non visible.
- L’absence de texte alternatif approuvé pour un portrait constitue un blocage
  de publication.
- La correspondance entre le texte alternatif, l’identifiant et le portrait est
  vérifiée avant publication.
- Le futur travail technique doit localiser le document canonique des textes
  alternatifs avant toute publication.
- Aucune identité invisible n’est déduite de l’image.
- Les fauteuils visibles d’Alex et de Maya ne sont pas recadrés au point de
  devenir méconnaissables.

### G.5. Chronologie et cartographie

- La chronologie est une liste ordonnée compréhensible sans décor graphique.
- Chaque repère temporel est écrit, et non indiqué seulement par sa position.
- La cartographie possède des libellés complets pour les espaces et les états.
- Sur mobile, la transformation visuelle du tableau ne change ni l’ordre ni les
  associations entre cellules.
- Le lecteur d’écran ne rencontre pas simultanément une version « tableau » et
  une version « cartes » dupliquant le même contenu.

## H. Confidentialité narrative

### H.1. Principe

La fiche publique est publique pour la personne qui utilise Mosaïque, mais son
contenu n’est pas public dans l’univers narratif du personnage. Le lecteur peut
connaître un coming in, une réaction familiale, une relation ou un souhait que
la majorité du lycée fictif ignore.

Cette dissociation doit guider toute interprétation :

- consulter une fiche ne donne aucune information nouvelle aux adultes ou aux
  élèves du récit ;
- une situation est évaluée à partir de ce que ses acteurs peuvent réellement
  savoir ;
- une identité ne permet pas de déduire automatiquement le corps, le parcours,
  la famille, les attirances, la santé ou les démarches d’une personne ;
- une information connue dans un espace ne l’est pas nécessairement dans les
  autres ;
- un coming out choisi est distinct d’une transmission sans accord.

### H.2. Notes narratives validées

La note principale apparaît sous le résumé initial, exactement sous cette
forme :

> **À propos de cette fiche**  
> Cette fiche donne au lecteur des informations que le lycée fictif, les autres
> personnages ou l’entourage ne connaissent pas nécessairement. Elles ne
> doivent pas être utilisées comme si elles étaient publiques dans l’histoire.

Au début de l’ensemble « Entourage et confidentialité », le rappel court est
exactement le suivant :

> Les personnes informées varient selon les espaces. Lire cette fiche ne rend
> pas ces informations publiques dans l’histoire.

Ces notes ne prétendent pas que les informations seraient techniquement
confidentielles sur le site public. Elles expliquent uniquement leur statut
dans l’univers narratif.

## I. Données et génération

### I.1. Sources et séparation des responsabilités

- Le Markdown canonique
  `046_Biographies_approfondies_17_personnages_V1.md` reste la source
  éditoriale des biographies.
- Les descriptions courtes sont reprises depuis les données déjà utilisées par
  le jeu ; elles ne sont ni recalculées ni réécrites à partir de la biographie.
- Les portraits et leurs textes alternatifs restent reliés par l’identifiant du
  personnage.
- Les données de navigation et de présentation ne modifient pas le texte
  canonique.
- La première version ne contient aucune correspondance technique avec les
  situations, les matrices ou les feedbacks.

### I.2. Structure conceptuelle de la sortie publique

Chaque enregistrement public contient uniquement :

- l’identifiant stable ;
- le prénom ;
- l’âge et la classe ;
- la galerie ;
- la référence du portrait et son texte alternatif validé ;
- la description courte existante ;
- les treize rubriques publiques, avec leur numéro, leur titre, leur ordre et
  leur contenu ;
- les repères strictement nécessaires à l’affichage de la chronologie, de la
  cartographie et des groupes d’accordéons.

Cette structure ne comporte aucun champ « formateur », aucune liste technique
de situations, aucun conflit avec la matrice, aucune note technique et aucune
donnée issue des rubriques 14 à 17. Aucun contenu formateur ne figure dans les
métadonnées, le JSON, le JavaScript, le HTML généré ou les fichiers publics.

### I.3. Principe d’extraction

La génération applique une liste d’autorisation : elle extrait explicitement
les rubriques numérotées 1 à 13 et s’arrête avant le « Volet réservé au
formateur ». Elle ne consiste pas à copier toute la fiche puis à masquer ou à
retirer quelques champs connus.

Les identifiants `P01–P09` et `XP01–XP08` sont les clés principales. Le prénom
ne sert jamais de clé, de nom de route unique ou de critère de fusion. Les quatre
paires d’homonymes restent donc huit enregistrements distincts.

### I.4. Échecs bloquants de génération

La production publique doit être interrompue si l’un des contrôles suivants
échoue :

- le nombre total n’est pas exactement 17 ;
- la répartition n’est pas exactement de 9 identifiants P et 8 identifiants XP ;
- un identifiant manque, est dupliqué ou ne respecte pas la liste canonique ;
- une fiche ne comporte pas exactement les rubriques publiques 1 à 13 dans
  l’ordre attendu ;
- une rubrique 14, 15, 16 ou 17 apparaît dans la sortie ;
- le titre « Volet réservé au formateur » apparaît dans la sortie ;
- une liste de situations particulièrement concernées ou un avertissement de
  matrice apparaît dans la sortie ;
- une note technique, une correspondance avec les situations, les matrices ou
  les feedbacks, ou tout autre contenu formateur apparaît dans les métadonnées,
  le JSON, le JavaScript, le HTML généré ou les fichiers publics ;
- deux homonymes partagent le même enregistrement, la même route ou le même
  portrait ;
- une description courte diffère de celle déjà utilisée dans le jeu ;
- un contenu est généré après la limite explicite de la rubrique 13 ;
- un portrait ne dispose pas d’un texte alternatif approuvé ou le texte
  alternatif ne correspond pas au bon identifiant et au bon portrait.

Le contrôle doit porter sur la sortie réellement produite et chargée par le
navigateur, et pas seulement sur ce qui est visible après rendu.

## J. Liens avec les autres contenus

| Contenu lié | Première version | Évolution possible | Règle éditoriale |
|---|---|---|---|
| Portraits | Oui, dans la galerie et l’en-tête de fiche | Variantes de cadrage validées | Aucun trait invisible n’est déduit de l’image |
| Galeries | Oui, séparation générale / Intersectionnalités | Filtres ou recherche | L’identifiant et la galerie distinguent les homonymes |
| Situations | Aucun lien dans la première version | Liens depuis le futur Explorateur, après validation éditoriale | Ne jamais publier les listes « situations particulièrement concernées » du volet formateur |
| Mécanismes | Aucun lien direct dans la première version | Renvoi contextualisé depuis Explorer ou Comprendre | Le personnage ne devient pas l’illustration unique d’un mécanisme |
| Modes | La galerie d’appartenance est indiquée | Accès à la galerie depuis la présentation d’un mode | Ne pas afficher les décisions de matrice dans la fiche |
| Comprendre | Lien général possible vers l’espace | Liens vers des notions sélectionnées | Les notions restent expliquées indépendamment des biographies |

Dans une évolution ultérieure, les liens publics sont établis dans une table
éditoriale distincte et validée. Ils ne sont pas dérivés automatiquement des
correspondances techniques du volet formateur.

## K. Critères de validation

### K.1. Corpus et contenu

- [ ] Les 17 biographies sont présentes.
- [ ] Les identifiants P01 à P09 et XP01 à XP08 apparaissent une seule fois.
- [ ] Chaque fiche contient les treize rubriques publiques dans l’ordre
  canonique.
- [ ] Les descriptions courtes du jeu sont conservées à l’identique.
- [ ] Aucun contenu biographique nouveau n’a été rédigé pour le résumé initial.
- [ ] Les textes respectent la charte 040, notamment concernant transidentité,
  non-binarité, intersexuation, coming out et familles soutenantes.
- [ ] Les matrices, situations, mécanismes et illustrations n’ont pas été
  modifiés.

### K.2. Confidentialité

- [ ] Les rubriques 14 à 17 sont absentes des données publiques.
- [ ] Le « Volet réservé au formateur » est absent du contenu chargé par le
  navigateur.
- [ ] Les listes de situations particulièrement concernées sont absentes.
- [ ] Les avertissements de compatibilité avec la matrice sont absents.
- [ ] La note de confidentialité narrative est visible et compréhensible.
- [ ] La rubrique 13 n’est pas utilisée pour supposer que tout le lycée connaît
  la fiche.
- [ ] Une vérification porte sur les fichiers publics générés, pas seulement sur
  l’interface visible.

### K.3. Homonymes et navigation

- [ ] P01 Noé et XP08 Noé possèdent des routes, portraits et données distincts.
- [ ] P02 Jade et XP05 Jade possèdent des routes, portraits et données distincts.
- [ ] P05 Sofia et XP06 Sofia possèdent des routes, portraits et données distincts.
- [ ] P08 Lou et XP07 Lou possèdent des routes, portraits et données distincts.
- [ ] L’identifiant et le libellé textuel de la galerie sont systématiquement
  visibles, y compris hors des couples d’homonymes.
- [ ] Le retour restaure la bonne galerie, les filtres et la position de lecture.

### K.4. Ergonomie et accessibilité

- [ ] La fiche utilise une page dédiée, sans défilement imbriqué.
- [ ] La Vue d’ensemble est ouverte au premier affichage.
- [ ] Les ensembles « Son parcours », « Entourage et confidentialité » et « Au
  lycée » sont fermés au premier affichage.
- [ ] Le sommaire comporte exactement quatre liens vers les quatre ensembles.
- [ ] Les accordéons sont indépendants.
- [ ] Aucune commande globale « Tout ouvrir / Tout fermer » n’est prévue dans la
  première version.
- [ ] La lecture est confortable sur ordinateur et mobile.
- [ ] La navigation complète fonctionne au clavier.
- [ ] Les titres suivent un ordre logique.
- [ ] Les accordéons annoncent leur nom et leur état.
- [ ] Le focus est visible et reste prévisible après une ouverture ou un retour.
- [ ] Aucune information ne repose uniquement sur la couleur.
- [ ] La page reste utilisable avec agrandissement du texte.
- [ ] Les portraits possèdent un texte alternatif validé.
- [ ] Les préférences de réduction des mouvements sont respectées.
- [ ] La chronologie reste compréhensible comme liste textuelle.
- [ ] La cartographie devient sur mobile une succession de blocs verticaux
  conservant l’ordre canonique et les formulations complètes.
- [ ] La cartographie reste lisible à fort agrandissement et avec un lecteur
  d’écran.

### K.5. Contrôle documentaire de la version 2

- [x] Le périmètre porte sur 17 personnages : 9 P et 8 XP.
- [x] Les treize rubriques publiques sont conservées et les rubriques 14 à 17
  sont explicitement exclues.
- [x] La matrice 048 conserve 16 colonnes de contrôle pour chacun des 17
  personnages.
- [x] Les quatre couples d’homonymes sont explicitement contrôlés.
- [x] Chaque biographie est prévue sur une page dédiée.
- [x] La Vue d’ensemble est ouverte et les trois autres ensembles sont fermés
  par défaut.
- [x] La cartographie mobile de référence utilise des blocs verticaux.
- [x] Le prénom, l’âge, la classe, le libellé textuel de la galerie et
  l’identifiant sont visibles ; l’identifiant reste discret.
- [x] La note narrative principale et le rappel court sont fixés dans leur
  formulation exacte.
- [x] Aucune commande globale n’est requise dans la première version.
- [x] Aucune biographie, description courte, matrice, situation, illustration
  ou donnée opératoire canonique n’est modifiée par cette spécification.

## 2. Arbitrages humains validés

| Arbitrage | Décision validée | Conséquence pour la première version |
|---|---|---|
| Ouverture d’Explorer | Ouvrir `Explorer → Personnages` sans attendre les autres sous-espaces | Les 17 biographies deviennent consultables depuis un espace autonome |
| Accès depuis la sélection | Ne pas ajouter encore de lien | La sélection reste centrée sur le choix du personnage |
| Accès depuis le bilan | Ne pas ajouter encore de lien ; le prévoir comme prochaine possibilité d’accès | L’approfondissement après la partie constitue l’évolution prioritaire |
| Accès pendant une situation | Ne placer aucun lien biographique | La consultation ne perturbe pas la situation et n’expose aucune correspondance technique |
| Contenant | Une page dédiée par personnage | Même architecture sur ordinateur et mobile |
| État initial | Vue d’ensemble ouverte ; trois autres ensembles fermés | Divulgation progressive sans perte de contenu |
| Accordéons | Quatre accordéons indépendants ; aucune commande globale dans la première version | Une commande globale pourra être ajoutée ultérieurement |
| Rubriques | Rubriques 1 à 13 uniquement | Rubriques 14 à 17 et tout contenu formateur interdits dans la sortie publique |
| Corpus | Intégrer simultanément les 17 biographies | Aucun lot pilote ni publication partielle |
| Sommaire | Quatre liens correspondant aux quatre ensembles | Navigation interne compacte et stable |
| Galerie et identifiant | Libellé textuel de galerie et identifiant toujours visibles | Les homonymes restent distinguables sans dépendre de la couleur |
| Cartographie mobile | Blocs verticaux | Aucun tableau à défilement horizontal comme comportement principal |
| Données techniques | Aucune correspondance avec situations, matrices ou feedbacks | Les fiches restent indépendantes des données opératoires |

## 3. Première version fonctionnelle validée

La première version applique l’ordre suivant :

1. intégrer simultanément les 17 biographies ;
2. les rendre accessibles depuis une galerie `Explorer → Personnages` ;
3. utiliser une page dédiée pour chaque fiche sur ordinateur et mobile ;
4. conserver strictement les descriptions courtes dans le jeu ;
5. afficher la Vue d’ensemble ouverte, puis trois ensembles fermés, sous forme
   d’accordéons indépendants ;
6. ne créer aucun lien vers une biographie pendant une situation ;
7. ne créer encore aucun lien depuis la sélection ni depuis le bilan ;
8. prévoir le bilan comme prochaine possibilité d’accès ;
9. n’intégrer aucune donnée du volet formateur dans les fichiers publics ;
10. n’intégrer aucune correspondance technique avec les situations, les
    matrices ou les feedbacks ;
11. afficher la cartographie mobile sous forme de blocs verticaux ;
12. afficher systématiquement le prénom, l’âge, la classe, le libellé textuel de
    la galerie et l’identifiant stable.

Cette architecture permet d’utiliser immédiatement le corpus validé sans
transformer la lecture en obligation et sans fragiliser la confidentialité
documentaire.

## 4. Prérequis pour une future intégration

Les décisions éditoriales et fonctionnelles sont validées. Les vérifications
techniques préalables portent uniquement sur :

- les noms, chemins et extensions effectifs des 17 portraits dans le dépôt ;
- l’association de chaque portrait à son identifiant stable ;
- la localisation du cahier documentaire canonique contenant les textes
  alternatifs déjà approuvés ;
- la présence d’un texte alternatif approuvé correspondant au bon identifiant
  et au bon portrait ;
- la source technique actuelle des descriptions courtes, qui doit rester
  inchangée ;
- le comportement déjà utilisé par l’application pour restaurer filtres et
  position de galerie ;
- les conventions existantes de titres, d’accordéons, de focus et de routes.

Les informations nécessaires à une future phase d’intégration sont donc : les
documents 040, 046, 047 et 048 validés ; les sources canoniques des descriptions
courtes ; la correspondance entre identifiants et portraits ; le cahier
canonique des textes alternatifs approuvés ; les conventions d’interface
d’Explorer ; et les commandes de contrôle déjà utilisées par le projet. La
présente spécification ne définit ni code ni modification de contenu canonique.
