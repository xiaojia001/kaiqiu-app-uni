<template>
	<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback">
		<view class="flex p20rpx bg-#fff border-top-info" v-for="(item,i) in list" :key="item.eventid" @click="goEventMainPage({eventid:item.eventid})">
			<view class="w162rpx h162rpx">
				<image class="w-full h-full" :src="item.poster" mode=""></image>
			</view>
			<view class="flex-1 ml-40rpx flex flex-col justify-between">
				<view class="text-#52546D font-600 text-28rpx">{{item.title}}</view>
				<view class="flex items-center justify-between">
					<view class="text-#E49B37 text-24rpx">{{item.province}} {{item.city}}</view>
					<view class="f-c-c">
						<text class="text-20rpx text-#999">{{item.viewnum}}人浏览</text>
						<view class="join-border text-20rpx text-#77B980">{{item.membernum}}人参加</view>
					</view>
				</view>

			</view>
		</view>
	</mescroll-body>
</template>

<script setup>
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import { getMatchListHisByPage } from '@/api/user.js'
	import { goEventMainPage } from '@/utils/goPage.js'
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom) // 调用mescroll的hook
	const list = ref([]) // 数据列表
	let isInit = false
	const upCallback = (mescroll) => {
		isInit = true
		getMatchListHisByPage(mescroll.num).then(res => {
			const rows = res.data?.data || [] // 当前页数据
			if (mescroll.num == 1) list.value = []; //如果是第一页需手动制空列表
			list.value = list.value.concat(rows); //追加新数据
			mescroll.endSuccess(rows.length); // 请求成功, 结束加载
		}).catch(() => {
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}

	function refresh() {
		list.value = [] // 先置空列表,显示加载进度
		getMescroll().resetUpScroll(true) // 再刷新列表数据
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
</script>

<style scoped lang="scss">
	.border-top-info {
		border-top: 20rpx solid #FBFAFB;
	}

	.join-border {
		width: 110rpx;
		text-align: center;
		background-color: rgba(#77B980, .1);
		border: 1rpx solid #77B980;
		margin-left: 8rpx;
	}
</style>