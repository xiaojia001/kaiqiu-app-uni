<template>
	<view class="absolute left-0 top-100rpx z50 w-full box-border">
		<view class="bg-#fff p20rpx box-border border-1rpx border-#ccc border-solid">
			<view class="text-#000 text-28rpx">
				<text class="font-600">查询历史 </text>
				<uni-icons v-if="searchPlayerHis.length" type="trash" @click="clearAllSearchPlayerHis"></uni-icons>
			</view>
			<view class="mt-40rpx flex flex-wrap" style="gap: 0 16rpx;">
				<uni-tag @click="emit('searchHis',item)" class="mb-12px" v-for="item in searchPlayerHis" :key="item" inverted circle :text="item" />
			</view>
			<view v-if="!searchPlayerHis.length" class="h160rpx f-c-c text-#999">
				暂无历史查询
			</view>
		</view>
	</view>
</template>
<script setup>
	const {
		searchPlayerHis,
		clearAllSearchPlayerHis
	} = useStore('user')
	const emit = defineEmits(['searchHis'])
</script>