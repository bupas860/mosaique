# Configurateur de séances — version expérimentale

Ce chantier n'existe que sur la branche `dev-configurateur`. Aucun déploiement sur la version publique ni sur La Forge.

## Objectif

Permettre à un enseignant ou à un formateur de choisir le mode, les personnages disponibles et les situations qui seront présentées aux participants, puis de transmettre une URL personnalisée. Le jeu est exécuté entièrement dans le navigateur, sans compte ni données personnelles collectées par le configurateur.

## Utilisation

1. Dans la version de développement, ouvrir `#/preparer` ou cliquer sur **Préparer une séance (enseignants)** depuis l'accueil.
2. Choisir un des cinq modes.
3. Cocher les personnages autorisés.
4. Sélectionner **exactement 10 situations** dans la banque du mode. Décochez une situation avant d'en ajouter une autre.
5. Copier le lien ou cliquer sur **Tester cette séance**.
6. L'élève ouvre `#/jouer?seance=<configuration>`, sélectionne un personnage autorisé et joue les dix situations choisies.

Le lien embarque uniquement les identifiants de personnages et de situations, dans un encodage Base64URL versionné. La validation a lieu côté navigateur avant de démarrer le moteur de jeu. Les choix sont conservés dans `sessionStorage` pendant une partie, et le redémarrage conserve la configuration de séance. Un lien altéré ou incompatible affiche une erreur, sans lancer une partie libre de repli.

## Améliorations ergonomiques et pédagogique — phase 2

- Recherche dans les titres, les textes des situations et les mécanismes étudiés, avec filtre par catégorie et filtre « situations choisies ».
- Commande **Nouvelle proposition du jeu**, fondée sur le tirage habituel du mode et le premier personnage autorisé ; commande **Tout décocher** pour repartir librement.
- Présentation des points de vigilance éditoriaux déjà présents dans les fiches, sans réécriture des situations.
- **Bilan pédagogique indicatif** : total de situations, situations protectrices, répartition par famille et écarts significatifs avec les règles habituelles de sélection (quotas du mode Découverte, groupes, situations normalement obligatoires, exigences de personnages, marches très peu contrastées).
- Les écarts sont des avertissements, **pas des interdictions**. Le bilan n'établit ni validité institutionnelle ni adaptation à l'âge des élèves : l'enseignant garde la responsabilité de ces choix.
- Lien de reprise enseignant `#/preparer?config=<configuration>`, distinct du lien élève `#/jouer?seance=<configuration>`. Un enseignant peut ainsi transmettre ou conserver la sélection puis la modifier depuis un autre navigateur, sans compte ni stockage serveur.

**Attention :** l'URL Codespaces est une **prévisualisation privée et temporaire**. Elle n'est pas destinée à être distribuée à une classe. Les liens élèves ne deviendront partageables avec les élèves que lorsque la version correspondante sera publiée sur une adresse publique validée.

## Limites assumées de cette première version

- Les parties comportent exactement **10 situations** ; pas encore de durée libre, de tirage au sein d'un pool supérieur à dix ni de réorganisation manuelle avancée.
- L'enseignant choisit des situations dans le mode sélectionné ; le mode Découverte donne accès aux situations V, N et I, tandis que le mode Intersectionnalités utilise la galerie XP. La sélection personnalisée n'applique pas automatiquement tous les quotas et équilibres du tirage libre. Une revue pédagogique de la sélection reste donc nécessaire.
- L'URL **ne constitue pas une mesure de sécurité**. Les fiches complètes restent présentes dans la version publique du code, et le navigateur peut accéder aux autres rubriques de l'application. Le lien limite le contenu de **la séance**, mais ne rend pas les autres contenus inaccessibles.
- La génération est locale : aucun compte enseignant, aucune base de données, aucun suivi centralisé des résultats.
- La compatibilité avec les plateformes externes (Éléa, Magistère) reste à tester sur chaque environnement de diffusion.

## Garanties de non-régression

- La route libre `#/jouer` reste inchangée et conserve ses cinq modes et ses règles de tirage.
- Les sessions configurées sont isolées des sessions libres par une clé de configuration enregistrée dans `sessionStorage`.
- La liste de personnages affichée et l'état des personnages de la marche ne contiennent que la sélection autorisée.
- La relance d'une partie configurée conserve les situations et les personnages définis.
- Les données éditoriales et les illustrations n'ont pas été modifiées.

## Contrôles réalisés lors de l'implémentation

