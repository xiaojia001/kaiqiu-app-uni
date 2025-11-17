import http from '@/utils/request/index.js'
// 获取我的页面 信息
export function getUserInfo(data) {
	return http.post({
		url: '/user/get_userinfo',
		data,
		custom: {
			noToLogin: true,
			showLoading: false,
			showError: false
		}
	})
}

// 获取用户主页信息
export function getAdvProfile(uid) {
	return http.post({
		url: '/user/adv_profile',
		params: {
			uid
		},
		custom: {
			showLoading: true,
			showError: true
		}
	})
}

// 用户近期比赛  分页
export function getPageGamesByUid(uid, page) {
	return http.get({
		url: 'User/getGames',
		params: {
			uid,
			page
		},
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

// 获取我的参赛列表 分页
export function getMatchListHisByPage(page) {
	return http.post({
		url: '/center/events',
		data: {
			page,
			index: 0
		},
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

// 关注
export function goFolloweeByUid(uid) {
	return http.get({
		url: 'User/followee',
		params: {
			uid
		},
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}

// 取关
export function goCancelFolloweeByUid(uid) {
	return http.get({
		url: 'User/cancelFollowee',
		params: {
			uid
		},
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}

// 关注列表
export function getUserFolloweesList() {
	return http.get({
		url: 'User/getUserFolloweesList',
		custom: {
			showSuccess: false,
			showLoading: true,
			showError: true
		}
	})
}

// 获取关注人最近比赛
export function getFolloweeEnrolledMatch(uid) {
	return http.get({
		url: 'User/getFolloweeEnrolledMatch',
		params: {
			uid
		},
		custom: {
			showSuccess: false,
			showLoading: false,
			showError: true
		}
	})
}

// 关键字搜索用户
export function getUserListPageByKey(params) {
	return http.get({
		url: '/user/lists',
		params,
		custom: {
			showLoading: true,
			showError: true
		}
	})
}


// 金币签到
export function getDaySign() {
	return http.post({
		url: '/user/sign',
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}

// /User/get_tags?uid=0&limitByCount=6&getNegative=false 获取用户标签
export function getUserTags(params) {
	return http.get({
		url: '/User/get_tags',
		params,
		custom: {
			showLoading: true,
			showError: true
		}
	})
}

// /User/getUserScores?uid=384588
export function getUserScores(uid) {
	return http.get({
		url: '/User/getUserScores',
		params: { uid },
		custom: {
			showLoading: true,
			showError: true
		}
	})
}


// https://kaiqiuwang.cc/xcx/public/index.php/api/user/lists
/* 
 {
   "city": "-1",
   "now": "成都市",
   "sort": "2",
   "page": "1",
   "index": "31111"
 }
 */
export function getPageUserRankList(data) {
	return http.post({
		url: '/user/lists',
		data,
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}
// https://kaiqiuwang.cc/xcx/public/index.php/api/user/get_userinfo0 报名获取资料
export function getUserinfo0() {
	return http.post({
		url: '/user/get_userinfo0',
		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true
		}
	})
}
// https://kaiqiuwang.cc/xcx/public/index.php/api/User/getCredit?uid=0 用户信用

// https://kaiqiuwang.cc/xcx/public/index.php/api/user/perfect_info 更新资料
/* 
{
  "realname": "***",
  "sex": "1",
  "ifCanModi": "0",
  "birthday": "19xx-0x-xx",
  "IDNumber": "x", //身份证
  "clothes_size": "6",
  "qiupai": "蝴蝶Butterfly",
  "qiupaitype": "张本智和ALC",
  "pathWords": "",
  "hand": "左手",
  "holder": "横板",
  "help": "0",  //代报名 1是关闭
  "ethnicity": "0",
  "zhengshou": "斯帝卡STIGA",
  "zhengshoutype": "",
  "fanshou": "骄猛XIOM",
  "fanshoutype": "",
  "ttStyle": "",    //打法
  "ifHonorShow": "1"  //展示荣耀
}  
 */
