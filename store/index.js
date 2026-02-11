// 自动导入所有store模块
const storeExports = {}
const modules = import.meta.glob('./modules/*.js', { eager: true })

for (const key in modules) {
	const module = modules[key].default
	if (module?.$id) {
		storeExports[module.$id] = module
	}
}

// 创建Pinia实例
export const pinia = createPinia()

/**
 * 设置Pinia
 * @param {Object} app - Vue应用实例
 */
export function setupPinia(app) {
	app.use(pinia)
}

/**
 * 使用Store
 * @param {string} storeName - store名称
 * @returns {Object} store实例（包含state和refs）
 */
function useStore(storeName) {
	const store = storeExports[storeName]?.(pinia)
	if (!store) {
		console.error(`Store "${storeName}" not found`)
		return {}
	}
	const storeRefs = storeToRefs(store)
	return { ...store, ...storeRefs }
}

export default useStore
