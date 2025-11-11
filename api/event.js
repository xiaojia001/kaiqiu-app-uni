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


// 报名前置信息获取
export function getSignUpItems(id) {
	return http.get({
		url: '/enter/get_items',
		params: { id },
		custom: {
			showLoading: false,
			showError: true
		}
	})
}

// https://kaiqiuwang.cc/xcx/public/index.php/api/enter/create 报名
export function createEnter(data) {
	return http.post({
		url: '/enter/create',
		data,
		custom: {
			showSuccess: true,
			showLoading: true,
			showError: true,
			ContentType: 'application/json'
		}
	})
}

/* 
 {
   "event_id": "",
   "match_itemid": "",
   "template": "",
   "xian_status": "0",
   "imagelist": [
     "",
     "",
     ""
   ],
   "list": [
     {
       "username": "xxxxx",
       "IDNumber": "xxxxx",
       "realname": "xxx",
       "clothes_size": -1,
       "mobile": "xxxx"
     }
   ]
 }
 
 团体赛
 {
   "event_id": "xxx",
   "match_itemid": "xxx",
   "template": "",
   "team_name": "111",
   "list": [
     {
       "username": "11",
       "IDNumber": "",
       "iscaptain": 1,
       "iscoach": 0,
       "isstaff": 0,
       "sex": "",
       "size": "",
       "template1": -1,
       "template2": -1,
       "mobile": "11"
     }
   ]
 }
 
 */

// https://kaiqiuwang.cc/xcx/public/index.php/api/enter/enterinfo?match_itemid=7070238&enter_id=3915442 报名完成

export function getEnterinfo(match_itemid) {
	return http.get({
		url: '/enter/enterinfo',
		params: { match_itemid },
		custom: {
			showLoading: false,
			showError: true
		}
	})
}


// https://kaiqiuwang.cc/xcx/public/index.php/api/enter/cancel_enter?enter_id=3915628&match_id=145181&match_itemid=7070238&xian_status=0&tag=1 取消报名