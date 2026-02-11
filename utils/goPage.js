import { getGameidByUIDAndGroupID, getGameidByUIDAndMatchItem } from '@/api/match.js'

const { token } = useStore('user')

// 页面路径常量
export const PAGES = {
	LOGIN: '/pages/login/login',
	USER: '/pages/user/user',
	ABOUT: '/pages/main/about',
	SEARCH: '/pages/search/searchIndex',
	MATCH_INFO: '/pages/match/matchInfo',
	GYM: '/pages/search/gym',
	TT_GAME: '/pages/setScore/ttGame',
	GROUP: '/pages/setScore/group',
	TOP100: '/pages/search/top100Data',
	RANK: '/pages/search/rank',
	PRE_SIGNUP: '/pages/signUp/preSignUp',
	ENTER_INFO: '/pages/signUp/enterInfo',
	EVENT_MAIN: '/pages/event/eventMain',
	EVENT_HIS: '/pages/user/eventHis',
	FOLLOW_PLAYERS: '/pages/user/followPlayers'
}

/**
 * 检查登录状态
 * @param {boolean} showToast - 是否显示提示
 * @returns {boolean}
 */
function checkLogin(showToast = true) {
	if (!token.value) {
		if (showToast) {
			uni.showToast({ title: '请先登录', icon: 'none' })
		}
		return false
	}
	return true
}

/**
 * 跳转到登录页
 */
function goLogin() {
	uni.reLaunch({ url: PAGES.LOGIN })
}

/**
 * 需要登录的包装器
 * @param {Function} fn - 要执行的函数
 * @returns {Function}
 */
function requireLogin(fn) {
	return function(...args) {
		if (!checkLogin()) return goLogin()
		return fn.apply(this, args)
	}
}

/**
 * 构建带参数的URL
 * @param {string} baseUrl - 基础路径
 * @param {Object} params - 参数对象
 * @returns {string}
 */
function buildUrl(baseUrl, params = {}) {
	const query = Object.entries(params)
		.filter(([, v]) => v !== undefined && v !== null)
		.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
		.join('&')
	return query ? `${baseUrl}?${query}` : baseUrl
}

/**
 * 页面跳转
 * @param {string} url - 目标URL
 * @param {boolean} replace - 是否使用redirectTo
 */
function navigateTo(url, replace = false) {
	const fn = replace ? uni.redirectTo : uni.navigateTo
	fn({ url })
}

// ============ 页面跳转函数 ============

export function goAbout() {
	navigateTo(PAGES.ABOUT)
}

export const goUserPageByUid = requireLogin(function(uid = '') {
	navigateTo(buildUrl(PAGES.USER, { uid }))
})

export function goEventMainPage({ eventid, itemid }) {
	navigateTo(buildUrl(PAGES.EVENT_MAIN, { id: eventid, itemId: itemid }))
}

export function goSearchPage(replace = false) {
	navigateTo(PAGES.SEARCH, replace)
}

export const goMatchDetailByGameid = requireLogin(function(gameid, replace = false) {
	navigateTo(buildUrl(PAGES.MATCH_INFO, { gameid }), replace)
})

export const goMatchDetailByReq = requireLogin(function(params, replace = false) {
	getGameidByUIDAndGroupID(params).then(res => {
		if (res.data?.gameid) {
			goMatchDetailByGameid(res.data.gameid, replace)
		}
	})
})

export const goMatchDetailByTTReq = requireLogin(function(params, replace = false) {
	getGameidByUIDAndMatchItem(params).then(res => {
		if (res.data?.gameid) {
			goMatchDetailByGameid(res.data.gameid, replace)
		}
	})
})

export function goGymDetailPage(id) {
	navigateTo(buildUrl(PAGES.GYM, { id }))
}

export const goTTdetailPage = requireLogin(function({ itemid, eventid }) {
	navigateTo(buildUrl(PAGES.TT_GAME, { itemid, eventid }))
})

export const goGroupDetailPage = requireLogin(function({ itemid, eventid }) {
	navigateTo(buildUrl(PAGES.GROUP, { itemid, eventid }))
})

export function goTop100Page({ tid, name }) {
	navigateTo(buildUrl(PAGES.TOP100, { tid, name }))
}

export function goRankPage() {
	navigateTo(PAGES.RANK)
}

export function goSearchPlayerPage(player) {
	navigateTo(buildUrl(PAGES.SEARCH, { player }))
}

export function goPreSignUp({ itemid, eventid }) {
	navigateTo(buildUrl(PAGES.PRE_SIGNUP, { itemid, eventid }))
}

export function goEnterInfoPage(id) {
	navigateTo(buildUrl(PAGES.ENTER_INFO, { id }))
}

export function goEventHis() {
	navigateTo(PAGES.EVENT_HIS)
}

export function goFollowPlaysHis() {
	navigateTo(PAGES.FOLLOW_PLAYERS)
}
