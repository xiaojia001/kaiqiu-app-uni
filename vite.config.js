import { defineConfig } from 'vite'
import AutoImport from "unplugin-auto-import/vite"
import uni from '@dcloudio/vite-plugin-uni'
import TransformPages from 'uni-read-pages-vite'
export default async () => {
	const UnoCSS = (await import('unocss/vite')).default //v0.58后break change
	return defineConfig({
		plugins: [
			uni(),
			AutoImport({
				imports: [
					"vue",
					"uni-app",
					{
						from: 'pinia',
						imports: ['defineStore', 'createPinia', 'storeToRefs']
					},
					{
						from: 'uni-mini-router',
						imports: ['createRouter', 'useRouter', 'useRoute']
					}
				],
				dirs: [
					'./store/useStore'
				],
				dts: 'auto-import.d.ts'
			}),
			UnoCSS(),
		],
		server: {
			port: 5173,
			proxy: {
				'/devApi': {
					target: 'https://kaiqiuwang.cc', // 目标服务器
					changeOrigin: true,
					rewrite: path => path.replace(/^\/devApi/, 'https://kaiqiuwang.cc/xcx/public/index.php/api'),
				},
			},
		},
		define: {
			ROUTES: new TransformPages(__dirname).routes
		}
	})
}