- `npm run build` : réussite.
- Test navigateur Chrome hors Codespaces : générer le lien, limiter les personnages, ouvrir comme élève, démarrer une partie, vérifier les dix identifiants en session, refuser un lien invalide, vérifier le jeu libre et la galerie Intersectionnalités : réussite.

### Contrôles phase 2 (27/10/2026)

- `npm run build` : réussite.
- Test Chrome/Puppeteer isolé du Codespace (quotas GitHub non consommés) : page enseignant, recherche, édition, lien élève et lien de reprise sur navigateur vierge, exclusion d'un personnage de la partie, refus de lien invalide, mode libre et mode Intersectionnalités : réussite.
- Le filtrage n'enlève **aucun contenu du code public** ; il configure uniquement la partie associée au lien.

## Sept propositions thématiques — phase 3 (27/10/2026)

Le configurateur propose désormais des **entrées par intention pédagogique**, jamais par âge, niveau d'étude ou public supposé. Les propositions ne sont ni une labellisation d'adaptation à un niveau scolaire, ni une restriction de contenus. Les modes originaux et la préparation intégralement libre restent accessibles.

| Intention pédagogique | Mode existant | Situations initiales | Personnages initialement cochés |
| --- | --- | --- | --- |
| Comprendre les mécanismes | Découverte | V01, V03, V09, N02, N06, N12, I04, I10, I13, I16 | 9 personnages généraux |
| Confidentialité et dévoilement | Découverte | V05, V13, V10, N01, N03, N02, I10, I13, I14, I16 | 9 personnages généraux |
| Paroles, actes et réactions | Obstacles visibles | V01, V03, V04, V05, V06, V07, V09, V10, V12, V16 | 9 personnages généraux |
| Normes et fonctionnement quotidien | Normes ordinaires | N01, N02, N03, N04, N06, N07, N08, N10, N12, N13 | 9 personnages généraux |
| Représentations et invisibilisation | Effets invisibles | I01, I04, I05, I06, I08, I09, I12, I14, I15, I16 | 8 personnages généraux (sans P04 initialement) |
| Identités, handicap et accessibilité | Intersectionnalités | X01, X02, X04, X05, X08, X11, X12, X16, X13, X14 | XP01, XP02, XP04, XP08 |
| Familles, croyances et assignations | Intersectionnalités | X02, X03, X05, X06, X09, X10, X12, X15, X13, X14 | XP02, XP03, XP05, XP06 |

**Pourquoi certains personnages ne sont pas initialement cochés ?** Les dix situations doivent former une progression compréhensible pour le personnage incarné. Pour la proposition « Représentations et invisibilisation », le personnage P04 n'a qu'une situation à effet d'obstacle dans les dix proposées ; le choix initial privilégie une marche plus contrastée. Pour les deux propositions intersectionnelles, les personnages sélectionnés disposent des situations importantes pour leurs profils. Cette décision est **pédagogique, non liée à l'âge** : l'enseignant peut cocher ou décocher n'importe quel personnage du mode, et les avertissements d'équilibre l'accompagneront dans ses choix.

**Vigilance éditoriale :** la proposition « Familles, croyances et assignations » contient **X09, « Le plan à trois »**, une situation de sexualisation des relations entre femmes. Son intitulé et le contenu figurent dans la liste détaillée accessible avant chargement. L'enseignant demeure responsable du choix des situations et peut la remplacer librement. Il ne s'agit pas de réserver ce thème à un quelconque niveau d'études.

Chaque proposition contient **10 situations distinctes et 2 situations protectrices**. Elles ont été examinées au regard des quotas ou groupes pertinents, des situations obligatoires, des exigences des personnages sélectionnés et de la diversité des décisions du jeu. Elles restent modifiables intégralement : choisir une proposition remplace les choix existants, sans toucher aux modes standards ni aux fichiers éditoriaux de référence.

Les données des propositions sont conservées dans `src/features/teacher/pedagogicalPresets.json` (fichier de configuration de travail, **pas un corpus généré**). L'interface est intégrée à `TeacherConfiguratorPage.tsx`. Le contrôle `npm run check:teacher-presets` vérifie la cohérence de ces ensembles à chaque `npm run build` sur la branche de développement.

**Contrôles de phase 3 :**
- Compilation complète : réussie.
- Vérification automatique des sept propositions dans les cinq modes : réussie.
- Chrome headless sur une prévisualisation locale : chargement des sept propositions, dix situations, personnages cochés, absence d'avertissement d'équilibre, liens élève et de reprise, personnalisation sans être présentée comme une proposition inchangée et absence de régression dans le jeu libre : réussie.
