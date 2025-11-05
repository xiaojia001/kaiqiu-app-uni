<template>
	<view>
		<view class="flex items-center bg-#fff h110rpx sticky-top">
			<view class="f-c-c text-#77b980 max-w-180rpx" @click="goSelectCity">
				<uni-icons type="location" size="48rpx" color="#77b980"></uni-icons>
				<text class="truncate">{{cityName||'暂未选择'}}</text>
			</view>
			<view class="flex-1 bg-#F5F4F6 h80rpx mx20rpx rounded-30rpx text-26rpx flex items-center pl30rpx text-#999" @click="goSearchPage()">搜索</view>
		</view>
		<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback">

			<view class="flex p20rpx bg-#fff border-top-info relative" v-for="(item, i) in list" :key="item.eventid" @click="goEventMainPage({eventid:item.eventid})">
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
		</mescroll-body>
	</view>
</template>

<script setup>
	import coordtransform from 'coordtransform';
	const { location, setLocation, cityName } = useStore('user');
	import { goEventMainPage, goSearchPage } from '@/utils/goPage.js'
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import { getMatchListByPage } from '@/api/match.js';
	import useMescroll from '@/uni_modules/mescroll-uni/hooks/useMescroll.js';
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom); // 调用mescroll的hook
	let isInit = false;
	onLoad(() => {
		// getUserLocation();
	});

	function getUserLocation() {
		return new Promise((resolve, reject) => {
			uni.getLocation({
				type: 'wgs84',
				success: (res) => {
					let [longitude, latitude] = coordtransform.wgs84togcj02(res.longitude, res.latitude);
					setLocation([longitude, latitude]);
					resolve();
				},
				fail: (e) => {
					reject(e);
				}
			});
		});
	}

	const list = ref([]); // 数据列表

	const upCallback = async (mescroll) => {
		if (!isInit) {
			try {
				await getUserLocation();
				isInit = true;
			} catch (e) {
				mescroll.endErr();
			}
		}
		const [lng, lat] = uni.getStorageSync('userLocation' ?? []);
		if (!lng || !lat) {
			return mescroll.endErr();
		}
		getMatchListByPage({ lat, lng, city: cityName.value ?? '成都市', sort: 4, page: mescroll.num })
			.then((res) => {
				const rows = res.data?.data || []; // 当前页数据
				if (mescroll.num == 1) list.value = []; //如果是第一页需手动制空列表
				list.value = list.value.concat(rows); //追加新数据
				mescroll.endSuccess(rows.length); // 请求成功, 结束加载
			})
			.catch(() => {
				mescroll.endErr(); // 请求失败, 结束加载
			});
	};

	function refresh() {
		isInit = true;
		list.value = []; // 先置空列表,显示加载进度
		getMescroll().scrollTo(0, 0);
		getMescroll().resetUpScroll(true); // 再刷新列表数据
	}

	function goSelectCity() {
		uni.$off('refreshCity')
		uni.$once('refreshCity', () => {
			refresh()
		})
		uni.navigateTo({
			url: '/pages/main/selectCityPage'
		})
	}

	function setJuli(juli) {
		if (!juli) return '';
		return `距您${Number(juli).toFixed(1)}公里`;
	}

	function showTag(item) {
		return ['prize', 'observer', 'wanghong'].some(key => item[key] == 1)
	}
</script>
<style scoped lang="scss">
	.border-top-info {
		border-top: 20rpx solid #fbfafb;
	}

	.sticky-top {
		padding-top: var(--status-bar-height);
		z-index: 990;
		position: sticky;
		top: var(--window-top);
		background-color: #fff;
	}

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