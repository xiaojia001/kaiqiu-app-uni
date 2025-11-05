<template>
	<zb-table class="mt-2rpx" show-heade :columns="columns" stripe :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
		<template #name="{row}">
			<text class="text-#E6326E" v-if="row.role==5">*</text>
			<text>{{row.name}}</text>
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
			label: '#',
			width: uni.upx2px(70),
			align: 'center',
		},
		{
			type: 'slot',
			name: 'realname',
			label: '名称',
			width: uni.upx2px(160),
			fixed: 'left',
			align: 'center'
		},
		{
			name: 'username2',
			label: '昵称',
			align: 'center',
			width: uni.upx2px(160),
		},
		{
			name: 'sex',
			label: '性别',
			filters: {
				1: '男',
				2: '女'
			},
			align: 'center',
			width: uni.upx2px(76),
		},
		{
			name: 'score',
			label: '积分',
			align: 'center',
			width: uni.upx2px(100),
		},
		{
			name: 'resideprovince',
			label: '地区',
			align: 'center',
			width: uni.upx2px(140),
			emptyString: ' '
		}
	];

	function setCellHeaderStyle({ column, columnIndex }) {
		return {
			fontSize: '28rpx',
			paddingLeft: '0px',
			paddingRight: '0px'
		};
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = {
			fontSize: '28rpx',
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