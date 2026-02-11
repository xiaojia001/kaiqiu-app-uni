import http from '@/utils/request/index.js'
import { presets } from './_config.js'

// 获取球馆列表
export function getArenaListPageByKey(data) {
	return http.post({
		url: '/arena/lists',
		data,
		custom: presets.loading
	})
}

// 球馆详情
export function getArenaDetail(params) {
	return http.get({
		url: '/arena/detail',
		params,
		custom: presets.loading
	})
}

// 获取球馆比赛列表
export function getArenaMatchList(data) {
	return http.get({
		url: '/arena/match_list',
		data,
		custom: presets.loading
	})
}
