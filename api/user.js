import http from '@/utils/request/index.js'
import { presets, mergeConfig } from './_config.js'

// 获取我的页面信息
export function getUserInfo(data) {
	return http.post({
		url: '/user/get_userinfo',
		data,
		custom: mergeConfig(presets.silent, { noToLogin: true })
	})
}

// 获取用户主页信息
export function getAdvProfile(uid) {
	return http.post({
		url: '/user/adv_profile',
		params: { uid },
		custom: presets.loading
	})
}

// 用户近期比赛 - 分页
export function getPageGamesByUid(uid, page) {
	return http.get({
		url: '/User/getGames',
		params: { uid, page },
		custom: presets.standard
	})
}

// 获取我的参赛列表 - 分页
export function getMatchListHisByPage(page) {
	return http.post({
		url: '/center/events',
		data: { page, index: 0 },
		custom: presets.standard
	})
}

// 关注
export function goFolloweeByUid(uid) {
	return http.get({
		url: '/User/followee',
		params: { uid },
		custom: presets.success
	})
}

// 取关
export function goCancelFolloweeByUid(uid) {
	return http.get({
		url: '/User/cancelFollowee',
		params: { uid },
		custom: presets.success
	})
}

// 关注列表
export function getUserFolloweesList() {
	return http.get({
		url: '/User/getUserFolloweesList',
		custom: presets.loading
	})
}

// 获取关注人最近比赛
export function getFolloweeEnrolledMatch(uid) {
	return http.get({
		url: '/User/getFolloweeEnrolledMatch',
		params: { uid },
		custom: presets.standard
	})
}

// 关键字搜索用户
export function getUserListPageByKey(params) {
	return http.get({
		url: '/user/lists',
		params,
		custom: presets.loading
	})
}

// 金币签到
export function getDaySign() {
	return http.post({
		url: '/user/sign',
		custom: mergeConfig(presets.success, { retryCount: 0 })
	})
}

// 获取用户标签 /User/get_tags?uid=0&limitByCount=6&getNegative=false
export function getUserTags(params) {
	return http.get({
		url: '/User/get_tags',
		params,
		custom: presets.loading
	})
}

// 获取用户积分 /User/getUserScores
export function getUserScores(uid) {
	return http.get({
		url: '/User/getUserScores',
		params: { uid },
		custom: presets.loading
	})
}

// 获取用户排行榜列表
export function getPageUserRankList(data) {
	return http.post({
		url: '/user/lists',
		data,
		custom: mergeConfig(presets.success, { showLoading: false })
	})
}

// 报名获取资料
export function getUserinfo0() {
	return http.post({
		url: '/user/get_userinfo0',
		custom: presets.success
	})
}

// 更新用户资料 /user/perfect_info
export function updateUserInfo(data) {
	return http.post({
		url: '/user/perfect_info',
		data,
		custom: presets.success
	})
}

// 获取用户信用 /User/getCredit?uid=0
export function getUserCredit(uid) {
	return http.get({
		url: '/User/getCredit',
		params: { uid },
		custom: presets.standard
	})
}
