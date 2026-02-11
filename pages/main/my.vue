<template>
	<view class="flex-1 flex flex-col bg-#F5F9FD">
		<view class="flex-1 flex flex-col">
			<!-- 用户信息头部 -->
			<view class="flex top-bg">
				<view @click="goUserPageByUid('')" class="flex items-center absolute left-42rpx bottom-30rpx">
					<view class="w192rpx h192rpx rounded-91rpx bg-white">
						<image class="w-full h-full rounded-91rpx" :src="userInfo?.image" mode="aspectFill" />
					</view>
					<view class="flex flex-col ml-20rpx text-#fff">
						<text class="text-48rpx">{{ displayName }}</text>
						<view class="flex items-center text-28rpx mt4px">
							当前积分:{{ userInfo?.score ?? '' }}
						</view>
						<view class="flex items-center text-28rpx mt4px">
							当前信用:{{ userInfo?.credit ?? '' }}
						</view>
						<view class="flex items-center text-28rpx mt4px">
							当前金币:{{ userInfo?.gold ?? '' }}
						</view>
					</view>
				</view>
			</view>

			<!-- 菜单列表 -->
			<view class="flex flex-col mt38rpx">
				<MenuItem
					v-for="item in menuList"
					:key="item.text"
					:icon="item.icon"
					:text="item.text"
					:show-arrow="item.showArrow"
					:extra-text="item.extraText"
					:extra-class="item.extraClass"
					:item-class="item.itemClass"
					:icon-color="item.iconColor"
					@click="item.action"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getUserInfo, getDaySign } from '@/api/user.js'
import { goUserPageByUid, goAbout, goEventHis, goFollowPlaysHis } from '@/utils/goPage.js'
import MenuItem from '@/components/MenuItem/MenuItem.vue'

const { quitApp, setToken } = useStore('user')

// Storage Key
const SIGN_STATUS_KEY = 'daySignStatus'
const SIGN_DATE_KEY = 'daySignDate'

// 用户数据
const userInfo = ref({})
// 签到状态：0-未签到，1-已签到
const signStatus = ref(0)
// 是否正在签到中
const isSigning = ref(false)

// 计算属性：显示名称
const displayName = computed(() => {
	const { username, realname } = userInfo.value || {}
	const baseName = username || '请登录'
	return realname ? `${baseName}(${realname})` : baseName
})

// 计算属性：签到菜单配置
const signMenuConfig = computed(() => {
	// 已签到
	if (signStatus.value === 1) {
		return {
			extraText: '已签到',
			extraClass: 'status-done',
			itemClass: 'sign-done',
			iconColor: '#999'
		}
	}
	// 签到中
	if (isSigning.value) {
		return {
			extraText: '签到中...',
			extraClass: 'status-loading',
			itemClass: '',
			iconColor: '#007AFF'
		}
	}
	// 未签到
	return {
		extraText: '未签到',
		extraClass: 'status-pending',
		itemClass: 'sign-pending',
		iconColor: '#FF9500'
	}
})

// 菜单配置
const menuList = computed(() => [
	{ icon: 'medal', text: '我的积分', action: () => goUserPageByUid('') },
	{
		icon: 'calendar',
		text: '每日签到',
		action: handleDaySign,
		...signMenuConfig.value
	},
	{ icon: 'list', text: '参赛记录', action: goEventHis },
	{ icon: 'star', text: '我的关注', action: goFollowPlaysHis },
	{ icon: 'compose', text: '关于', action: goAbout },
	{ icon: 'redo', text: '退出系统', action: handleQuit, showArrow: false, extraText: '退出' }
])

/**
 * 获取本地存储的签到状态
 * 检查是否是今天的签到状态
 */
function getStoredSignStatus() {
	try {
		const storedDate = uni.getStorageSync(SIGN_DATE_KEY)
		const today = new Date().toDateString()
		
		// 如果不是今天的记录，清除状态
		if (storedDate !== today) {
			uni.removeStorageSync(SIGN_STATUS_KEY)
			uni.removeStorageSync(SIGN_DATE_KEY)
			return 0
		}
		
		return uni.getStorageSync(SIGN_STATUS_KEY) || 0
	} catch {
		return 0
	}
}

/**
 * 保存签到状态到本地
 * @param {number} status - 签到状态
 */
function saveSignStatus(status) {
	try {
		uni.setStorageSync(SIGN_STATUS_KEY, status)
		uni.setStorageSync(SIGN_DATE_KEY, new Date().toDateString())
	} catch (e) {
		console.error('保存签到状态失败:', e)
	}
}

// 获取用户信息
async function fetchUserInfo() {
	try {
		const res = await getUserInfo()
		userInfo.value = res.data
		// 优先使用接口返回的签到状态，如果没有则使用本地存储
		const apiSignStatus = res.data?.sign_status
		if (apiSignStatus !== undefined) {
			signStatus.value = apiSignStatus
			saveSignStatus(apiSignStatus)
		} else {
			// 使用本地存储的状态（会检查日期）
			signStatus.value = getStoredSignStatus()
		}
	} catch {
		setToken(null)
	}
}

// 每日签到
async function handleDaySign() {
	// 已签到则不重复调用
	if (signStatus.value === 1) {
		uni.showToast({
			title: '今日已签到',
			icon: 'none'
		})
		return
	}

	// 防止重复点击
	if (isSigning.value) return

	isSigning.value = true
	try {
		const res = await getDaySign()
		// 签到成功（code=1）
		if (res.code === 1) {
			signStatus.value = 1
			saveSignStatus(1)
			await fetchUserInfo()
			uni.showToast({
				title: res.msg || '签到成功',
				icon: 'none'
			})
		}
	} catch (e) {
		// 处理已签到情况（code=0 且包含已签到字样）
		if (e?.code === 0 && e?.msg?.includes('已经签过到')) {
			signStatus.value = 1
			saveSignStatus(1)
			uni.showToast({
				title: '今日已签到',
				icon: 'none'
			})
		}
		// 其他错误由请求拦截器统一处理
	} finally {
		isSigning.value = false
	}
}

// 退出登录
function handleQuit() {
	quitApp()
}

// 页面加载
onLoad(() => {
	// 先读取本地状态（快速显示）
	signStatus.value = getStoredSignStatus()
	// 再请求接口获取最新状态
	fetchUserInfo()
})

// 页面显示时刷新数据
onShow(() => {
	// 检查本地状态是否过期
	const storedStatus = getStoredSignStatus()
	if (storedStatus !== signStatus.value) {
		signStatus.value = storedStatus
	}
	fetchUserInfo()
})
</script>

<style scoped lang="scss">
.top-bg {
	width: 100%;
	height: 332rpx;
	background: #248DFF;
	background-size: 100%;
	position: relative;
}
</style>
