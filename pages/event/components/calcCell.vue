<template>
	<view class="flex justify-center items-center flex-col text-10px" :style="{height}">
		<view class="process-cell" :class="item[1]" v-for="(item,i) in calcArr" :key="i">{{item[0]}}</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue';

	const props = defineProps({
		process: {
			default: () => [],
			type: Array
		},
		height: {
			type: String,
			default: '80rpx'
		}
	})
	const calcArr = computed(() => {
		return props.process.map(v => v.split(' '))
	})
</script>
<style lang="scss" scoped>
	.process-cell {
		line-height: 10px;
	}

	._c0 {
		color: #1c15e6;
	}

	._c1 {
		color: #F89703;
	}

	._c2 {
		color: #e61b09;
	}

	._c3 {
		color: #51ff07;
	}
</style>