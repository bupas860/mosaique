# Notice IA — transparence, provenance et assistance à la création

Cette notice documente de manière centralisée l’usage d’outils d’IA générative
dans le projet **Mosaïque — La marche des privilèges**.

Elle vise à assurer une transparence claire sans surcharger l’interface
pédagogique ni imposer une mention répétée sur chaque illustration, texte ou
fichier source.

## Principe de transparence

Des outils d’IA générative ont été utilisés comme assistance dans plusieurs
dimensions du projet :

- production et exploration de certaines illustrations ;
- aide à la rédaction, reformulation, structuration ou révision de contenus
  pédagogiques et éditoriaux ;
- aide au développement, à la révision et au test du code source.

Ces usages ne signifient pas que les contenus sont publiés sans contrôle
humain. La direction pédagogique, les choix éditoriaux, la sélection des
éléments retenus, la validation finale et la responsabilité de publication
relèvent de **Pascal Busac**.

Le projet ne présente donc pas comme « entièrement produit à la main » un
élément qui résulte d’un processus assisté par IA.

## Travail humain et responsabilité éditoriale

Le travail humain comprend notamment :

- la définition des objectifs pédagogiques et du périmètre des parcours ;
- la conception des personnages, des situations et des mécanismes étudiés ;
- la sélection, la réécriture et la validation des textes ;
- la vérification des informations et de leur pertinence pédagogique ;
- la direction visuelle, la sélection des images, les cadrages et variantes ;
- la préparation des exports et leur intégration dans l’application ;
- la rédaction et la validation des textes alternatifs ;
- les choix d’architecture logicielle ;
- la revue du code, les tests, les corrections et la validation des versions
  publiées.

L’usage d’une IA est donc traité comme une **assistance à la création et au
développement**, pas comme un transfert de responsabilité éditoriale.

## Niveau de mention retenu

La politique retenue pour Mosaïque est une **mention centrale et accessible**
dans cette notice, relayée depuis le README et depuis le pied de page de l’accueil public.

Le pied de page utilise l’**icône de base de l’Union européenne pour l’étiquetage
des contenus liés à l’IA**, accompagnée d’un libellé explicite. Cette icône est
facultative et librement réutilisable ; son usage ne signifie pas que le projet
est signataire du code de bonnes pratiques européen et ne constitue pas, à lui
seul, une déclaration de conformité.

Il n’est pas prévu d’ajouter systématiquement une étiquette « généré par IA »
sur chaque image, chaque paragraphe ou chaque fichier de code lorsque cette
répétition n’apporte pas d’information utile supplémentaire.

Une mention plus visible devra néanmoins être ajoutée lorsqu’elle est
nécessaire pour éviter une présentation trompeuse, lorsqu’un contenu pourrait
être confondu avec le témoignage ou l’image authentique d’une personne réelle,
ou lorsqu’une obligation légale particulière l’exige.

## Audit de provenance des illustrations — 6 octobre 2026

Un audit binaire des 175 médias présents dans le dépôt a été réalisé sur le
commit `39b2deb99c195b5e64ca989bbed187702a751ad3`.

Constats :

- 29 PNG contenaient un manifeste C2PA dans un chunk `caBX` ;
- ces manifestes mentionnaient notamment **OpenAI**,
  **OpenAI Media Service API**, **gpt-image**, `c2pa` et le type IPTC
  `trainedAlgorithmicMedia` ;
- aucune chaîne correspondant à un prompt, à une consigne utilisateur ou à un
  texte de génération n’a été détectée dans ces manifestes ;
- les 78 WebP utilisés pour les personnages et les situations ne contenaient
  pas de chunk C2PA détectable ;
- après la première passe de nettoyage de `prep-forge`, seul le hero actif
  V2 reste publié parmi les PNG portant ce type de provenance.

Ce contrôle identifie la présence structurelle des manifestes. Il ne constitue
pas une validation cryptographique complète de chaque signature C2PA.

