#!/usr/bin/env bash
# Démarrage idempotent du serveur de prévisualisation dans GitHub Codespaces.
# Ce script ne publie rien sur GitHub Pages ni sur La Forge.
set -euo pipefail

cd "$(dirname "$0")/.."
PORT=5173
URL="http://127.0.0.1:${PORT}/"
LOG="${TMPDIR:-/tmp}/mosaique-vite.log"
LOCK="${TMPDIR:-/tmp}/mosaique-vite-start.lock"

is_ready() {
  curl --silent --show-error --fail --max-time 2 --output /dev/null "$URL" 2>/dev/null
}

# Lancement au démarrage et au rattachement : ne jamais créer deux serveurs.
exec 9>"$LOCK"
flock -x 9

if is_ready; then
  echo "Mosaïque : serveur déjà disponible sur le port $PORT."
  exit 0
fi

if [ ! -d node_modules ]; then
  echo "Mosaïque : installation des dépendances…"
  npm ci
fi

echo "Mosaïque : démarrage du serveur Vite sur le port $PORT…"
# setsid isole le serveur des commandes de démarrage de VS Code ;
# nohup + redirections évitent son arrêt à la fin de la commande.
# 9>&- empêche le serveur de conserver le verrou après son lancement.
nohup setsid npm run dev -- --host 0.0.0.0 --port "$PORT" --strictPort \
  </dev/null >>"$LOG" 2>&1 9>&- &

for _ in $(seq 1 25); do
  if is_ready; then
    echo "Mosaïque : prévisualisation prête sur le port $PORT."
    exit 0
  fi
  sleep 1
done

echo "Mosaïque : le serveur ne répond pas. Extrait du journal :" >&2
tail -n 35 "$LOG" >&2 || true
exit 1
