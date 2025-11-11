<template>
	<view class="p20rpx bg-#fff text-#77B980 text-30rpx full-height box-border">
		<view>比赛名称: {{info.title}}</view>
		<view class="mt-12rpx">项目名称: {{info.xianmu}}</view>
		<view class="mt-12rpx">比赛费用: <text class="text-#F89703">{{info.fee_sum}}元</text></view>
	</view>
</template>

<script setup>
	import { getEnterinfo } from '@/api/event.js'
	const info = ref({
		list: []
	})
	onLoad(({ id }) => {
		getEnterinfo(id).then(res => {
			info.value = res.data
		})
	})
</script>

<style lang="scss" scoped>
	.full-height {
		/* #ifdef APP */
		height: 100vh;
		/* #endif */
		/* #ifdef H5 */
		height: calc(100vh - var(--window-top));
		/* #endif */
	}
</style>