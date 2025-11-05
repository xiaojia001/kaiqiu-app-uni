<template>
	<view class="content">
		<image class="logo" src="/static/kaiqiu_logo.png"></image>
		<view class="text-area">
			<text class="title">更新资料中...</text>
		</view>
	</view>
</template>

<script setup>
	let { token } = useStore('user')
	if (token.value) {
		uni.reLaunch({
			url: '/pages/main/main'
		})
	} else {
		uni.reLaunch({
			url: '/pages/login/login'
		})
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #248dff;
	}

	.logo {
		border-radius: 100rpx;
		height: 200rpx;
		width: 200rpx;
		/* margin-top: 200rpx; */
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #fff;
	}
</style>