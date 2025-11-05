<template>
	<view>
		<view class="bg-#F89703 flex justify-between items-center px-40rpx pb20rpx">
			<view class="flex justify-center items-center flex-col text28rpx text-#000">
				<view class="w192rpx h192rpx rounded-91rpx bg-white">
					<image class="w-full h-full rounded-91rpx" :src="current_game.headImg1" mode=""></image>
				</view>
				<view class="mt-12px">{{current_game.username1}}({{current_game.realname1}})</view>
				<view class="mt-8px text-24rpx text-#333">当前积分: {{current_game.score1}}</view>
			</view>
			<view class="text-#fff text-80rpx">vs</view>
			<view class="flex justify-center items-center flex-col text28rpx text-#000">
				<view class="w192rpx h192rpx rounded-91rpx bg-white">
					<image class="w-full h-full rounded-91rpx" :src="current_game.headImg2" mode=""></image>
				</view>
				<view class="mt-12px">{{current_game.username2}}({{current_game.realname2}})</view>
				<view class="mt-8px text-24rpx text-#333">当前积分: {{current_game.score2}}</view>
			</view>
		</view>
		<view class="bg-#fff flex flex-col items-center">
			<view class="text-#333 text-50rpx mt60rpx">本场数据</view>
			<view class="info-box">
				<view class="flex text-#39B54A">
					<view class="text-28rpx mr26rpx">{{current_game.start_time}}</view>
					<view class="flex-1 font-600 text-30rpx" @click="goEventMainPage({eventid:current_game.eventid})">{{current_game.title}}</view>
				</view>
				<view class="text-#333 text-50rpx mt30rpx f-c-c">本场比分({{current_game.groupid=='-1'?'淘汰赛':'小组赛'}})</view>
				<view class="f-c-c text-28rpx text-#000 mt-12px">
					<view class="text-80rpx f-c-c w192rpx text-#E6326E">{{current_game.result1}}</view>
					<text class="px-40rpx">:</text>
					<view class="text-80rpx f-c-c w192rpx text-#E6326E">{{current_game.result2}}</view>
				</view>
				<view class="text-#333 text-30rpx mt30rpx f-c-c">报名积分</view>
				<view class="f-c-c text-28rpx text-#000 mt-12px">
					<view class="text-40rpx f-c-c w92rpx">{{current_game.before_score1}}</view>
					<text class="px-40rpx">:</text>
					<view class="text-40rpx f-c-c w92rpx">{{current_game.before_score2}}</view>
				</view>
				<view class="text-#333 text-30rpx mt30rpx f-c-c">积分变化</view>
				<view class="f-c-c text-28rpx text-#000 mt-12px">
					<view class="text-30rpx f-c-c">{{current_game.change_score1}}</view>
					<text class="px-40rpx">:</text>
					<view class="text-30rpx f-c-c">{{current_game.change_score2}}</view>
				</view>
			</view>
			<view class="text-#333 text-50rpx mt80rpx f-c-c">历史交战全记录</view>
			<view class="flex justify-between items-center px-40rpx pb20rpx  text-#000 mt-32px">
				<view class="flex justify-center items-center flex-col text28rpx w192rpx">
					<view class="mt-12px">{{current_game.username1}}</view>
					<view>({{current_game.realname1}})</view>
				</view>
				<view class="text-30rpx">vs</view>
				<view class="flex justify-center items-center flex-col text28rpx w192rpx">
					<view class="mt-12px">{{current_game.username2}}</view>
					<view>({{current_game.realname2}})</view>
				</view>
			</view>
			<view class="flex justify-between items-center px-40rpx pb20rpx text-#000 mt-12px">
				<view class="text-48rpx">
					{{allInfo.winCount1}}
				</view>
				<view class="text-30rpx mx80rpx">-</view>
				<view class="text-48rpx">
					{{allInfo.winCount2}}
				</view>
			</view>
			<zb-table show-heade :columns="columns" stripe :fit="false" border :data="allInfo.history_game" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
				<template #bifen="{row}">
					{{`${row.result1}:${row.result2}`}}
				</template>
			</zb-table>
		</view>

	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { getGameDetailByGameid } from '@/api/match.js'
	import { goUserPageByUid, goEventMainPage, goMatchDetailByGameid } from '@/utils/goPage.js'
	const allInfo = ref({
		current_game: {},
		winCount1: 0,
		winCount2: 0,
		history_game: []
	})
	const columns = [{
			type: 'index',
			name: 'index',
			label: '序号',
			align: 'center',
			width: uni.upx2px(80)
		},
		{
			name: 'username1',
			label: '姓名',
			align: 'center',
			width: uni.upx2px(140)
		},
		{
			name: 'username2',
			label: '姓名',
			align: 'center',
			width: uni.upx2px(140)
		},
		{
			type: 'slot',
			name: 'bifen',
			label: '比分',
			align: 'center',
			width: uni.upx2px(120)
		},
		{
			name: 'change_score1',
			label: '变化',
			align: 'center',
			width: uni.upx2px(110)
		},
		{
			name: 'start_time',
			label: '日期',
			align: 'center',
			width: uni.upx2px(110)
		}
	];
	const crtGameId = ref('')
	const current_game = computed(() => {
		return allInfo.value.current_game ?? {}
	})
	onLoad(({ gameid }) => {
		crtGameId.value = gameid
		getGameDetailByGameid(gameid).then(res => {
			allInfo.value = res.data
		})
	})

	function setCellHeaderStyle({ column, columnIndex }) {
		return {
			fontSize: '24rpx',
			paddingLeft: '0px',
			paddingRight: '0px'
		};
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = {
			fontSize: '24rpx',
			paddingLeft: '0px',
			paddingRight: '0px'
		};
		if (column.name === 'username1') {
			if (row.result1 > row.result2) {
				obj.background = '#A7D6A9'
			}
		}
		if (column.name === 'username2') {
			if (row.result2 > row.result1) {
				obj.background = '#A7D6A9'
			}
		}
		return obj;
	}


	function cellClick(row, index, column) {
		if (column.name === 'username1') {
			goUserPageByUid(row.uid1)
		}
		if (column.name === 'username2') {
			goUserPageByUid(row.uid2)
		}
		if (column.name === 'bifen' && crtGameId.value !== row.gameid) {
			goMatchDetailByGameid(row.gameid, true)
		}
	}
</script>

<style lang="scss" scoped>
	.info-box {
		box-sizing: border-box;
		margin-top: 40rpx;
		padding: 40rpx;
		width: 680rpx;
		border: 1px solid #39B54A;
		border-radius: 16rpx;
	}
</style>