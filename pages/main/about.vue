<template>
	<view>
		<view class="container mx-auto px-6rpx py-8rpx space-y-8rpx">
			<!-- 应用信息卡片 -->
			<view class="bg-white dark:bg-gray-800 rounded-32rpx shadow-md overflow-hidden">
				<view class="pt-60rpx pb-30rpx px-30rpx text-center space-y-10rpx">
					<text class="text-40rpx font-bold">开球网APP</text>
					<text class="text-gray-500 dark:text-gray-400 text-26rpx ml-10rpx">diy版</text>
					<view class="mt-40rpx f-c-c">
						<view class="px-20rpx py-10rpx bg-blue-300 text-white rounded-20rpx text-24rpx">
							版本 {{version}} 
						</view>
						<uni-link class="ml-10rpx" :href="url" color="#4F86EC" text="检查更新"></uni-link>
					</view>
				</view>
			</view>

			<!-- 应用介绍 -->
			<view class="bg-white dark:bg-gray-800 rounded-32rpx shadow-md p-30rpx">
				<text class="text-30rpx font-semibold mb-15rpx block">应用简介</text>
				<text class="text-gray-600 dark:text-gray-300 text-26rpx leading-1.8">
					是否被小程序折磨过?\n
					切换城市之后列表却不自动刷新;\n
					点击列表查看子页面,返回之后列表被刷新,又得从头滑到刚才的位置;\n
					比赛页面TAB逻辑混乱,实际会跳转到新页面,多点两下就假死;\n
					淘汰赛轮次一多还得往下翻,对应不明确;\n
					比赛场馆、个人最高战胜信息、球馆具体位置只能看不能点。\n\n
					于是利用摸🐟时间做了这个版本。\n
				</text>
			</view>

			<!-- 功能特点 -->
			<view class="bg-white dark:bg-gray-800 rounded-32rpx shadow-md p-30rpx">
				<text class="text-30rpx font-semibold mb-20rpx block">功能特点</text>
				<view class="grid grid-cols-2 gap-20rpx">
					<view class="flex items-start space-x-15rpx p-15rpx rounded-20rpx bg-gray-50 dark:bg-gray-700/50">
						<uni-icons type="clock" size="32rpx" color="#4F86EC" class="mt-3rpx" />
						<text class="text-26rpx">减少反人类操作</text>
					</view>
					<view class="flex items-start space-x-15rpx p-15rpx rounded-20rpx bg-gray-50 dark:bg-gray-700/50">
						<uni-icons type="book" size="32rpx" color="#4F86EC" class="mt-3rpx" />
						<text class="text-26rpx">可见即可跳转</text>
					</view>
					<view class="flex items-start space-x-15rpx p-15rpx rounded-20rpx bg-gray-50 dark:bg-gray-700/50">
						<uni-icons type="news" size="32rpx" color="#4F86EC" class="mt-3rpx" />
						<text class="text-26rpx">快捷查询</text>
					</view>
					<view class="flex items-start space-x-15rpx p-15rpx rounded-20rpx bg-gray-50 dark:bg-gray-700/50">
						<uni-icons type="location" size="32rpx" color="#4F86EC" class="mt-3rpx" />
						<text class="text-26rpx">地图导航</text>
					</view>
				</view>
			</view>

			<!-- 开发者信息 -->
			<view class="bg-white dark:bg-gray-800 rounded-32rpx shadow-md p-30rpx">
				<text class="text-30rpx font-semibold mb-20rpx block">开发者信息</text>
				<view class="flex items-center space-x-20rpx">
					<view class="w-100rpx h-100rpx rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
						<image class="w-full h-full rounded-full" src="/static/avatar.jpg" mode=""></image>
					</view>
					<view class="flex-1">
						<text class="text-28rpx font-medium block">灵能之刃</text>
						<text class="text-gray-500 dark:text-gray-400 text-24rpx">正手无力,反手不精</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部版权信息 -->
		<view class="text-center py-40rpx text-gray-500 dark:text-gray-400 text-24rpx flex-col f-c-c">
			<text>powered by uni-app</text>
			<text class="mt-12px">仅供学习,请勿非法使用</text>
		</view>
	</view>
</template>

<script setup>
	const version = ref('')
	const url = 'https://github.com/xiaojia001/kaiqiu-app-uni/releases/latest'
	onLoad(() => {
		const { appVersion } = uni.getSystemInfoSync()
		version.value = appVersion
	})
	function goReleaseWebPage(){
		uni.openUrl
	}
</script>