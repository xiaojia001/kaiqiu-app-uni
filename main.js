import App from './App'
import { createSSRApp } from 'vue'
// import router from './router'
import { setupPinia } from './store'
import 'uno.css'
export function createApp() {
	const app = createSSRApp(App)
	// app.use(router)
	setupPinia(app)
	return {
		app
	}
}