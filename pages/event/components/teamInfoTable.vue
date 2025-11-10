<template>
	<view>
		<view class="f-c-c mb12rpx">{{team.name}}</view>
		<zb-table show-heade :columns="columns" :stripe="false" :fit="false" border :data="newList" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
			<template #name="{row}">
				<text class="text-#E6326E" v-if="row.role==5">*</text>
				<text>{{row.name}}</text>
			</template>
		</zb-table>
	</view>
</template>

<script setup>
	import { goUserPageByUid } from '@/utils/goPage.js'
	const props = defineProps({
		team: { type: Object, required: true }
	})
	const columns = [{
			name: 'number',
			label: '#',
			width: 40,
			fixed: 'left',
			align: 'center',
			emptyString: ' '
		},
		{
			type: 'slot',
			name: 'name',
			label: '名称',
			width: 140,
			fixed: 'left',
			align: 'center'
		},
		{
			name: 'newscore',
			label: '报名积分',
			align: 'center',
			width: 70
		},
		// {
		// 	name: 'paid',
		// 	label: '确认',
		// 	align: 'center',
		// 	filters: {
		// 		0: '交费处理中',
		// 		1: '已交付',
		// 		2: '已报名'
		// 	},
		// 	width: 120
		// },
		{
			name: 'sex',
			label: '性别',
			filters: {
				1: '男',
				2: '女'
			},
			align: 'center',
			width: 56
		}
	];
	const newList = computed(() => {
		return props.team.list.map((v) => {
			return {
				...v,
				newscore: v.score == 0 ? '无积分' : v.score
			};
		});
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