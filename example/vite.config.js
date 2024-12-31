import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/chakra-dayzed-datepicker/",
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    }
  }
});
