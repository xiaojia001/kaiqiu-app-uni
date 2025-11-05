<template>
	<view>
		<view class="flex justify-between p20rpx bg-#fff">
			<view @click="refresh">刷新比赛</view>
			<view @click="goGroupDetailPage(params)">回到小组赛</view>
		</view>
		<view class="mt-2rpx pb20rpx bg-#fff">
			<view class="flex flex-col items-center" v-for="(item,i) in list" :key="item.roundname">
				<view class="border-1rpx border-solid border-#F89703 text-#F89703 px16rpx py4rpx my10px">{{item.roundname}}</view>
				<zb-table class="mb30rpx" show-heade :columns="column" :stripe="false" :fit="false" border :data="item.games" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle"
					@cellClick="(...rest)=>cellClick(...rest,i)">
					<template #bifen="{row}">
						{{`${row.result1}:${row.result2}`}}
					</template>
				</zb-table>
			</view>
		</view>
		<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">
			<view class="bg-#fff p20rpx text-center">
				<view class="text-24rpx text-#333">第{{rowInfo.group}}组 {{`${rowInfo.username1}:${rowInfo.username2}`}} {{`${rowInfo.result1}:${rowInfo.result2}`}}</view>
				<view class="w-full h2rpx bg-#f2f2f2 my14rpx"></view>
				<view class="flex flex-wrap gap-wrap">
					<view class="w-80rpx mt-6rpx">比分</view>
					<view v-for="item in scorePreList" :key="item" :class="[item===rowInfo.activeBifen?'active':'']" class="border-1rpx border-solid border-#77B980 f-c-c w-80rpx mt-6rpx box-border"
						@click="clickBifen(item)">{{item}}</view>
				</view>
				<view class="flex items-center  gap-wrap mt-16rpx">
					<view class="w-80rpx">弃权</view>
					<uni-data-checkbox multiple v-model="rowInfo.checkbox" :localdata="localdata" @change="changeVal"></uni-data-checkbox>
				</view>
				<view class="w-full h2rpx bg-#f2f2f2 my14rpx"></view>
				<view class="flex">
					<button size="mini" @click="popup.close()">关闭</button>
					<button size="mini" type="primary" @click="setScore">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { getArrangeKnockout, update_tt_score } from '@/api/match.js'
	import { goGroupDetailPage } from '@/utils/goPage.js'
	let params = {}
	const popup = ref(null)
	const list = ref([])
	const scorePreList = ['0:0', '2:0', '2:1', '1:2', '0:2', '3:0', '3:1', '3:2', '2:3', '1:3', '0:3', '4:0', '4:1', '4:2', '4:3', '3:4', '2:4', '1:4', '0:4']
	const rowInfo = ref({ checkbox: [] })
	onLoad(({ itemid, eventid }) => {
		params = { itemid, eventid }
		refresh()
	})
	const localdata = computed(() => {
		return [{ text: rowInfo.value.username1, value: 'username1' }, { text: rowInfo.value.username2, value: 'username2' }]
	})
	const column = [{
			type: 'index',
			label: '序号',
			align: 'center',
			width: uni.upx2px(80)
		},
		{
			name: 'username1',
			label: '选手1',
			align: 'center',
			emptyString: ' ',
			width: uni.upx2px(180)
		},
		{
			name: 'username2',
			label: '选手2',
			align: 'center',
			emptyString: ' ',
			width: uni.upx2px(180)
		},
		{
			type: 'slot',
			name: 'bifen',
			label: '比分',
			align: 'center',
			emptyString: ' ',
			width: uni.upx2px(120)
		},
		{
			name: 'gameRemark',
			label: '详情',
			align: 'center',
			width: uni.upx2px(100),
			emptyString: ' '
		}
	]

	function refresh() {
		getArrangeKnockout(params).then(res => {
			// console.log(res.data);
			list.value = res.data ?? []
		})
	}


	function setTableData(item, i) {
		let list = item.map((v, index) => {
			return {
				...v,
				newUsername: `${index + 1}${v.username}`
			};
		});
		return list;
	}

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
			if (row.result2 === 'wo' || row.result2 < row.result1) {
				obj.color = '#F89703'
			}
		}
		if (column.name === 'username2') {
			if (row.result1 === 'wo' || row.result1 < row.result2) {
				obj.color = '#F89703'
			}
		}
		return obj;
	}

	function cellClick(row, index, column, i) {
		if (column.name === 'bifen') {
			// goUserPageByUid(row.uid)
			rowInfo.value = { ...row, show: true, group: i + 1, checkbox: [], activeBifen: '' }
			popup.value.open()
		}
	}

	function changeVal(val) {
		let list = val.detail.value
		rowInfo.value.activeBifen = ''
		if (list.length === 2) {
			rowInfo.value.activeBifen = 'wo:wo'
		} else if (list.length === 1) {
			if (list[0] === 'username1') {
				rowInfo.value.activeBifen = 'wo:2'
			} else {
				rowInfo.value.activeBifen = '2:wo'
			}
		}
	}

	function clickBifen(item) {
		rowInfo.value.activeBifen = item
		rowInfo.value.checkbox = []
	}

	function setScore() {
		const { activeBifen, gameid, uid1, uid2, eventid, itemid } = rowInfo.value
		if (!activeBifen) {
			return uni.showToast({ title: '请设置比分', icon: 'none' })
		}
		if (activeBifen === 'wo:wo') {
			return uni.showToast({ title: '淘汰赛不支持同时弃权', icon: 'none' })
		}
		update_tt_score({ groupid: -1, score: activeBifen, gameid, uid1, uid2, eventid, itemid }).then(res => {
			popup.value.close()
			refresh()
		})
	}
</script>

<style lang="scss" scoped>
	.gap-wrap {
		gap: 8rpx;
	}

	.active {
		background: #77B980;
		color: #fff;
	}
</style>