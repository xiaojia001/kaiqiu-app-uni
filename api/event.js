import http from '@/utils/request/index.js'
/* 赛事主页信息 */
export function getEventDetaiByIdAndLocation(params) {
	return http.get({
		url: '/enter/detail',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

/* 参赛名单 */
export function get_member_detail(params) {
	return http.get({
		url: '/enter/get_member_detail',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

/* tab 分组 分组接口 */
export function getGroups(params) {
	return http.get({
		url: '/Match/get_groups',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

/* tab 成绩 名次接口 */
export function getAllHonors(params) {
	return http.get({
		url: '/Match/get_all_honors',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}


/* tab 成绩接口 */
export function getAllResult(params) {
	return http.get({
		url: '/Match/getResult',
		params,
		custom: {
			showLoading: false,
			showError: true
		}
	})
}



export function getScoreChangeByEventid(eventid) {
	return http.get({
		url: '/Match/getScoreChange2',
		params: { eventid },
		custom: {
			showLoading: false,
			showError: true
		}
	})
}