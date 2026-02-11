// 统一的弹窗工具函数

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>} - 用户是否确认
 */
export function showConfirm(title, content) {
	return new Promise((resolve) => {
		uni.showModal({
			title,
			content,
			success: (res) => resolve(res.confirm)
		})
	})
}

/**
 * 显示选择菜单
 * @param {string} title - 标题
 * @param {Array<{title: string}>} buttons - 按钮配置
 * @returns {Promise<number>} - 选择的索引(0-based)，取消返回-1
 */
export function showActionSheet(title, buttons) {
	return new Promise((resolve) => {
		plus.nativeUI.actionSheet(
			{ title, cancel: '取消', buttons },
			(e) => resolve(e.index - 1)
		)
	})
}

/**
 * 显示提示
 * @param {string} title - 提示内容
 * @param {string} icon - 图标类型
 */
export function showToast(title, icon = 'none') {
	uni.showToast({ title, icon, mask: true })
}

/**
 * 显示加载中
 * @param {string} title - 加载提示文字
 */
export function showLoading(title = '加载中') {
	uni.showLoading({ title, mask: true })
}

/**
 * 隐藏加载
 */
export function hideLoading() {
	uni.hideLoading()
}
