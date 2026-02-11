import http from '@/utils/request/index.js'
import { presets } from './_config.js'

// 获取排行榜视图 /Top/lists
export function getTopView(city) {
	return http.post({
		url: '/Top/lists',
		data: { city },
		custom: presets.loading
	})
}

// 获取Top100数据 /Top/getTop100Data?city=成都市&tabIndex=1&tid=2
export function getTop100Data(params) {
	return http.get({
		url: '/Top/getTop100Data',
		params,
		custom: presets.loading
	})
}
