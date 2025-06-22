import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  optimizeDeps: {
    include: ["framer-motion", "lucide-react"],
  },
});
