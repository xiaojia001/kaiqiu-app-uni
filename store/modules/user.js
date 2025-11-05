import { logout } from '@/api/login.js'
const store = defineStore('user', () => {
	const token = ref(uni.getStorageSync('token'));
	const userInfo = ref(uni.getStorageSync('userInfo') ?? {})
	const location = ref(uni.getStorageSync('userLocation') || [])
	const selectCity = ref(uni.getStorageSync('selectCity') || { id: "1", name: "北京市" })
	const citySelectHis = ref(uni.getStorageSync('citySelectHis') || [])
	const cityName = computed(() => {
		return selectCity.value.name ?? ''
	})
	const isMoreMode = ref(uni.getStorageSync('isMoreMode') || false)

	function setMoreMode() {
		isMoreMode.value = true
		uni.setStorageSync('isMoreMode', true)
	}

	function setToken(val) {
		token.value = val
		uni.setStorageSync('token', val)
	}

	const searchPlayerHis = ref(uni.getStorageSync('searchPlayerHis') || [])

	function setSearchPlayerHis(keyword) {
		if (!keyword.trim()) return
		// 去重处理：如果已存在则先移除
		searchPlayerHis.value = searchPlayerHis.value.filter(item => item !== keyword.trim())
		// 添加到最前面（最新的记录在最上方）
		searchPlayerHis.value.unshift(keyword.trim())
		// 限制最大记录数，这里设为20条
		if (searchPlayerHis.value.length > 20) {
			searchPlayerHis.value.pop()
		}
		// 保存到本地存储
		uni.setStorageSync('searchPlayerHis', searchPlayerHis.value)
	}

	function clearAllSearchPlayerHis() {
		searchPlayerHis.value = []
		uni.setStorageSync('searchPlayerHis', searchPlayerHis.value)
	}


	function setUserInfo(info = null) {
		uni.setStorageSync('userInfo', info || {})
		userInfo.value = info || {}
	}

	function setLocation(locationArr) {
		if (!locationArr) {
			location.value = []
			uni.setStorageSync('userLocation', [])
		} else {
			location.value = locationArr
			uni.setStorageSync('userLocation', locationArr)
		}
	}

	function setCitySelectHis(city) {
		if (citySelectHis.value.some(v => v.id === city.id)) return
		citySelectHis.value = [city, ...citySelectHis.value.slice(0, 5)]
		uni.setStorageSync('citySelectHis', citySelectHis.value)
	}

	function setSelectCity(city = { id: "1", name: "北京市" }) {
		selectCity.value = city
		uni.setStorageSync('selectCity', city)
	}

	function removeAll() {
		setToken(null)
		setUserInfo(null)
		setLocation(null)
	}

	function quitApp() {
		uni.showModal({
			title: '提示',
			content: '确认要退出系统吗?',
			success: async ({
				confirm
			}) => {
				if (!confirm) return
				if (token.value) {
					await logout()
				}
				removeAll()
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		});
	}




	return {
		token,
		setToken,
		userInfo,
		setUserInfo,
		location,
		setLocation,
		quitApp,
		selectCity,
		setSelectCity,
		cityName,
		citySelectHis,
		setCitySelectHis,
		isMoreMode,
		setMoreMode,
		searchPlayerHis,
		clearAllSearchPlayerHis,
		setSearchPlayerHis
	};
});

export default store