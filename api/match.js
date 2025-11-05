import http from '@/utils/request/index.js'

/* 获取比赛列表 */
export function getMatchListByPage(data) {
	return http.post({
		url: 'match/lists',
		data,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}
// 获取比赛id
// groupid=706231812&uid1=857657&uid2=500323
export function getGameidByUIDAndGroupID(params) {
	return http.get({
		url: '/Match/getGameidByUIDAndGroupID',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

//eventid=138736&itemid=7062318&uid1=414116&uid2=857657
export function getGameidByUIDAndMatchItem(params) {
	return http.get({
		url: '/Match/getGameidByUIDAndMatchItem',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}



// 获取对局详情
export function getGameDetailByGameid(gameid) {
	return http.post({
		url: '/Match/getGameDetail',
		data: {
			gameid
		},
		custom: {
			showLoading: false,
			showError: true
		}
	})
}


//查询所有比赛
/* 2025/11/4更新 
 {
   "lat": "30.57447052001953",
   "lng": "103.92376708984375",
   "city": "成都市",
   "eventTitle": "成都",
   "startMatchTimestamp": "1747122600",
   "endMatchTimestamp": "1762242600",
   "quickTags": "网红,大奖赛,青少年",
   "distance": "lt20",
   "page": "1",
   "search": "1"
 }
 */
export function getMatchListPageByKey(data) {
	return http.post({
		url: '/match/lists',
		data,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

// 获取用户对比赛的操作权限
export function getUserCanManage(eventid) {
	return http.post({
		url: '/User/getUserId',
		data: { eventid },
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

// 比分详情 淘汰赛
// /Arrange/knockout
export function getArrangeKnockout(params) {
	return http.get({
		url: '/Arrange/knockout',
		params,
		custom: {
			// successMsg: '初始化成绩',
			// showSuccess: true,
			showLoading: true,
			showError: true
		}
	})
}

// 更新比分 淘汰赛
// /Match/update_tt_score?groupid=-1&uid1=160001-0&uid2=160004-0&score=2%3A0&smallscore=&eventid=142098&itemid=7066470&gameid=18674080
export function update_tt_score(params) {
	return http.get({
		url: '/Match/update_tt_score',
		params,
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}

//更新比分 小组赛
// /Match/update_score?groupid=706647011&uid1=160002&uid2=160001&score=2%3A1&itemid=7066470&eventid=142098%7D&smallScore=
export function update_score(params) {
	return http.get({
		url: '/Match/update_score',
		params,
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}

// 比分详情 小组赛
// /Match/init_h_games?itemid=7066470&eventid=142098%7D
export function getGroupGames(params) {
	return http.get({
		url: '/Match/init_h_games',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}