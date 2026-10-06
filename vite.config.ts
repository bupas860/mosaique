import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Chemins relatifs : compatibles avec GitHub Pages (/mosaique/),
  // un domaine Pages Forge unique à la racine et une URL Forge avec sous-chemin.
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
  ],
});
