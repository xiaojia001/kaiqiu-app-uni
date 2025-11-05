const storeExports = {}
const modules = import.meta.glob('./modules/*.js', { eager: true })
for (let key in modules) {
	let module = modules[key].default
	storeExports[module.$id] = module
}

export const pinia = createPinia()
export const setupPinia = (app) => {
	app.use(pinia)
}

const useStore = (storeName) => {
	const store = storeExports[storeName](pinia)
	const storeRefs = storeToRefs(store)
	return { ...store, ...storeRefs }
}

export default useStore