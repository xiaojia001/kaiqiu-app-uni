import http from '@/utils/request/index.js'
import { presets, mergeConfig } from './_config.js'

// 获取城市列表
export function getCities() {
	return http.get({
		url: '/publicc/GetCities',
		custom: mergeConfig(presets.standard, { auth: false })
	})
}
