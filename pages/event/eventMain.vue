<template>
	<view class="text-#000">
		<view class="top-bg">
			<view class="poster-box bg-#fff">
				<image class="w-full h-full" :src="eventDetail.poster" mode="" @click="previewImage(eventDetail.poster)"></image>
			</view>
		</view>
		<view class="mt42rpx bg-#fff px30rpx py20rpx">
			<view class="font-600 text-28rpx">{{eventDetail.title}}</view>
			<view class="flex justify-between mt32rpx">
				<view class="f-c-c w-full h40rpx text36rpx" :class="[activeTab===i?'active-tab':'']" v-for="(item,i) in tabList" :key="item" @click="activeTab=i">{{item}}</view>
			</view>
		</view>
		<view v-show="activeTab==0" class="mt-14px text-24rpx">
			<view class="bg-#fff h90rpx px20rpx flex justify-between items-center">
				<view class="flex items-center">
					<text class="font-500 mr10rpx text-28rpx w142rpx">联系人</text>
					<text>{{eventDetail.contact}}</text>
				</view>
				<view v-if="eventDetail.mobile" class="f-c-c text-28rpx contact-btn" @click="toMakeCall()">联系Ta</view>
			</view>
			<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
				<text class="font-500 mr10rpx text-28rpx w142rpx">比赛时间</text>
				<text>{{eventDetail.starttime}}</text>
				<text v-if="eventDetail.endtime" class="mx6rpx">至</text>
				<text>{{eventDetail.endtime}}</text>
			</view>
			<view v-if="eventDetail.shopid" class="bg-#fff h90rpx px20rpx mt2rpx flex items-center" @click="goGymDetailPage(eventDetail.shopid)">
				<text class="font-500 mr10rpx text-28rpx w142rpx">比赛球馆</text>
				<text class="flex-1">{{eventDetail.arena_name}}</text>
				<uni-icons type="right" size="20"></uni-icons>
			</view>
			<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center" @click="jumpMap">
				<text class="font-500 mr10rpx text-28rpx w142rpx">比赛地点</text>
				<text class="flex-1">{{eventDetail.location}}</text>
				<uni-icons type="right" size="20"></uni-icons>
			</view>
		</view>
		<view class="p25rpx pb0 flex flex-wrap">
			<view v-for="item in subEventList" :key="item.id" class="w340rpx h60rpx f-c-c item-tag" :class="[activeItemId===item.id?'active':'']" @click="activeItemId=item.id">
				{{item.name}}
			</view>
		</view>
		<mainDetail v-show="activeTab==0" :eventDetail="eventDetail" :crtItem="crtItem" :activeItemId="activeItemId" @goMemberList="goMemberList" />
		<groupDetail v-if="activeTab==1" :eventDetail="eventDetail" :crtItem="crtItem" :activeItemId="activeItemId" />
		<scoreDetail v-if="activeTab==2" :eventDetail="eventDetail" :crtItem="crtItem" :activeItemId="activeItemId" />
		<scoreChange v-if="activeTab==3" :eventDetail="eventDetail" :crtItem="crtItem" :activeItemId="activeItemId" />
	</view>
</template>

<script setup>
	import { getEventDetaiByIdAndLocation } from '@/api/event.js'
	import { goGymDetailPage } from '@/utils/goPage.js'
	import mainDetail from './components/mainDetail.vue'
	import groupDetail from './components/groupDetail.vue'
	import scoreDetail from './components/scoreDetail.vue'
	import scoreChange from './components/scoreChange.vue'
	import { computed } from 'vue'
	const { location } = useStore('user')
	const tabList = ['详情', '赛程', '成绩', '积分']
	const eventDetail = ref({})
	const subEventList = ref([])
	let ifTT_obj = {}
	const activeItemId = ref(null)
	let crtId = ''
	const activeTab = ref(0)
	onLoad(({ id, itemId }) => {
		crtId = id
		getEventDetail(id)
		activeItemId.value = itemId
	})
	onShow(() => {
		if (crtId && activeItemId.value) {
			getEventDetail(crtId)
		}
	})
	const crtItem = computed(() => {
		let obj = subEventList.value.find(v => v.id === activeItemId.value) ?? {}
		return { ...obj, ifTT: ifTT_obj[activeItemId.value] > 0 }
	})

	function goMemberList() {
		const { eventid, title } = eventDetail.value
		const { id, name } = crtItem.value
		let obj = { id, event_name: title, match_id: eventid, match_name: name }
		uni.navigateTo({
			url: `/pages/event/memberList?matchStr=${encodeURIComponent(JSON.stringify(obj))}`
		})
	}

	function jumpMap() {
		if (!eventDetail.value.location) return
		let { lat, lng, location } = eventDetail.value
		uni.openLocation({
			address: location,
			latitude: lat,
			longitude: lng,
			success: function() {
				console.log('success');
			}
		});
	}

	function toMakeCall() {
		uni.makePhoneCall({
			phoneNumber: eventDetail.value.mobile
		});
	}

	function getEventDetail(id) {
		const [lng, lat] = uni.getStorageSync('userLocation' ?? [])
		getEventDetaiByIdAndLocation({ id, lng, lat }).then(res => {
			eventDetail.value = res.data?.detail ?? {}
			subEventList.value = res.data?.items ?? []
			ifTT_obj = res.data?.ifTT ?? {}
			if (subEventList.value.length && !activeItemId.value) {
				activeItemId.value = subEventList.value[0].id
			}
		})
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

	.active-tab {
		color: #39B54A;
		position: relative;

		&::after {
			content: "";
			position: absolute;
			bottom: -20rpx;
			width: 80%;
			height: 4rpx;
			background-color: #39B54A;
		}
	}

	.contact-btn {
		height: 50rpx;
		padding: 0 16rpx;
		color: #39B54A;
		border: 1rpx solid #39B54A;
	}

	.item-tag {
		margin-bottom: 20rpx;
		font-weight: 600;
		box-sizing: border-box;
		border: 1rpx solid #39B54A;
		color: #39B54A;

		&:nth-child(even) {
			margin-left: 20rpx;
		}

		&.active {
			background-color: #39B54A;
			color: #fff;
		}
	}
</style>