## Conservation des signaux de provenance

Le projet ne cherche pas à supprimer volontairement les signaux de provenance
uniquement pour dissimuler l’usage d’une IA.

Les métadonnées de provenance déjà présentes, notamment C2PA, sont conservées
lorsqu’elles font partie du fichier source ou publié et qu’aucune transformation
technique nécessaire ne les retire.

Les conversions, recadrages ou optimisations peuvent toutefois modifier ou
supprimer certaines métadonnées. L’absence d’un manifeste C2PA dans un fichier
dérivé ne doit donc pas être interprétée comme la preuve qu’aucune IA n’a été
utilisée.

Les journaux de génération, identifiants de travail, prompts internes ou autres
informations techniques qui ne sont pas nécessaires au fonctionnement, à
l’attribution ou à la provenance n’ont pas vocation à être publiés
systématiquement.

## Licences et droits

Le **code source** de Mosaïque est distribué sous **GNU GPL v3.0 ou ultérieure
(`GPL-3.0-or-later`)**. Voir [`LICENSE`](LICENSE).

Les **contenus pédagogiques, données éditoriales et illustrations** sont
distribués sous **CC BY 4.0**, dans la mesure des droits effectivement détenus.
Voir [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

L’assistance d’une IA n’empêche pas, en elle-même, de publier le code ou les
contenus sous une licence libre. En revanche, une licence ne peut porter que
sur les droits qui existent réellement et que le licenciant peut concéder.

Pour les éléments dont la protection par le droit d’auteur serait inexistante
ou incertaine en raison de leur mode de génération, les licences du dépôt ne
doivent pas être interprétées comme créant artificiellement un droit exclusif.

Les bibliothèques, dépendances et contenus tiers conservent leurs propres
licences et conditions.

## Repères juridiques et bonnes pratiques

Cette notice adopte une règle de prudence :

- ne pas masquer l’usage significatif d’une IA ;
- maintenir un contrôle éditorial humain ;
- préserver les signaux de provenance lorsque cela est raisonnablement
  possible ;
- ne pas revendiquer plus de droits que ceux effectivement détenus ;
- ne pas publier systématiquement les prompts ou journaux de travail lorsqu’ils
  ne sont pas nécessaires à la compréhension ou à la provenance du projet.

Le règlement européen sur l’IA prévoit notamment des obligations spécifiques
de transparence pour certains contenus artificiellement générés ou manipulés,
en particulier les hypertrucages (« deepfakes »). Les illustrations fictives
de Mosaïque ne sont pas présentées comme des photographies ou témoignages
authentiques de personnes réelles.

Pour les textes publiés afin d’informer le public sur des sujets d’intérêt
public, le règlement prévoit également un régime de transparence, avec une
exception lorsque le contenu a fait l’objet d’un contrôle humain ou éditorial
et qu’une personne physique ou morale assume la responsabilité éditoriale de
la publication. Mosaïque est publié sous responsabilité éditoriale humaine.

Cette notice constitue une politique de transparence du projet et non un avis
juridique.

## Sources de référence

- Creative Commons — guidance sur les licences CC et l’IA :
  https://creativecommons.org/cc-license-guidance/
- Règlement (UE) 2024/1689, article 50 :
  https://eur-lex.europa.eu/eli/reg/2024/1689
- OpenAI — conditions d’utilisation pour l’Europe :
  https://openai.com/policies/eu-terms-of-use/
- OpenAI — signaux de provenance C2PA et SynthID :
  https://help.openai.com/en/articles/8912793-provenance-signals-in-openai-generated-content

## Mise à jour

Cette notice doit être révisée si :

- de nouveaux fournisseurs ou outils de génération sont utilisés ;
- le mode de création des illustrations, contenus ou code change de manière
  substantielle ;
- de nouvelles obligations de transparence deviennent applicables ;
- la politique de publication ou de conservation des métadonnées évolue.
