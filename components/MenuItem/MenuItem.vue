<template>
	<view class="menu-item" :class="itemClass" @click="handleClick">
		<view class="menu-item-content">
			<uni-icons :type="icon" size="48rpx" :color="iconColor"></uni-icons>
			<text class="menu-text" :class="textClass">{{ text }}</text>
		</view>
		<view v-if="extraText" class="menu-extra" :class="extraClass">
			<text>{{ extraText }}</text>
		</view>
		<image v-if="showArrow" class="menu-arrow" src="/static/userCenter/ic-arrow.svg" mode="" />
	</view>
</template>

<script setup>
const props = defineProps({
	icon: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	showArrow: {
		type: Boolean,
		default: true
	},
	extraText: {
		type: String,
		default: ''
	},
	extraClass: {
		type: String,
		default: ''
	},
	// 整行样式类
	itemClass: {
		type: String,
		default: ''
	},
	// 图标颜色
	iconColor: {
		type: String,
		default: ''
	},
	// 文字样式类
	textClass: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['click'])

function handleClick() {
	emit('click')
}
</script>

<style scoped lang="scss">
.menu-item {
	display: flex;
	height: 108rpx;
	background-color: #fff;
	align-items: center;
	padding: 0 40rpx 0 52rpx;
	margin-top: 2rpx;
	transition: background-color 0.2s;

	&:active {
		background-color: #f5f5f5;
	}

	// 未签到状态 - 高亮显示
	&.sign-pending {
		background: linear-gradient(90deg, #fff 0%, #fff8f0 100%);
		
		.menu-text {
			color: #FF9500;
			font-weight: 500;
		}
	}

	// 已签到状态
	&.sign-done {
		.menu-text {
			color: #999;
		}
	}
}

.menu-item-content {
	flex: 1;
	display: flex;
	align-items: center;
}

.menu-text {
	color: #333;
	font-size: 28rpx;
	margin-left: 32rpx;
	transition: color 0.2s;
}

.menu-extra {
	font-size: 26rpx;
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
	margin-right: 16rpx;
	transition: all 0.2s;

	// 未签到 - 橙色背景
	&.status-pending {
		color: #FF9500;
		background-color: #FFF5E6;
		font-weight: 500;
	}

	// 已签到 - 灰色
	&.status-done {
		color: #999;
		background-color: #F5F5F5;
	}

	// 签到中
	&.status-loading {
		color: #007AFF;
		background-color: #E6F2FF;
	}
}

.menu-arrow {
	width: 40rpx;
	height: 40rpx;
}
</style>
