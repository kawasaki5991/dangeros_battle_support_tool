
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pagesで公開する場合、レポジトリ名をベースパスに設定する必要があります
  base: '/dangeros_battle_support_tool/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // ブラウザのネイティブESモジュールを最大限活用するための設定
    target: 'esnext'
  }
});
