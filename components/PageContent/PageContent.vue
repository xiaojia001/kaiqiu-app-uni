<template>
	<view class="page-content" :style="{background:bgColor}">
		<view v-if="!noStatusBar" class="status-bar" :style="{background:titleColor}"></view>
		<view class="content-wraper">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			noStatusBar: {
				type: Boolean,
				default: false
			},
			bgColor: {
				type: String,
				default: '#F5F9FD'
			},
			titleColor: {
				type: String,
				default: '#F5F9FD'
			}
		},
	};
</script>

<style lang="scss" scoped>
	.page-content {
		width: 100vw;
		height: 100vh;
		// background: #282E39;
		display: flex;
		flex-direction: column;

		.status-bar {
			background-color: #37404f;
			flex-shrink: 0;
			height: var(--status-bar-height);
		}

		.content-wraper {
			overflow: hidden;
			width: 100vw;
			flex-grow: 1;
			display: flex;
		}
	}
</style>