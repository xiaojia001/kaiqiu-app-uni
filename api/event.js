import http from '@/utils/request/index.js'
import { presets, mergeConfig } from './_config.js'

// 赛事主页信息
export function getEventDetaiByIdAndLocation(params) {
	return http.get({
		url: '/enter/detail',
		params,
		custom: presets.standard
	})
}

// 参赛名单
export function get_member_detail(params) {
	return http.get({
		url: '/enter/get_member_detail',
		params,
		custom: presets.standard
	})
}

// tab 分组 - 分组接口
export function getGroups(params) {
	return http.get({
		url: '/Match/get_groups',
		params,
		custom: presets.standard
	})
}

// tab 成绩 - 名次接口
export function getAllHonors(params) {
	return http.get({
		url: '/Match/get_all_honors',
		params,
		custom: presets.standard
	})
}

// tab 成绩接口
export function getAllResult(params) {
	return http.get({
		url: '/Match/getResult',
		params,
		custom: presets.standard
	})
}

// 获取积分变更
export function getScoreChangeByEventid(eventid) {
	return http.get({
		url: '/Match/getScoreChange2',
		params: { eventid },
		custom: presets.standard
	})
}

// 报名前置信息获取
export function getSignUpItems(id) {
	return http.get({
		url: '/enter/get_items',
		params: { id },
		custom: presets.standard
	})
}

// 报名 /enter/create
export function createEnter(data) {
	return http.post({
		url: '/enter/create',
		data,
		custom: mergeConfig(presets.full, { ContentType: 'application/json' })
	})
}

// 报名完成信息 /enter/enterinfo?match_itemid=7070238&enter_id=3915442
export function getEnterinfo(match_itemid) {
	return http.get({
		url: '/enter/enterinfo',
		params: { match_itemid },
		custom: presets.standard
	})
}

// 取消报名 /enter/cancel_enter?enter_id=3915628&match_id=145181...
export function cancelEnter(params) {
	return http.get({
		url: '/enter/cancel_enter',
		params,
		custom: presets.standard
	})
}
