import { getGameidByUIDAndGroupID, getGameidByUIDAndMatchItem } from '@/api/match.js'
const { token } = useStore('user')

function relauch() {
	uni.reLaunch({
		url: '/pages/login/login'
	})
}

function checkLogin() {
	if (!token.value) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
	}
	return !!token.value
}

export function goAbout() {
	uni.navigateTo({
		url: '/pages/main/about'
	})
}

export function goUserPageByUid(uid) {
	if (!checkLogin()) return relauch()
	uni.navigateTo({
		url: `/pages/user/user?uid=${uid}`
	});
}

export function goEventMainPage({ eventid, itemid }) {
	let url = `/pages/event/eventMain?id=${eventid}`
	if (itemid) url += `&itemId=${itemid}`
	uni.navigateTo({ url })
}

export function goSearchPage(replace = false) {
	const goFunc = replace ? uni.redirectTo : uni.navigateTo
	goFunc({
		url: '/pages/search/searchIndex'
	})
}

export function goMatchDetailByReq(params, replace = false) {
	if (!checkLogin()) return relauch()
	getGameidByUIDAndGroupID(params).then(res => {
		if (res.data?.gameid) {
			goMatchDetailByGameid(res.data.gameid, replace)
		}
	})
}

export function goMatchDetailByTTReq(params, replace = false) {
	if (!checkLogin()) return relauch()
	getGameidByUIDAndMatchItem(params).then(res => {
		if (res.data?.gameid) {
			goMatchDetailByGameid(res.data.gameid, replace)
		}
	})
}


export function goMatchDetailByGameid(gameid, replace = false) {
	if (!checkLogin()) return relauch()
	const goFunc = replace ? uni.redirectTo : uni.navigateTo
	goFunc({
		url: `/pages/match/matchInfo?gameid=${gameid}`
	});
}

export function goGymDetailPage(id) {
	uni.navigateTo({
		url: `/pages/search/gym?id=${id}`
	})
}

export function goTTdetailPage({ itemid, eventid }) {
	if (!checkLogin()) return relauch()
	uni.navigateTo({
		url: `/pages/setScore/ttGame?itemid=${itemid}&eventid=${eventid}`
	})
}

export function goGroupDetailPage({ itemid, eventid }) {
	if (!checkLogin()) return relauch()
	uni.navigateTo({
		url: `/pages/setScore/group?itemid=${itemid}&eventid=${eventid}`
	})
}

export function goTop100Page({ tid, name }) {
	uni.navigateTo({
		url: `/pages/search/top100Data?tid=${tid}&name=${name}`
	})
}

export function goRankPage() {
	uni.navigateTo({
		url: '/pages/search/rank'
	})
}

export function goSearchPlayerPage(player) {
	uni.navigateTo({
		url: `/pages/search/searchIndex?player=${player}`
	})
}

export function goPreSignUp({ itemid, eventid }) {
	uni.navigateTo({
		url: `/pages/signUp/preSignUp?itemid=${itemid}&eventid=${eventid}`
	})
}

export function goEnterInfoPage(id) {
	uni.navigateTo({
		url: `/pages/signUp/enterInfo?id=${id}`
	})
}