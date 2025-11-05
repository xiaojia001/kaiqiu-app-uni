import http from '@/utils/request/index.js'

/* 获取球馆列表 */
export function getArenaListPageByKey(data) {
	return http.post({
		url: '/arena/lists',
		data,
		custom: {
			showLoading: true,
			showError: true
		}
	})
}

/* 球馆详情 */
export function getArenaDetail(params) {
	return http.get({
		url: '/arena/detail',
		params,
		custom: {
			showLoading: true,
			showError: true
		}
	})
}

export function getArenaMatchList(data) {
	return http.get({
		url: '/arena/match_list',
		data,
		custom: {
			showLoading: true,
			showError: true
		}
	})
} 