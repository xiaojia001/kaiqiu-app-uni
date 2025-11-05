import http from '@/utils/request/index.js'

export function login(data) {
	return http.post({
		url: '/user/login',
		data,
		custom: {
			auth: false
		}
	})
}

export function logout() {
	return http.post({
		url: '/user/logout',
		custom: {
			auth: true,
			showError: false
		}
	})
}