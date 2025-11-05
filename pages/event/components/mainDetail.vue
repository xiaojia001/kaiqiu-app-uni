<template>
	<view class="text-24rpx">
		<view class="bg-#fff h90rpx px20rpx flex justify-between items-center">
			<view class="flex items-center">
				<text class="font-500 mr10rpx text-28rpx w142rpx">项目名称</text>
				<text>{{ crtItem.name }}</text>
			</view>
			<view class="f-c-c text-24rpx enter-btn enter">{{ crtItem.is_enter ? '已报名' : '未报名' }}</view>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex justify-between items-center">
			<view class="flex items-center">
				<text class="font-500 mr10rpx text-28rpx w142rpx">报名人数</text>
				<text>{{ crtItem.curr_count }}/{{ allCount }}</text>
			</view>
			<view class="f-c-c text-28rpx enter-btn" @click="emit('goMemberList')">参赛名单</view>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">比赛类型</text>
			<text>{{ crtItem.match_type }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">报名限制</text>
			<text>{{ crtItem.condition }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">报名费</text>
			<text class="flex-1">{{ crtItem.cost }}元 {{ crtItem.postfee }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt30rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">发起方</text>
			<text class="flex-1">{{ eventDetail.tagid }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt2rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">报名时间</text>
			<text>{{ eventDetail.startenrolltime }}</text>
			<text class="mx6rpx">至</text>
			<text>{{ eventDetail.deadline }}</text>
		</view>
		<view class="bg-#fff h90rpx px20rpx mt20rpx flex items-center">
			<text class="font-500 mr10rpx text-28rpx w142rpx">比赛信息</text>
		</view>
		<view class="mt2rpx bg-#fff p20rpx">
			<mp-html :content="detail" />
		</view>
	</view>
</template>
<script setup>
	import { computed } from 'vue';
	import mpHtml from '@/uni_modules/mp-html/components/mp-html/mp-html.vue';
	const emit = defineEmits(['goMemberList']);
	const props = defineProps({
		eventDetail: {
			default: () => ({}),
			type: Object
		},
		crtItem: {
			default: () => ({}),
			type: Object
		},
		activeItemId: {
			default: null,
			type: [String, Number]
		}
	});
	const allCount = computed(() => {
		let num = props.crtItem.count - props.crtItem.sub_count
		return isNaN(num) ? '' : num
	})
	const detail = computed(() => {
		return decodeURIComponent(props.eventDetail?.detail ?? '');
	});
</script>

<style lang="scss" scoped>
	.enter-btn {
		height: 50rpx;
		padding: 0 16rpx;
		color: #39b54a;
		border: 1rpx solid #39b54a;

		&.enter {
			border-radius: 10rpx;
			background-color: #39b54a;
			color: #fff;
		}
	}
</style>