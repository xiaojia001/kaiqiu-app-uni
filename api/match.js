import http from '@/utils/request/index.js'
import { presets } from './_config.js'

// 获取比赛列表
export function getMatchListByPage(data) {
	return http.post({
		url: '/match/lists',
		data,
		custom: presets.standard
	})
}

// 获取比赛id (groupid=706231812&uid1=857657&uid2=500323)
export function getGameidByUIDAndGroupID(params) {
	return http.get({
		url: '/Match/getGameidByUIDAndGroupID',
		params,
		custom: presets.standard
	})
}

// 获取比赛id (eventid=138736&itemid=7062318&uid1=414116&uid2=857657)
export function getGameidByUIDAndMatchItem(params) {
	return http.get({
		url: '/Match/getGameidByUIDAndMatchItem',
		params,
		custom: presets.standard
	})
}

// 获取对局详情
export function getGameDetailByGameid(gameid) {
	return http.post({
		url: '/Match/getGameDetail',
		data: { gameid },
		custom: presets.standard
	})
}

// 查询所有比赛
export function getMatchListPageByKey(data) {
	return http.post({
		url: '/match/lists',
		data,
		custom: presets.standard
	})
}

// 获取用户对比赛的操作权限
export function getUserCanManage(eventid) {
	return http.post({
		url: '/User/getUserId',
		data: { eventid },
		custom: presets.standard
	})
}

// 比分详情 - 淘汰赛 /Arrange/knockout
export function getArrangeKnockout(params) {
	return http.get({
		url: '/Arrange/knockout',
		params,
		custom: presets.loading
	})
}

// 更新比分 - 淘汰赛
export function update_tt_score(params) {
	return http.get({
		url: '/Match/update_tt_score',
		params,
		custom: presets.success
	})
}

// 更新比分 - 小组赛
export function update_score(params) {
	return http.get({
		url: '/Match/update_score',
		params,
		custom: presets.success
	})
}

// 比分详情 - 小组赛 /Match/init_h_games?itemid=7066470&eventid=142098
export function getGroupGames(params) {
	return http.get({
		url: '/Match/init_h_games',
		params,
		custom: presets.standard
	})
}
