<template>
	<zb-table class="mt-2rpx" show-heade :columns="columns" stripe :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
		<template #name="{row}">
			<text class="text-#E6326E" v-if="row.role==5">*</text>
			<text>{{row.name}}</text>
		</template>
		<template #birthyear="{row}">
			<text>{{row.birthyear==0?'':row.birthyear}}</text>
		</template>
	</zb-table>
</template>

<script setup>
	import { goUserPageByUid } from '@/utils/goPage.js'
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	const props = defineProps({
		list: { type: Array, default: () => [] }
	})
	const columns = [{
			type: 'index',
			label: '序号',
			width: uni.upx2px(70),
			align: 'center'
		},
		{
			type: 'slot',
			name: 'realname',
			label: '姓名',
			width: uni.upx2px(160),
			align: 'center'
		},
		{
			name: 'score',
			label: '当前积分',
			align: 'center',
			width: uni.upx2px(110),
		},
		{
			name: 'maxscore',
			label: '最高积分',
			align: 'center',
			width: uni.upx2px(110),
		},
		{
			name: 'resideprovince',
			label: '省份',
			align: 'center',
			width: uni.upx2px(120),
		},
		{
			name: 'sex',
			label: '性别',
			align: 'center',
			width: uni.upx2px(80),
			filters: {
				1: '男',
				2: '女'
			},
		},
		{
			name: 'birthyear',
			type: 'slot',
			label: '生于',
			align: 'center',
			width: uni.upx2px(80),
		},
	];

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
		if (column.name === 'paid') {
			/* 缴费状态*/
			obj.color = {
				0: '#E6326E',
				1: '#39B54A',
				2: '#F89703'
			} [row.paid] ?? '#666';
		}
		if (column.name === 'name' && row.teamid) {
			/* 团体赛队名 */
			obj.fontWeight = 600
		}
		if (column.name === 'newscore') {
			/* 无积分区分 */
			obj.color = row.score == 0 || row.setscore == 1 ? '#F89703' : '#39B54A';
		}
		return obj;
	}

	function cellClick(row, index, column) {
		if (row.uid) {
			goUserPageByUid(row.uid)
		}
	}
</script>

<style>
</style>