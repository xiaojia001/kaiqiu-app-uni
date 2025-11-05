<template>
	<mescroll-body @init="mescrollInit" @down="downCallback" @up="upCallback" :up="{toTop:{src:''},textNoMore:''}">
		<view v-for="(item,i) in list" :key="item.uid">
			<view class="flex justify-between p20rpx mb10rpx bg-white" @click="getPlayerEvents(item)">
				<view class="w140rpx h140rpx rounded-70rpx bg-white">
					<image class="w-full h-full rounded-70rpx" :src="item.face_url" mode=""></image>
				</view>
				<view class="flex-1 ml-20rpx pt10rpx text-#333 text-28rpx">{{`${item.realname}(${item.nickname})`}}</view>
				<view class="flex flex-col justify-between">
					<view class="btn-box mb30rpx" @click.stop="goUserPageByUid(item.fuid)">进入主页</view>
					<view class="btn-box" @click.stop="cancelFollow(item,i)">不再关注</view>
				</view>
			</view>
			<view class="px30rpx mb20rpx" v-if="item.fuid===activePlayer">
				<view class="flex p20rpx bg-#fff mb10rpx" v-for="(event,index) in (item.enrolledMatchList??[])" :key="index" @click="goEventMainPage({eventid:event.eventid})">
					<view class="w122rpx h122rpx">
						<image class="w-full h-full" :src="event.poster" mode=""></image>
					</view>
					<view class="flex-1 ml-20rpx flex flex-col justify-between">
						<view class="text-#52546D font-600 text-24rpx">{{event.title}}</view>
						<view class="text-#E49B37 text-22rpx">{{event.province}} {{event.city}}</view>
					</view>
				</view>
				<view class="flex p20rpx bg-#fff" v-if="!(item.enrolledMatchList??[]).length">暂无近期报名比赛</view>
			</view>
		</view>
	</mescroll-body>
</template>

<script setup>
	import { goCancelFolloweeByUid } from '@/api/user.js';
	import { getUserFolloweesList, getFolloweeEnrolledMatch } from '@/api/user.js'
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import { goUserPageByUid, goEventMainPage } from '@/utils/goPage.js'
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const activePlayer = ref('')
	const list = ref([]) // 数据列表
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom) // 调用mescroll的hook
	const upCallback = (mescroll) => {
		getUserFolloweesList().then(res => {
			list.value = res.data?.followeesList || []
			activePlayer.value = ''
			mescroll.endSuccess(list.value.length, false);
		}).catch(() => {
			mescroll.endErr();
		})
	}

	function cancelFollow(item, i) {
		uni.showModal({
			title: '提示',
			content: '确认要取消关注吗?',
			success: ({ confirm }) => {
				if (confirm) {
					goCancelFolloweeByUid(item.fuid).then((res) => {
						// getMescroll().resetUpScroll(true); // 再刷新列表数据
						list.value.splice(i, 1)
					});
				}
			}
		});
	}

	async function getPlayerEvents(item) {
		if (item.fuid === activePlayer.value) return activePlayer.value = ''
		if (!item.enrolledMatchList) {
			await getFolloweeEnrolledMatch(item.fuid).then(res => {
				item.enrolledMatchList = res.data?.enrolledMatchList ?? []
			})
		}
		activePlayer.value = item.fuid
	}
</script>

<style lang="scss" scoped>
	.btn-box {
		width: 180rpx;
		height: 52rpx;
		border-radius: 26rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid #F89703;
		color: #F89703;
		font-size: 26rpx;
	}
</style>