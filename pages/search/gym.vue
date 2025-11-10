<template>
	<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback" :down="{ bgColor: '#248DFF' }" :up="{ toTop: { src: '' } }">
		<view class="text-#000">
			<view class="top-bg bg-#fff">
				<view class="poster-box bg-#fff">
					<image class="w-full h-full" :src="gymDetail.pic" mode="" @click="previewImage(gymDetail.pic)"></image>
				</view>
			</view>
			<view class="pt42rpx bg-#fff px30rpx py20rpx">
				<view class="font-600 text-38rpx">{{gymDetail.name}}</view>
			</view>
			<view class="h120rpx my-2rpx bg-#fff"></view>
			<view class="flex h60rpx flex items-center justify-between p20rpx bg-#fff">
				<view class="flex items-center">
					<view class="w120rpx">联系人</view>
					<text class="flex-1 truncate">{{gymDetail.contact}}</text>
				</view>
				<view class="border-1rpx border-solid border-#39B54A text-#39B54A text-26rpx px16rpx py6rpx" @click="showContact">联系Ta</view>
			</view>
			<view class="mt-2rpx flex h60rpx flex items-center justify-between p20rpx bg-#fff">
				<view class="w120rpx">地点</view>
				<text class="flex-1 truncate" @click="jumpMap">{{gymDetail.address}}</text>
				<uni-icons type="right" size="20"></uni-icons>
			</view>
			<view class="mt-2rpx bg-#fff p20rpx">
				<text class="info-title">球馆信息</text>
				<view class="mt-12px">
					{{gymDetail.intro || '暂无详细信息'}}
				</view>
			</view>
			<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">
				<view class="bg-#fff p20rpx">
					<view class="p20rpx border-#333 border-1rpx border-solid" @click="callPhone(gymDetail.mobile)">
						打电话: {{gymDetail.mobile}}
					</view>
					<view v-if="gymDetail.wx" class="mt-12px p20rpx border-#333 border-1rpx border-solid" @click="copyWx(gymDetail.wx)">
						加WX: {{gymDetail.wx}}
					</view>
				</view>

			</uni-popup>
			<view class="mt-2rpx bg-#fff p20rpx">
				<view class="mb8px">
					<text class="info-title">近期赛事</text>
				</view>
				<!-- <view class="min-h-160rpx"> -->
				<view class="flex p20rpx bg-#fff mb-14px relative box-b-border" v-for="(item, i) in list" :key="item.eventid" @click="goEventMainPage({eventid:item.eventid})">
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
							<text class="text-20rpx text-#999">{{ item.viewnum }}人浏览</text>
							<view class="join-border text-20rpx text-#77B980">{{ item.membernum }}人参加</view>
						</view>
					</view>
				</view>
				<!-- </view> -->
			</view>
		</view>
	</mescroll-body>
</template>

<script setup>
	import { getArenaDetail, getArenaMatchList } from '@/api/arena.js'
	import { goEventMainPage } from '@/utils/goPage.js'
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useMescroll from '@/uni_modules/mescroll-uni/hooks/useMescroll.js';
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom); // 调用mescroll的hook
	const gymDetail = ref({})
	const list = ref([])
	let isInit = false
	let crtId = ''
	const popup = ref(null)
	onLoad(({ id }) => {
		crtId = id
		getGymDetail(id)
	})
	const [lng, lat] = uni.getStorageSync('userLocation' ?? [])

	function getGymDetail(id) {
		getArenaDetail({ id, lng, lat }).then(res => {
			// console.log(res.data);
			gymDetail.value = res.data
		})
	}

	function showContact() {
		popup.value.open()
	}

	function setJuli(juli) {
		if (!juli) return '';
		return `距您${Number(juli).toFixed(1)}公里`;
	}

	function jumpMap() {
		if (!gymDetail.value.address) return
		let { lat, lng, address } = gymDetail.value
		uni.openLocation({
			address,
			latitude: lat,
			longitude: lng,
			success: function() {
				console.log('success');
			}
		});
	}


	const upCallback = (mescroll) => {
		isInit = true
		getArenaMatchList({ id: crtId, page: mescroll.num }).then(res => {
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

	function callPhone(phoneNumber) {
		popup.value.close()
		uni.makePhoneCall({ phoneNumber });
	}

	function copyWx(data) {
		popup.value.close()
		uni.setClipboardData({
			data,
			success: () => {
				// uni.showToast({
				// 	title: '已复制',
				// 	icon: 'none'
				// })
			}
		});
	}

	function previewImage(url) {
		url && uni.previewImage({
			urls: [url]
		})
	}
</script>

<style lang="scss" scoped>
	.top-bg {
		position: relative;
		height: 400rpx;

		&::after {
			top: 0;
			content: "";
			position: absolute;
			width: 100%;
			height: 100%;
			background-color: #F89703;
			border-bottom-left-radius: 300rpx;
			border-bottom-right-radius: 300rpx;
		}

		.poster-box {
			top: 60rpx;
			height: 360rpx;
			position: absolute;
			margin: 0 40rpx;
			position: relative;
			z-index: 2;
		}
	}

	.info-title {
		color: #F89703;
		border-bottom: 4rpx solid #F89703;
	}

	.box-b-border {
		border-bottom: 2rpx solid #F2F0F2;
	}
</style>