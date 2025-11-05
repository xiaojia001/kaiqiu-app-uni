<template>
	<view>
		<view class="flex p20rpx bg-#fff mb-14px relative" v-for="(item, i) in list" :key="item.id" @click="goGymDetailPage(item.id)">
			<view class="relative w162rpx h182rpx">
				<view class="absolute top-0 left-0 z10 bg-#77b980 text-22rpx p2rpx text-#fff">{{ item.city }}</view>
				<image class="w-full h-full" :src="item.image" mode=""></image>
			</view>
			<view class="flex-1 ml-40rpx flex flex-col justify-between">
				<view class="text-#52546D font-600 text-28rpx">{{ item.name }}</view>
				<view class="text-24rpx text-#999"><text class="mr6rpx truncate">地址:</text>{{ item.address }}</view>
				<view class="flex items-center justify-between text-22rpx">
					<text class="text-#333">{{ setJuli(item.juli) }}</text>
					<view class="f-c-c text-#999">
						{{item.view}}人浏览
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
	import { goGymDetailPage } from '@/utils/goPage.js'
	const props = defineProps({
		list: { type: Array, default: () => [] }
	})

	function setJuli(juli) {
		if (!juli) return '';
		return `距您${Number(juli).toFixed(1)}公里`;
	}

	function showTag(item) {
		return ['prize', 'observer', 'wanghong'].some(key => item[key] == 1)
	}
</script>
<style lang="scss" scoped>
	.join-border {
		width: 110rpx;
		text-align: center;
		background-color: rgba(#77b980, 0.1);
		border: 1rpx solid #77b980;
		margin-left: 8rpx;
	}

	.info-tag {
		border: 1px solid #e44225;
		padding: 0 4rpx;
		font-size: 20rpx;

		&+.info-tag {
			margin-left: 10rpx;
		}
	}

	.tuijian-box {
		border-radius: 50%;
		width: 120rpx;
		height: 120rpx;
		border: 4rpx solid #e44225;
		transform: rotate(25deg);
	}
</style>