# Développement avec GitHub Codespaces — Mosaïque

Cette configuration concerne **uniquement** la branche `dev-configurateur` du dépôt `bupas860/mosaique`.

## Démarrer

1. Sur GitHub, ouvrir la branche `dev-configurateur`, puis **Code → Codespaces → Create codespace on dev-configurateur**.
2. Si un type de machine est demandé, choisir **2 cores** (machine `basicLinux32gb`).
3. Le conteneur utilise Node.js 22, exécute `npm ci` à sa création, puis lance automatiquement `npm run dev -- --host 0.0.0.0` à chaque démarrage.
4. Dans l'onglet **PORTS**, ouvrir la prévisualisation du port **5173**. Elle est configurée comme **Private** et nécessite une authentification GitHub.
5. Pour retrouver le projet depuis un autre ordinateur : ouvrir `https://github.com/codespaces` et reprendre **le même** Codespace.

## Préserver le jeu public et La Forge

- Développement **exclusivement** sur `dev-configurateur`. Contrôler le nom de branche avant chaque commit.
- **Ne pas fusionner** sur `main` ni sur `prep-forge` sans validation explicite.
- Le workflow GitHub Pages actuel déploie `main` uniquement.
- La synchronisation GitHub → La Forge du VPS a été volontairement suspendue le **27/10/2026** ; ne pas la réactiver ni pousser manuellement vers Forge pendant ce chantier.

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
npm run dev -- --host 0.0.0.0
```

La prévisualisation Codespaces n'est **pas** un site publié en production. Son adresse peut changer si l'environnement est recréé.
