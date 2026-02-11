import http from '@/utils/request/index.js'
import { presets, mergeConfig } from './_config.js'

// 登录
export function login(data) {
	return http.post({
		url: '/user/login',
		data,
		custom: mergeConfig(presets.standard, { auth: false })
	})
}

// 登出
export function logout() {
	return http.post({
		url: '/user/logout',
		custom: mergeConfig(presets.silent, { auth: true })
	})
}
