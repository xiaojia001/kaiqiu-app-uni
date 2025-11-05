import http from '@/utils/request/index.js'

// Top/getTop100Data?city=%E6%88%90%E9%83%BD%E5%B8%82&tabIndex=1&tid=2



export function getTopView(city) {
	return http.post({
		url: '/Top/lists',
		data: { city },
		custom: {
			showLoading: true,
			showError: true
		}
	})
}

export function getTop100Data(params) {
	return http.get({
		url: '/Top/getTop100Data',
		params,
		custom: {
			showLoading: true,
			showError: true
		}
	})
}