import Request from 'luch-request';

// 默认配置
const defaultOptions = {
	showSuccess: false,
	successMsg: '',
	showError: true,
	errorMsg: '',
	showLoading: false,
	loadingMsg: '加载中',
	auth: true,
	retryCount: 3,
	retryDelay: 1000,
};

// Loading全局实例
let LoadingInstance = {
	target: null,
	count: 0,
};

let isRelanuch = false;

/**
 * 关闭loading
 */
function closeLoading() {
	if (LoadingInstance.count > 0) LoadingInstance.count--;
	if (LoadingInstance.count === 0) uni.hideLoading();
}

/**
 * @description 请求基础配置
 */
const http = new Request({
	// #ifdef APP
	baseURL: "https://kaiqiuwang.cc/xcx/public/index.php/api",
	// #endif
	// #ifdef H5
	baseURL: import.meta.env.VITE_API_BASE_URL,
	// #endif
	timeout: 8000,
	method: 'GET',
	header: {
		'Content-Type': 'application/json',
	},
	// #ifdef APP-PLUS
	sslVerify: false,
	// #endif
	// #ifdef H5
	withCredentials: false,
	// #endif
	custom: defaultOptions,
});

/**
 * 判断是否应该重试
 * @param {Object} error - 错误对象
 * @param {number} currentRetry - 当前重试次数
 * @param {number} maxRetry - 最大重试次数
 * @returns {boolean}
 */
function shouldRetry(error, currentRetry, maxRetry) {
	if (currentRetry >= maxRetry) return false;
	
	if (!error || !error.statusCode) return true;
	
	const noRetryCodes = [401, 403, 404, 429];
	if (noRetryCodes.includes(error.statusCode)) return false;
	
	if (error.statusCode >= 500 && error.statusCode < 600) return true;
	
	if (error.errMsg?.includes('timeout')) return true;
	
	if (error.errMsg?.includes('network') || error.errMsg?.includes('fail')) return true;
	
	return false;
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 * @returns {Promise}
 */
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的请求封装
 * @param {Function} requestFn - 请求函数
 * @param {Object} config - 请求配置
 * @param {number} retryCount - 当前重试次数
 * @returns {Promise}
 */
async function requestWithRetry(requestFn, config, retryCount = 0) {
	const maxRetries = config.custom?.retryCount ?? defaultOptions.retryCount;
	const retryDelay = config.custom?.retryDelay ?? defaultOptions.retryDelay;
	
	try {
		return await requestFn();
	} catch (error) {
		if (shouldRetry(error, retryCount, maxRetries)) {
			const delayTime = retryDelay * Math.pow(2, retryCount);
			await delay(delayTime);
			return requestWithRetry(requestFn, config, retryCount + 1);
		}
		throw error;
	}
}

/**
 * @description 请求拦截器
 */
http.interceptors.request.use(
	(config) => {
		config.header['Content-Type'] = 'application/x-www-form-urlencoded';
		if (config.custom.ContentType) {
			config.header['Content-Type'] = config.custom.ContentType;
		}
		if (config.custom.showLoading) {
			LoadingInstance.count++;
			LoadingInstance.count === 1 &&
				uni.showLoading({
					title: config.custom.loadingMsg,
					mask: true,
					fail: () => {
						uni.hideLoading();
					},
				});
		}
		if (config.custom.auth) {
			const token = uni.getStorageSync('token');
			if (token) config.header['token'] = token;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

/**
 * @description 响应拦截器
 */
http.interceptors.response.use(
	(response) => {
		response.config.custom.showLoading && closeLoading();
		if (response.data.code !== 1) {
			if (response.config.custom.showError)
				uni.showToast({
					title: response.data.msg || '服务器开小差啦,请稍后再试~',
					icon: 'none',
					mask: true,
				});
			return Promise.reject(response.data);
		}
		if (
			response.data.code === 1 &&
			response.data.msg !== '' &&
			response.config.custom.showSuccess
		) {
			uni.showToast({
				title: response.config.custom.successMsg || response.data.msg,
				icon: 'none',
			});
		}
		return Promise.resolve(response.data);
	},
	(error) => {
		let errorMessage = '网络请求出错';
		if (error !== undefined) {
			switch (error.statusCode) {
				case 400:
					errorMessage = '请求错误';
					break;
				case 401:
					if (uni.getStorageSync('token')) {
						errorMessage = '您的登陆已过期';
					} else {
						errorMessage = '请先登录';
					}
					if (error.config.custom.noToLogin) {
						break;
					}
					if (!isRelanuch) {
						isRelanuch = true;
						uni.showToast({
							title: errorMessage,
							icon: 'none',
							mask: true,
						});
						setTimeout(() => {
							isRelanuch = false;
						}, 2500);
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login',
							});
						}, 1500);
					}
					break;
				case 403:
					errorMessage = '拒绝访问';
					break;
				case 404:
					errorMessage = '请求出错';
					break;
				case 408:
					errorMessage = '请求超时';
					break;
				case 429:
					errorMessage = '请求频繁, 请稍后再访问';
					break;
				case 500:
					errorMessage = '服务器开小差啦,请稍后再试~';
					break;
				case 501:
					errorMessage = '服务未实现';
					break;
				case 502:
					errorMessage = '网络错误';
					break;
				case 503:
					errorMessage = '服务不可用';
					break;
				case 504:
					errorMessage = '网络超时';
					break;
				case 505:
					errorMessage = 'HTTP版本不受支持';
					break;
			}
			if (error.errMsg?.includes('timeout')) errorMessage = '请求超时';
		}

		if (error && error.config) {
			if (error.config.custom.showError === true) {
				uni.showToast({
					title: error.data?.msg || errorMessage,
					icon: 'none',
					mask: true,
				});
			}
			error.config.custom.showLoading && closeLoading();
		}

		return Promise.reject(error);
	},
);

/**
 * 执行请求（带重试机制）
 * @param {Object} config - 请求配置
 * @returns {Promise}
 */
function executeRequest(config) {
	const requestFn = () => http.middleware(config);
	return requestWithRetry(requestFn, config, 0);
}

const request = (config) => {
	return executeRequest(config);
};

export default {
	get: (config) => request({ ...config, method: 'GET' }),
	post: (config) => request({ ...config, method: 'POST' }),
	put: (config) => request({ ...config, method: 'PUT' }),
	delete: (config) => request({ ...config, method: 'DELETE' }),
};

export { http };
