<template>
	<view class="">
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">比赛用名</text>
			<text class="flex-1">{{userInfo.username}}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">姓名</text>
			<text class="flex-1">{{userInfo.realname}}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">当前信用分</text>
			<text class="flex-1">{{userInfo.credit}}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">手机号</text>
			<text class="flex-1">{{userInfo.mobile}}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">性别</text>
			<text class="flex-1">{{getSex(userInfo.sex) }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w152">生日</text>
			<text class="flex-1">{{userInfo.birthyear}}年{{userInfo.birthmonth}}月{{userInfo.birthday}}日</text>
		</view>
		<view class="p25rpx pb0 flex flex-wrap">
			<view v-for="item in itemList" :key="item.id" class="w340rpx h60rpx f-c-c item-tag" :class="[activeItemId===item.id?'active':'']" @click="activeItemId=item.id">
				{{item.name}}
			</view>
		</view>
		<view class="px20rpx">
			<button type="primary" @click="goSignUp">报名</button>
		</view>
	</view>
</template>

<script setup>
	import { getUserinfo0 } from '@/api/user.js'
	import { getSignUpItems, createEnter } from '@/api/event.js'
	const userInfo = ref({})
	const itemList = ref([])
	const activeItemId = ref(null)
	let eventId = null
	onLoad(({ eventid, itemid }) => {
		eventId = eventid
		getUserinfo()
		getSignUpItemsInfo({ eventid, itemid })
		activeItemId.value = itemid == 'undefined' ? null : itemid
	})

	function getSex(sex = 1) {
		const obj = { 1: '男', 2: '女' }
		return obj[sex] ?? '未知'
	}

	function getUserinfo() {
		getUserinfo0().then(res => {
			userInfo.value = res.data ?? {}
		})
	}

	function getSignUpItemsInfo({ eventid, itemid }) {
		getSignUpItems(eventid).then(res => {
			itemList.value = res.data?.data ?? []
			if (itemList.value.length && !activeItemId.value) {
				activeItemId.value = itemList.value[0].id
			}
		})
	}

	function goSignUp() {
		let { username, IDNumber, realname, mobile } = userInfo.value
		let obj = {
			event_id: eventId,
			match_itemid: activeItemId.value,
			template: '',
			xian_status: '',
			imagelist: [
				"",
				"",
				""
			],
			list: [{
				username,
				IDNumber,
				realname,
				clothes_size: -1,
				mobile
			}]
		}
		createEnter(obj).then(res => {
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 600)

		})
	}
</script>

<style lang="scss" scoped>
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