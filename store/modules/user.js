import { logout } from '@/api/login.js'

// Storage Keys
const STORAGE_KEYS = {
	TOKEN: 'token',
	USER_INFO: 'userInfo',
	LOCATION: 'userLocation',
	SELECT_CITY: 'selectCity',
	CITY_HISTORY: 'citySelectHis',
	SEARCH_HISTORY: 'searchPlayerHis',
	MORE_MODE: 'isMoreMode'
}

// 默认城市
const DEFAULT_CITY = { id: '1', name: '北京市' }

// 从Storage获取数据
function getStorage(key, defaultValue = null) {
	try {
		const value = uni.getStorageSync(key)
		return value !== undefined && value !== null ? value : defaultValue
	} catch {
		return defaultValue
	}
}

// 设置Storage
function setStorage(key, value) {
	try {
		uni.setStorageSync(key, value)
	} catch (e) {
		console.error(`Storage set error [${key}]:`, e)
	}
}

// 移除Storage
function removeStorage(key) {
	try {
		uni.removeStorageSync(key)
	} catch (e) {
		console.error(`Storage remove error [${key}]:`, e)
	}
}

const store = defineStore('user', () => {
	// ============ State ============
	const token = ref(getStorage(STORAGE_KEYS.TOKEN, ''))
	const userInfo = ref(getStorage(STORAGE_KEYS.USER_INFO, {}))
	const location = ref(getStorage(STORAGE_KEYS.LOCATION, []))
	const selectCity = ref(getStorage(STORAGE_KEYS.SELECT_CITY, DEFAULT_CITY))
	const citySelectHis = ref(getStorage(STORAGE_KEYS.CITY_HISTORY, []))
	const searchPlayerHis = ref(getStorage(STORAGE_KEYS.SEARCH_HISTORY, []))
	const isMoreMode = ref(getStorage(STORAGE_KEYS.MORE_MODE, false))

	// 确保 citySelectHis 是数组
	if (!Array.isArray(citySelectHis.value)) {
		citySelectHis.value = []
		setStorage(STORAGE_KEYS.CITY_HISTORY, [])
	}

	// 确保 searchPlayerHis 是数组
	if (!Array.isArray(searchPlayerHis.value)) {
		searchPlayerHis.value = []
		setStorage(STORAGE_KEYS.SEARCH_HISTORY, [])
	}

	// ============ Getters ============
	const cityName = computed(() => selectCity.value?.name ?? '')
	const isLoggedIn = computed(() => !!token.value)

	// ============ Actions ============

	/**
	 * 设置Token
	 * @param {string|null} val
	 */
	function setToken(val) {
		token.value = val || ''
		if (val) {
			setStorage(STORAGE_KEYS.TOKEN, val)
		} else {
			removeStorage(STORAGE_KEYS.TOKEN)
		}
	}

	/**
	 * 设置用户信息
	 * @param {Object|null} info
	 */
	function setUserInfo(info = null) {
		const data = info || {}
		userInfo.value = data
		setStorage(STORAGE_KEYS.USER_INFO, data)
	}

	/**
	 * 设置位置信息
	 * @param {Array|null} locationArr
	 */
	function setLocation(locationArr) {
		const data = locationArr || []
		location.value = data
		setStorage(STORAGE_KEYS.LOCATION, data)
	}

	/**
	 * 设置当前选择城市
	 * @param {Object} city
	 */
	function setSelectCity(city = DEFAULT_CITY) {
		selectCity.value = city
		setStorage(STORAGE_KEYS.SELECT_CITY, city)
	}

	/**
	 * 添加城市选择历史
	 * @param {Object} city
	 */
	function setCitySelectHis(city) {
		// 确保 citySelectHis 是数组
		if (!Array.isArray(citySelectHis.value)) {
			citySelectHis.value = []
		}
		
		if (citySelectHis.value.some(v => v.id === city.id)) return
		citySelectHis.value = [city, ...citySelectHis.value.slice(0, 5)]
		setStorage(STORAGE_KEYS.CITY_HISTORY, citySelectHis.value)
	}

	/**
	 * 设置更多模式
	 */
	function setMoreMode() {
		isMoreMode.value = true
		setStorage(STORAGE_KEYS.MORE_MODE, true)
	}

	/**
	 * 添加搜索历史
	 * @param {string} keyword
	 */
	function setSearchPlayerHis(keyword) {
		if (!keyword?.trim()) return

		// 确保 searchPlayerHis 是数组
		if (!Array.isArray(searchPlayerHis.value)) {
			searchPlayerHis.value = []
		}

		const trimmed = keyword.trim()
		// 去重并移到最前
		const filtered = searchPlayerHis.value.filter(item => item !== trimmed)
		filtered.unshift(trimmed)

		// 限制最大记录数
		searchPlayerHis.value = filtered.slice(0, 20)
		setStorage(STORAGE_KEYS.SEARCH_HISTORY, searchPlayerHis.value)
	}

	/**
	 * 清空搜索历史
	 */
	function clearAllSearchPlayerHis() {
		searchPlayerHis.value = []
		removeStorage(STORAGE_KEYS.SEARCH_HISTORY)
	}

	/**
	 * 清除所有用户数据
	 */
	function removeAll() {
		setToken(null)
		setUserInfo(null)
		setLocation(null)
	}

	/**
	 * 退出应用
	 */
	async function quitApp() {
		const confirmed = await new Promise(resolve => {
			uni.showModal({
				title: '提示',
				content: '确认要退出系统吗?',
				success: ({ confirm }) => resolve(confirm)
			})
		})

		if (!confirmed) return

		if (token.value) {
			try {
				await logout()
			} catch {
				// 登出失败继续清理本地数据
			}
		}

		removeAll()
		uni.reLaunch({ url: '/pages/login/login' })
	}

	return {
		// State
		token,
		userInfo,
		location,
		selectCity,
		citySelectHis,
		isMoreMode,
		searchPlayerHis,
		// Getters
		cityName,
		isLoggedIn,
		// Actions
		setToken,
		setUserInfo,
		setLocation,
		setSelectCity,
		setCitySelectHis,
		setMoreMode,
		setSearchPlayerHis,
		clearAllSearchPlayerHis,
		removeAll,
		quitApp
	}
})

export default store
