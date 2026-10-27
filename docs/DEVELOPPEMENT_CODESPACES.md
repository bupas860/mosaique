# Développement avec GitHub Codespaces — Mosaïque

Cette configuration concerne **uniquement** la branche `dev-configurateur` du dépôt `bupas860/mosaique`.

## Démarrer

1. Sur GitHub, ouvrir la branche `dev-configurateur`, puis **Code → Codespaces → Create codespace on dev-configurateur**.
2. Si un type de machine est demandé, choisir **2 cores** (machine `basicLinux32gb`).
3. Le conteneur utilise Node.js 22 et installe les dépendances avec `npm ci` lors de sa création. Le script `.devcontainer/ensure-vite.sh` lance le serveur automatiquement **au démarrage et à chaque rattachement à VS Code** ; il vérifie d'abord si le port 5173 répond déjà pour éviter les doublons.
4. Dans l'onglet **PORTS**, ouvrir la prévisualisation du port **5173**. Elle est configurée comme **Private** et nécessite une authentification GitHub.
5. Pour retrouver le projet depuis un autre ordinateur : ouvrir `https://github.com/codespaces` et reprendre **le même** Codespace.

## Préserver le jeu public et La Forge

- Développement **exclusivement** sur `dev-configurateur`. Contrôler le nom de branche avant chaque commit.
- **Ne pas fusionner** sur `main` ni sur `prep-forge` sans validation explicite.
- Le workflow GitHub Pages actuel déploie `main` uniquement.
- La synchronisation GitHub → La Forge du VPS a été volontairement suspendue le **27/10/2026** ; ne pas la réactiver ni pousser manuellement vers Forge pendant ce chantier.

## Appliquer cette amélioration dans un Codespace déjà créé

Le simple ajout de fichiers sur GitHub ne met pas à jour un Codespace déjà ouvert.

1. Dans le terminal de ce Codespace, vérifier la branche : `git branch --show-current` (attendu : `dev-configurateur`).
2. Si aucun changement local n'est en cours, saisir : `git pull --ff-only origin dev-configurateur`.
3. Ouvrir la palette de commandes **Ctrl+Maj+P** et lancer **Codespaces: Rebuild Container** (reconstruction normale, pas **Full Rebuild**). Cette étape applique les nouveaux hooks de démarrage.
4. Après ouverture de l'éditeur, aller dans **PORTS → 5173 → Ouvrir dans le navigateur**. Le serveur doit maintenant se lancer sans commande manuelle.
5. Pour tester le redémarrage automatique, arrêter puis redémarrer **le même Codespace** depuis `https://github.com/codespaces`.

En cas de problème : `cat /tmp/mosaique-vite.log`. Pour déclencher immédiatement une vérification sans attendre un redémarrage : `bash .devcontainer/ensure-vite.sh`. Ce script est idempotent et ne relance pas Vite s'il répond déjà.

Ne pas choisir « Rebuild Container » si des modifications locales non sauvegardées sont en cours : les consigner dans Git avant l'opération.

## Limiter l'usage gratuit

- Utiliser la machine **2 cœurs**, pas 4 cœurs.
- Régler éventuellement **Settings → Codespaces → Default idle timeout** sur **15 minutes** avant de créer le Codespace (le défaut GitHub est 30 minutes).
- Arrêter le Codespace en fin de séance dans `https://github.com/codespaces` : menu **… → Stop codespace**.
- Les ressources de calcul ne sont décomptées que lorsque le Codespace fonctionne ; **le stockage** continue d'être comptabilisé tant que le Codespace existe.
- Enregistrer les changements (commit puis push sur `dev-configurateur`) pour retrouver le travail indépendamment du Codespace.
- Ne pas multiplier les Codespaces pour le même projet.

## Commandes utiles depuis le terminal Codespaces

```bash
git branch --show-current
git status
# Le serveur Vite démarre automatiquement ; si nécessaire :
bash .devcontainer/ensure-vite.sh
```

La prévisualisation Codespaces n'est **pas** un site publié en production. Son adresse peut changer si l'environnement est recréé.
