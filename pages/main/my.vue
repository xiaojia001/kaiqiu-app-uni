<template>
	<!-- <PageContent noStatusBar> -->
	<view class="flex-1 flex flex-col bg-#F5F9FD">
		<view class="flex-1 flex flex-col">
			<view class="flex top-bg">
				<view @click="goUserPageByUid('')" class="flex items-center absolute left-42rpx bottom-30rpx">
					<view class="w192rpx h192rpx rounded-91rpx bg-white">
						<image class="w-full h-full  rounded-91rpx" :src="userInfo?.image" mode=""></image>
					</view>
					<view class="flex flex-col ml-20rpx text-#fff">
						<text class="text-48rpx">{{userInfo?.username??'请登录'}}{{userInfo?.realname?`(${userInfo?.realname})`:''}}</text>
						<view class="flex items-center text-28rpx mt4px">
							当前积分:{{userInfo?.score??''}}
						</view>
						<view class="flex items-center text-28rpx mt4px">
							当前信用:{{userInfo?.credit??''}}
						</view>
						<view class="flex items-center text-28rpx mt4px">
							当前金币:{{userInfo?.gold??''}}
						</view>
					</view>
				</view>
			</view>
			<view class="flex flex-col mt38rpx">
				<view @click="goUserPageByUid('')" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="medal" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">我的积分</text>
					</view>
					<image class="w40rpx h40rpx" src="/static/userCenter/ic-arrow.svg" mode=""></image>
				</view>
				<view @click="goDaySign" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx mt2rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="calendar" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">每日签到</text>
					</view>
					<image class="w40rpx h40rpx" src="/static/userCenter/ic-arrow.svg" mode=""></image>
				</view>
				<view @click="goEventHis" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx mt2rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="list" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">参赛记录</text>
					</view>
					<image class="w40rpx h40rpx" src="/static/userCenter/ic-arrow.svg" mode=""></image>
				</view>
				<view @click="goFollowPlaysHis" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx mt2rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="star" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">我的关注</text>
					</view>
					<image class="w40rpx h40rpx" src="/static/userCenter/ic-arrow.svg" mode=""></image>
				</view>
				<view @click="goAbout" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx mt2rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="compose" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">关于</text>
					</view>
					<!-- <text class="text-#666 text-28rpx">{{version}}</text> -->
					<image class="w40rpx h40rpx" src="/static/userCenter/ic-arrow.svg" mode=""></image>
				</view>
				<view @click="goQuit" class="flex h108rpx bg-#fff items-center px-40rpx pr-52rpx mt2rpx">
					<view class="flex-1 flex items-center">
						<uni-icons type="redo" size="48rpx"></uni-icons>
						<text class="text-#333 text-28rpx ml-32rpx">退出系统</text>
					</view>
					<text class="text-#007AFF text-28rpx">退出</text>
				</view>
			</view>
		</view>
	</view>
	<!-- </PageContent> -->
</template>

<script setup>
	const { quitApp, setToken } = useStore('user')
	import { ref } from 'vue';
	import { getUserInfo, getDaySign } from '@/api/user.js'
	import { goUserPageByUid, goAbout } from '@/utils/goPage.js'
	const userInfo = ref({})
	const version = ref('')
	onLoad(() => {
		getNewUserInfo()
		const { appVersion } = uni.getSystemInfoSync()
		version.value = appVersion
	})

	function getNewUserInfo() {
		getUserInfo().then(res => {
			userInfo.value = res.data
		}).catch(e => {
			// console.log(e);
			setToken(null)
		})
	}

	const goQuit = () => {
		quitApp()
	}

	// const goScoreCenter = () => {
	// 	uni.navigateTo({
	// 		url: '/pages/user/user'
	// 	})
	// }

	const goEventHis = () => {
		uni.navigateTo({
			url: '/pages/user/eventHis'
		})
	}

	const goFollowPlaysHis = () => {
		uni.navigateTo({
			url: '/pages/user/followPlayers'
		})
	}

	function goDaySign() {
		getDaySign().then(res => {
			getNewUserInfo()
		})
	}
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