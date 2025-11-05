<template>
	<view>
		<view class="flex p20rpx bg-#fff mb-14px relative" v-for="(item, i) in list" :key="item.eventid" @click="goEventMainPage({eventid:item.eventid})">
			<view v-if="item.grade" class="absolute z10 text-#e44225 bottom-60rpx text-50rpx f-c-c left-120rpx tuijian-box">推荐</view>
			<view class="relative w162rpx h182rpx">
				<view class="absolute top-0 left-0 z10 bg-#77b980 text-22rpx p2rpx text-#fff">{{ item.city }}</view>
				<image class="w-full h-full" :src="item.poster" mode=""></image>
			</view>
			<view class="flex-1 ml-40rpx flex flex-col justify-between">
				<view class="text-#52546D font-600 text-28rpx">{{ item.title }}</view>
				<view class="text-22rpx text-#999">{{ item.starttime }} <text class="ml8rpx text-#E49B37">{{ item.status }}</text></view>
				<view class="text-22rpx text-#999"><text class="mr6rpx truncate">比赛地点:</text>{{ item.arena_name }}</view>
				<view class="flex items-center justify-between">
					<view v-if="showTag(item)" class="text-#e44225 text-24rpx flex">
						<view v-if="item.prize==1" class="info-tag">大奖赛</view>
						<view v-if="item.observer==1" class="info-tag">观察员</view>
						<view v-if="item.wanghong==1" class="info-tag">网红</view>
					</view>
					<text v-else class="text-20rpx text-#333">{{setJuli(item.juli)}}
						<text v-if="!showTag(item)" class="text-20rpx ml-10rpx">{{ item.viewnum }}人浏览</text>
					</text>
					<view class="f-c-c">
						<text v-if="showTag(item)" class="text-20rpx text-#999">{{ item.viewnum }}人浏览</text>
						<view class="join-border text-20rpx text-#77B980">{{ item.membernum }}人参加</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
	import { goEventMainPage } from '@/utils/goPage.js'
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