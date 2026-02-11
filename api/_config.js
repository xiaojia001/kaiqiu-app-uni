// API 请求默认配置
export const defaultConfig = {
	showSuccess: false,
	successMsg: '',
	showError: true,
	errorMsg: '',
	showLoading: false,
	loadingMsg: '加载中',
	auth: true
}

// 常用配置预设
export const presets = {
	// 静默请求 - 不显示loading和错误
	silent: {
		showLoading: false,
		showError: false
	},
	// 标准请求 - 显示错误，不显示loading
	standard: {
		showLoading: false,
		showError: true
	},
	// 加载请求 - 显示loading和错误
	loading: {
		showLoading: true,
		showError: true
	},
	// 成功提示请求
	success: {
		showSuccess: true,
		showLoading: false,
		showError: true
	},
	// 完整交互请求
	full: {
		showSuccess: true,
		showLoading: true,
		showError: true
	},
	// 无需登录
	noAuth: {
		auth: false
	}
}

// 合并配置工具函数
export function mergeConfig(...configs) {
	return Object.assign({}, defaultConfig, ...configs)
}
