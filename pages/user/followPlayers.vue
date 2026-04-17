<template>
	<view class="page-container">
		<mescroll-body @init="mescrollInit" @down="downCallback" @up="upCallback" :up="{toTop:{src:''},textNoMore:''}">
			<!-- 顶部操作栏 -->
			<view class="top-bar">
				<view class="btn-primary" @click="queryAllEvents">
					<uni-icons type="search" size="24rpx" color="#fff"></uni-icons>
					<text class="ml-10rpx">一键查询所有人的近期比赛</text>
				</view>
			</view>

			<!-- 关注人列表 -->
			<view v-for="(item,i) in list" :key="item.uid" class="player-card">
				<view class="card-header" @click="getPlayerEvents(item)">
					<view class="w140rpx h140rpx rounded-70rpx bg-white">
						<image class="w-full h-full rounded-70rpx" :src="item.face_url" mode=""></image>
					</view>
					<view class="flex-1 ml-20rpx pt10rpx">
						<view class="text-#333 text-28rpx">{{`${item.realname}(${item.nickname})`}}</view>
						<view v-if="item.enrolledMatchList?.length" class="text-#248DFF text-24rpx mt-10rpx">
							<uni-icons type="calendar" size="20rpx" color="#248DFF"></uni-icons>
							<text class="ml-8rpx">近期比赛: {{item.enrolledMatchList.length}}场</text>
						</view>
					</view>
					<view class="flex flex-col justify-between">
						<view class="btn-box mb30rpx" @click.stop="goUserPageByUid(item.fuid)">进入主页</view>
						<view class="btn-box" @click.stop="cancelFollow(item,i)">不再关注</view>
					</view>
				</view>

				<!-- 比赛列表 - 仅点击时展开 -->
				<view class="event-list px30rpx mb20rpx" v-if="item.fuid===activePlayer">
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
	</view>
</template>

<script setup>
	import { goCancelFolloweeByUid, getUserFolloweesList, getFolloweeEnrolledMatch } from '@/api/user.js'
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import { goUserPageByUid, goEventMainPage } from '@/utils/goPage.js'
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";

	const activePlayer = ref('')
	const list = ref([]) // 数据列表
	const isLoading = ref(false)
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom) // 调用mescroll的hook

	const upCallback = (mescroll) => {
		getUserFolloweesList().then(res => {
			const followeesList = res.data?.followeesList || []
			// 初始化每个关注人的比赛列表，确保数据健壮
			// followeesList.forEach(item => {
			// 	if (!item.enrolledMatchList) {
			// 		item.enrolledMatchList = []
			// 	}
			// })
			list.value = followeesList
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
						list.value.splice(i, 1)
					});
				}
			}
		});
	}

	async function getPlayerEvents(item) {
		if (item.fuid === activePlayer.value) {
			return activePlayer.value = ''
		}
		if (!item.enrolledMatchList) {
			await getFolloweeEnrolledMatch(item.fuid).then(res => {
				item.enrolledMatchList = res.data?.enrolledMatchList ?? []
			})
		}
		activePlayer.value = item.fuid
	}

	// 一键查询所有人的近期比赛
	async function queryAllEvents() {
		if (isLoading.value) return

		isLoading.value = true
		uni.showLoading({ title: '查询中...' })

		try {
			// 遍历所有关注人，查询比赛信息
			for (const item of list.value) {
				if (!item.enrolledMatchList) {
					await getFolloweeEnrolledMatch(item.fuid).then(res => {
						item.enrolledMatchList = res.data?.enrolledMatchList ?? []
					})
				}
			}

			uni.showToast({
				title: '查询完成',
				icon: 'success'
			})
		} catch (error) {
			uni.showToast({
				title: '查询失败',
				icon: 'none'
			})
		} finally {
			isLoading.value = false
			uni.hideLoading()
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background: #f5f5f5;
	}

	.top-bar {
		padding: 20rpx;
		background: #fff;
		margin-bottom: 10rpx;
	}

	.btn-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60rpx;
		background: #248DFF;
		color: #fff;
		font-size: 24rpx;
		border-radius: 30rpx;
		font-weight: 500;
	}

	.player-card {
		margin-top: 10rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		background: white;
		cursor: pointer;
		transition: background-color 0.2s;

		&:active {
			background-color: #f5f5f5;
		}
	}

	.event-list {
		animation: slideDown 0.3s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

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