<template>
	<view class="pt2rpx">
		<view class="flex flex-col bg-#fff px20rpx">
			<view class="flex justify-between items-center py32rpx bt-f1" @click="goRankPage()">
				<view class="f-c-c">
					<view class="text-28rpx text-#E49B37 w40rpx f-c-c mr16rpx font-600">1</view>
					<view class="text-#77B980 font-600 text-28rpx">开球网积分天梯</view>
				</view>
				<!-- <view class="text-#999 text-24rpx">前往</view> -->
				<uni-icons type="right"></uni-icons>
			</view>
			<view v-for="(item,i) in topList" :key="i" class="flex justify-between items-center py32rpx bt-f1" @click="goToDataPage(item)">
				<view class="f-c-c">
					<view class="text-28rpx text-#E49B37 w40rpx f-c-c mr16rpx font-600">{{i+2}}</view>
					<view class="text-#000 font-600 text-28rpx">{{item.name}} <text class="text-#E49B37 text-22rpx ml-10rpx">top100</text></view>
				</view>
				<view class="text-#999 text-24rpx">{{item.viewnum}}浏览</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { getTopView } from '@/api/top.js'
	import { goSearchPage, goTop100Page, goRankPage } from '@/utils/goPage.js'
	const topList = ref([])
	onLoad(() => {
		refresh()
	})

	function refresh() {
		getTopView().then(res => {
			topList.value = (res.data?.data ?? []).filter(v => ![11, 10, 6].some(number => number === Number(v.tid)))
		})
	}

	function goSelectCity() {
		uni.$off('refreshCity')
		uni.$once('refreshCity', (item) => {
			crtCity.value = item
			refresh()
		})
		const { id, name } = crtCity.value
		uni.navigateTo({
			url: `/pages/main/selectCityPage?id=${id}&name=${name}`
		})
	}

	function goToDataPage(item) {
		goTop100Page({ tid: item.tid, name: item.name })
	}
</script>

<style lang="scss" scoped>
	.bt-f1 {
		border-bottom: 1px solid #f1f1f1;
	}
</style>