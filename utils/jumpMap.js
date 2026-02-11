import { showConfirm, showActionSheet } from './modal.js'

// 地图应用配置
const MAP_APPS = {
	baidu: {
		android: { pname: 'com.baidu.BaiduMap', action: 'baidumap://' },
		url: (lat, lon, address) => `baidumap://map/marker?location=${lat},${lon}&title=${encodeURIComponent(address)}&src=com.bailb.hbb`
	},
	amap: {
		android: { pname: 'com.autonavi.minimap', action: 'androidamap://' },
		ios: 'iosamap://',
		url: (lat, lon, address, isIOS = false) => isIOS
			? `iosamap://viewMap?sourceApplication=com.bailb.hbb&poiname=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&dev=1`
			: `androidamap://viewMap?sourceApplication=com.bailb.hbb&poiname=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&dev=0`
	},
	apple: {
		url: (lat, lon, address) => `http://maps.apple.com/?q=${encodeURIComponent(address)}&ll=${lat},${lon}&spn=0.008766,0.019441`
	},
	google: {
		url: (lat, lon, address) => `geo:${lat},${lon}?q=${encodeURIComponent(address)}`
	}
}

/**
 * 检查应用是否安装（仅Android）
 * @param {string} pname - 包名
 * @param {string} action - Action
 * @returns {boolean}
 */
function isAppInstalled(pname, action) {
	return plus.runtime.isApplicationExist({ pname, action })
}

/**
 * 打开URL
 * @param {string} url - 要打开的URL
 */
function openURL(url) {
	plus.runtime.openURL(url)
}

/**
 * 显示地图选择并打开
 * @param {string} title - 地图名称
 * @param {string} url - 地图URL
 */
async function confirmAndOpenMap(title, url) {
	const confirmed = await showConfirm('公告', `是否打开"${title}"进行导航？`)
	if (confirmed) openURL(url)
}

/**
 * 处理Android地图跳转
 * @param {Object} item - 位置信息
 */
function handleAndroidMap(item) {
	const { address, latitude, longitude } = item
	const hasBaidu = isAppInstalled(MAP_APPS.baidu.android.pname, MAP_APPS.baidu.android.action)
	const hasAmap = isAppInstalled(MAP_APPS.amap.android.pname, MAP_APPS.amap.android.action)

	// 两个地图都安装，显示选择
	if (hasAmap && hasBaidu) {
		showActionSheet('选择地图应用', [
			{ title: '百度地图' },
			{ title: '高德地图' }
		]).then(index => {
			if (index === 0) openURL(MAP_APPS.baidu.url(latitude, longitude, address))
			else if (index === 1) openURL(MAP_APPS.amap.url(latitude, longitude, address))
		})
		return
	}

	// 只安装了高德
	if (hasAmap) {
		confirmAndOpenMap('高德地图', MAP_APPS.amap.url(latitude, longitude, address))
		return
	}

	// 只安装了百度
	if (hasBaidu) {
		confirmAndOpenMap('百度地图', MAP_APPS.baidu.url(latitude, longitude, address))
		return
	}

	// 都没安装，使用Google地图
	confirmAndOpenMap('GoogleMap', MAP_APPS.google.url(latitude, longitude, address))
}

/**
 * 处理iOS地图跳转
 * @param {Object} item - 位置信息
 */
function handleIOSMap(item) {
	const { address, latitude, longitude } = item

	showActionSheet('选择地图应用', [
		{ title: 'Apple地图' },
		{ title: '百度地图' },
		{ title: '高德地图' }
	]).then(index => {
		let url = ''
		switch (index) {
			case 0:
				url = MAP_APPS.apple.url(latitude, longitude, address)
				break
			case 1:
				url = MAP_APPS.baidu.url(latitude, longitude, address)
				break
			case 2:
				url = MAP_APPS.amap.url(latitude, longitude, address, true)
				break
		}
		if (url) {
			plus.runtime.openURL(url, () => {
				plus.nativeUI.alert('本机未安装指定的地图应用')
			})
		}
	})
}

/**
 * 地图跳转主函数
 * @param {Object} item - 包含address, latitude, longitude的对象
 */
export default function jumpMap(item) {
	if (!item?.latitude || !item?.longitude) {
		uni.showToast({ title: '位置信息不完整', icon: 'none' })
		return
	}

	if (plus.os.name === 'Android') {
		handleAndroidMap(item)
	} else {
		handleIOSMap(item)
	}
}
