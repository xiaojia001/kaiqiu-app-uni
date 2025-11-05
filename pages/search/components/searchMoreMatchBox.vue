<template>
	<view class="absolute left-0 top-100rpx z50 w-full box-border">
		<view class="bg-#fff p20rpx box-border border-1rpx border-#ccc border-solid">
			<view class="f-c-c">
				<view class="text-26rpx w-140rpx flex-shrink-0">起止日期</view>
				<view @click="showCalendar" class="flex-1 h60rpx px-10rpx box-border border-1rpx border-#ccc border-solid flex items-center text-24rpx">
					<view class="flex-1">
						<text v-if="dateRangeStr">{{dateRangeStr}}</text>
						<text v-else class="text-#999">不限</text>
					</view>
					<uni-icons v-if="dateRangeStr" type="clear" @click.stop="dateRange=['','']"></uni-icons>
					<text v-else class="text-#77B980" @click.stop="selectToday">今日</text>
				</view>
			</view>
			<view class="f-c-c mt-26rpx">
				<view class="text-26rpx w-140rpx flex-shrink-0">举办城市</view>
				<view class="flex-1 h60rpx px-10rpx box-border border-1rpx border-#ccc border-solid flex items-center text-24rpx" @click="goSelectCity">
					<view class="flex-1">
						<text v-if="crtCity.name">{{crtCity.name}}</text>
						<text v-else class="text-#999">不限</text>
					</view>
					<uni-icons v-if="crtCity.name" type="clear" @click.stop="clearCity"></uni-icons>
					<text v-else class="text-#77B980" @click.stop="selectCrtCity">当前城市</text>
				</view>
			</view>
			<view class="f-c-c mt-26rpx">
				<view class="text-26rpx w-140rpx flex-shrink-0">距离区间</view>
				<picker class="flex-1" @change="bindPickerChange" :value="distanceIndex" :range="distanceRange">
					<view class=" h60rpx px-10rpx box-border border-1rpx border-#ccc border-solid items-center flex justify-between text-24rpx">
						{{ distanceRange[distanceIndex] }}
						<uni-icons class="ml8rpx" type="bottom" size="30rpx"></uni-icons>
					</view>
				</picker>
				<!-- <view>{{distance}}</view> -->
			</view>
			<view class="flex mt-26rpx">
				<view class="text-26rpx w-140rpx flex-shrink-0">赛事标签</view>
				<view class="flex-1 flex flex-wrap flex-gap-18rpx">
					<view class="f-c-c w132rpx text-24rpx item-box" :class="[quickTagsArr.some(v=>v==item)?'active':'']" v-for="(item,index) in tags" :key="item" @click="setClickItem(item)">
						{{item}}
					</view>
				</view>
			</view>
			<view class="flex box-border pr20rpx mb4rpx mt-26rpx">
				<button class="flex-1 ml-20rpx" size="mini" @click="resetAll">重置</button>
				<button class="flex-1 ml-40rpx" size="mini" type="primary" @click="refresh">确定</button>
			</view>
		</view>
		<uni-calendar ref="calendar" range :insert="false" @confirm="confirm" />
	</view>
</template>
<script setup>
	import dayjs from 'dayjs';
	const props = defineProps({
		searchText: {
			type: String,
			default: ''
		}
	})
	const tags = ['网红', '大奖赛', '青少年']
	const calendar = ref(null)
	const { selectCity } = useStore('user');
	const crtCity = ref({ id: '', name: '' })
	const quickTagsArr = ref([])
	const distanceIndex = ref(0)
	const distanceRange = ['不限', '<=3公里', '<=5公里', '<=10公里', '<=20公里']
	const distanceValues = [0, 3, 5, 10, 20]
	const dateRange = ref(['', ''])
	const emit = defineEmits(['searchMore'])
	const dateRangeStr = computed(() => {
		let str = dateRange.value.join(' 至 ')
		return str === ' 至 ' ? '' : str
	})

	function setClickItem(item) {
		let index = quickTagsArr.value.findIndex(v => v === item)
		if (index >= 0) {
			quickTagsArr.value.splice(index, 1)
		} else {
			quickTagsArr.value.push(item)
		}
	}

	function showCalendar() {
		calendar.value.open()
	}

	function confirm(e) {
		const { before, after } = e.range
		if (dayjs(before).isAfter(dayjs(after))) {
			return dateRange.value = [after, before]
		}
		dateRange.value = [before, after]
	}

	function goSelectCity() {
		uni.$off('refreshCity')
		uni.$once('refreshCity', (item) => {
			crtCity.value = item
		})
		const { id, name } = crtCity.value
		uni.navigateTo({
			url: `/pages/main/selectCityPage?id=${id}&name=${name}&temp=1`
		})
	}

	function bindPickerChange(e) {
		distanceIndex.value = +e.detail.value;
	}

	function resetAll() {
		dateRange.value = ['', '']
		distanceIndex.value = 0
		quickTagsArr.value = []
		crtCity.value = { id: '', name: '' }
	}

	function clearCity() {
		crtCity.value = { id: '', name: '' }
	}

	function selectCrtCity() {
		crtCity.value = { id: selectCity.value.id, name: selectCity.value.name }
	}

	function selectToday() {
		const todayStr = dayjs().format('YYYY-MM-DD')
		dateRange.value = [todayStr, todayStr]
	}

	function refresh() {
		const city = crtCity.value.name
		const distance = 'lt' + distanceValues[distanceIndex.value]
		const quickTags = quickTagsArr.value.join(',')
		let obj = {}
		if (city) obj.city = city
		if (quickTags) obj.quickTags = quickTags
		if (distanceIndex.value > 0) obj.distance = distance
		if (dateRangeStr.value) {
			obj.startMatchTimestamp = dayjs(dateRange.value[0] + ' 00:00:00').unix()
			obj.endMatchTimestamp = dayjs(dateRange.value[1] + ' 23:59:59').unix()
		}
		const { length } = Object.keys(obj)
		// if (!length && props.searchText === '') {
		// 	return uni.showToast({
		// 		title: '无筛选项至少输入比赛关键词',
		// 		icon: 'none'
		// 	})
		// }
		if (!city && (quickTags || distanceIndex.value > 0)) {
			return uni.showToast({
				title: '请选择所在城市',
				icon: 'none'
			})
		}
		emit('searchMore', obj)
	}
</script>

<style lang="scss" scoped>
	.item-box {
		height: 40rpx;
		border-radius: 20rpx;
		border: 1rpx solid #ccc;

		&.active {
			border: 1rpx solid #77b980;
			background: #77b980;
			color: #fff;
		}
	}
</style>