<template>
	<view class="login-page">
		<!-- 背景层 -->
		<view class="bg-layer">
			<view class="bg-gradient"></view>
			<view class="bg-pattern"></view>
		</view>

		<!-- 登录卡片 -->
		<view class="login-card">
			<!-- 应用图标和标题 -->
			<view class="login-header">
				<view @click="handleClick" class="app-icon"></view>
				<!-- <text class="app-title">登录</text> -->
				<text class="app-subtitle">请输入开球网账号密码</text>
			</view>

			<!-- 登录表单 -->
			<form class="login-form" @submit.prevent="handleLogin">
				<!-- 账号输入 -->
				<view class="form-item">
					<view class="input-group" :class="{ error: usernameError }">
						<uni-icons type="user" size="24" color="#888"></uni-icons>
						<input type="text" v-model="username" placeholder="请输入账号" @blur="validateUsername" class="input-field" />
					</view>
					<text class="error-text" v-if="usernameError">{{ usernameError }}</text>
				</view>

				<!-- 密码输入 -->
				<view class="form-item">
					<view class="input-group" :class="{ error: passwordError }">
						<uni-icons type="lock" size="24" color="#888"></uni-icons>
						<input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码" @blur="validatePassword" class="input-field" />
						<uni-icons :type="showPassword ? 'eye-o' : 'eye-slash'" size="24" color="#888" @click="showPassword = !showPassword" class="toggle-icon"></uni-icons>
					</view>
					<text class="error-text" v-if="passwordError">{{ passwordError }}</text>
				</view>

				<!-- 登录按钮 -->
				<button type="submit" class="login-btn" :disabled="isLoading" :loading="isLoading" @click="handleLogin">
					<template v-if="isLoading">
						<text class="ml-2">登录中...</text>
					</template>
					<template v-else>登录</template>
				</button>
			</form>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { login } from '@/api/login.js';
let { setToken, setUserInfo, isMoreMode, setMoreMode } = useStore('user');
// 响应式变量
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const usernameError = ref('');
const passwordError = ref('');

const clickCount = ref(0); // 点击计数器
const lastClickTime = ref(0); // 上次点击时间
// 配置参数（非响应式，无需ref）
const maxClicks = 10; // 需要连续点击的次数
const interval = 1000; // 有效点击间隔（毫秒）

// 点击事件处理
const handleClick = () => {
	const currentTime = new Date().getTime();
	const timeDiff = currentTime - lastClickTime.value;

	// 间隔超过设定时间，重置计数
	if (timeDiff > interval) {
		clickCount.value = 1;
	} else {
		// 有效时间内，累加计数
		clickCount.value++;
	}

	// 更新上次点击时间
	lastClickTime.value = currentTime;

	// 达到目标次数，触发事件
	if (clickCount.value === maxClicks) {
		triggerEvent();
		clickCount.value = 0; // 重置计数，允许再次触发
	}
};

// 触发的目标事件
const triggerEvent = () => {
	if (isMoreMode.value) {
		return uni.showToast({
			title: '已经是隐藏模式了！',
			icon: 'none',
			duration: 2000
		});
	}
	uni.showToast({
		title: '成功解锁隐藏模式！',
		icon: 'success',
		icon: 'none',
		duration: 2000
	});
	setMoreMode();
};

// 验证用户名
const validateUsername = () => {
	if (!username.value.trim()) {
		usernameError.value = '请输入账号';
		return false;
	} else {
		usernameError.value = '';
		return true;
	}
};

// 验证密码
const validatePassword = () => {
	if (!password.value) {
		passwordError.value = '请输入密码';
		return false;
	} else if (password.value.length < 6) {
		passwordError.value = '密码长度不能少于6位';
		return false;
	} else {
		passwordError.value = '';
		return true;
	}
};

// 处理登录
const handleLogin = async () => {
	// 表单验证
	const isUserValid = validateUsername();
	const isPwdValid = validatePassword();

	if (!isUserValid || !isPwdValid) {
		return;
	}

	// 模拟登录请求
	isLoading.value = true;
	try {
		// 实际项目中替换为真实接口调用
		let res = await login({ account: username.value, password: password.value });
		console.log(res);
		setToken(res.data.userinfo.token);
		setUserInfo(res.data.userinfo);
		uni.reLaunch({
			url: '/pages/main/main'
		});
	} catch (error) {
		console.log(error);
		uni.showToast({
			title: '登录失败，请检查账号密码',
			icon: 'none',
			duration: 2000
		});
	} finally {
		isLoading.value = false;
	}
};
</script>

<style scoped>
.login-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background-color: #f7f8fa;
	position: relative;
	padding: 0 30rpx;
}

/* 背景样式 */
.bg-layer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
}

.bg-gradient {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 400rpx;
	background: linear-gradient(135deg, #2c84ff 0%, #0a5fff 100%);
}

.bg-pattern {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 400rpx;
	background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* 登录卡片 */
.login-card {
	width: 100%;
	max-width: 540rpx;
	background-color: #fff;
	border-radius: 24rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
	padding: 60rpx 40rpx;
	position: relative;
	z-index: 1;
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
	transform: translateY(-5rpx);
	box-shadow: 0 15rpx 45rpx rgba(0, 0, 0, 0.1);
}

/* 登录头部 */
.login-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;
}

.app-icon {
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	background: url(/static/kaiqiu_logo.png) no-repeat center;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.3);
}

.app-title {
	font-size: 38rpx;
	font-weight: 600;
	color: #1d2129;
	margin-bottom: 12rpx;
}

.app-subtitle {
	font-size: 26rpx;
	color: #86909c;
}

/* 表单样式 */
.login-form {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.form-item {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.input-group {
	display: flex;
	align-items: center;
	padding: 0 28rpx;
	height: 100rpx;
	border: 2rpx solid #e5e6eb;
	border-radius: 16rpx;
	transition: all 0.25s ease;
}

.input-group:focus-within {
	border-color: #1677ff;
	box-shadow: 0 0 0 5rpx rgba(22, 119, 255, 0.1);
}

.input-group.error {
	border-color: #ff4d4f;
}

.input-field {
	flex: 1;
	height: 100%;
	font-size: 30rpx;
	padding: 0 20rpx;
	color: #1d2129;
}

.input-field::placeholder {
	color: #c9cdd4;
}

.toggle-icon {
	cursor: pointer;
	transition: color 0.2s;
}

.toggle-icon:hover {
	color: #1677ff;
}

.error-text {
	font-size: 24rpx;
	color: #ff4d4f;
	padding-left: 28rpx;
	height: 28rpx;
	line-height: 28rpx;
}

/* 忘记密码 */
.forgot-password {
	align-self: flex-end;
	padding: 10rpx 0;
}

.forgot-password text {
	font-size: 26rpx;
	color: #1677ff;
	cursor: pointer;
	transition: color 0.2s;
}

.forgot-password text:hover {
	color: #0958d9;
}

/* 登录按钮 */
.login-btn {
	width: 100%;
	height: 104rpx;
	line-height: 104rpx;
	font-size: 32rpx;
	border-radius: 16rpx;
	background-color: #1677ff;
	color: #fff;
	margin-top: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
}

.login-btn[disabled] {
	background-color: #8cc5ff;
	cursor: not-allowed;
}

.login-btn:not([disabled]):hover {
	background-color: #0958d9;
}
</style>
