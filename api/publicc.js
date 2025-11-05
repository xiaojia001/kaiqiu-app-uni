import http from '@/utils/request/index.js'
export function getCities() {
	return http.get({
		url: 'publicc/GetCities',

		custom: {
			showSuccess: true,
			showLoading: false,
			showError: true,
			auth: false
		}
	})
}

