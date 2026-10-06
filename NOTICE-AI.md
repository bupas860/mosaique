# Notice IA — provenance des illustrations

Cette notice documente de manière centralisée l’usage d’outils d’IA générative dans le projet **Mosaïque**.

Elle vise à assurer une transparence suffisante sans surcharger l’interface pédagogique ni afficher des mentions techniques sur chaque illustration.

## Principe

Certaines illustrations de Mosaïque ont été produites avec l’assistance d’outils d’IA générative.

Le travail éditorial humain comprend notamment :

- la conception des personnages et des situations ;
- la définition de la direction visuelle ;
- la sélection des images retenues ;
- le choix des cadrages et variantes ;
- la préparation des exports utilisés par l’application ;
- l’intégration des images dans les parcours ;
- la rédaction et la validation des textes alternatifs ;
- le contrôle de la cohérence pédagogique et éditoriale.

Les illustrations ne doivent donc pas être présentées comme entièrement dessinées à la main lorsqu’elles sont issues d’un processus de génération assisté par IA.

## Audit de provenance du 6 octobre 2026

Un audit binaire des 175 médias présents dans le dépôt a été réalisé sur le commit `39b2deb99c195b5e64ca989bbed187702a751ad3`.

Constats :

- 29 PNG contenaient un manifeste C2PA dans un chunk `caBX` ;
- ces manifestes mentionnaient notamment **OpenAI**, **OpenAI Media Service API**, **gpt-image**, `c2pa` et le type IPTC `trainedAlgorithmicMedia` ;
- aucune chaîne correspondant à un prompt, à une consigne utilisateur ou à un texte de génération n’a été détectée dans ces manifestes ;
- les 78 WebP utilisés pour les personnages et les situations ne contenaient pas de chunk C2PA détectable ;
- après la première passe de nettoyage de `prep-forge`, seul le hero actif V2 reste publié parmi les PNG portant ce type de provenance.

Ce contrôle identifie la présence structurelle des manifestes. Il ne constitue pas une validation cryptographique complète de chaque signature C2PA.

## Politique de conservation

Le projet ne cherche pas à supprimer volontairement les signaux de provenance uniquement pour dissimuler l’usage d’une IA.

Les métadonnées de provenance déjà présentes sont conservées lorsqu’elles font partie du fichier source ou publié et qu’aucune contrainte technique n’impose leur transformation.

En revanche, les journaux de génération, identifiants de travail, prompts internes ou autres informations techniques qui ne sont pas nécessaires au fonctionnement, à l’attribution ou à la provenance n’ont pas vocation à être exposés dans l’application publique.

## Licence et droits

Les contenus du projet sont distribués selon les conditions précisées dans [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

Pour une illustration produite avec l’assistance d’une IA, une licence ne peut porter que sur les droits effectivement détenus sur le résultat et sur les contributions humaines concernées.

Cette notice ne remplace pas les conditions de licence et ne constitue pas un avis juridique.

## Mise à jour

Cette notice doit être révisée si :

- de nouveaux fournisseurs ou outils de génération sont utilisés ;
- le mode de création des illustrations change ;
- de nouvelles obligations de transparence deviennent applicables ;
- la politique de publication ou de conservation des métadonnées évolue.
