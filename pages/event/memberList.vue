<template>
	<view>
		<view class="bg-#FFFEFF text-#39B54A px20rpx pb20rpx">{{ baseInfo.event_name }}</view>
		<view class="bg-#FFFEFF text-#666 px20rpx flex items-center h80rpx mt2px justify-between">
			<text>{{ baseInfo.match_name }}</text>
		</view>
		<zb-table show-heade :columns="columns" stripe :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
			<template #name="{row}">
				<text class="text-#E6326E" v-if="row.role==5">*</text>
				<text>{{row.name}}</text>
			</template>
		</zb-table>
	</view>
</template>

<script setup>
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	import { get_member_detail } from '@/api/event.js';
	import { goUserPageByUid } from '@/utils/goPage.js'
	const baseInfo = ref({});
	const list = ref([]);
	const columns = [{
			name: 'number',
			label: '#',
			width: 40,
			fixed: 'left',
			align: 'center',
			emptyString: ' '
		},
		{
			type:'slot',
			name: 'name',
			label: '名称',
			width: 100,
			fixed: 'left',
			align: 'center'
		},
		{
			name: 'newscore',
			label: '报名积分',
			align: 'center',
			width: 70
		},
		{
			name: 'paid',
			label: '确认',
			align: 'center',
			filters: {
				0: '交费处理中',
				1: '已交付',
				2: '已报名'
			},
			width: 120
		},
		{
			name: 'sex',
			label: '性别',
			filters: {
				1: '男',
				2: '女'
			},
			align: 'center',
			width: 46
		}
	];

	onLoad(({ matchStr }) => {
		let str = decodeURIComponent(matchStr);
		baseInfo.value = JSON.parse(str);
		getList();
	});

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

	function getList() {
		let { match_id, id } = baseInfo.value;
		get_member_detail({
			match_id,
			id
		}).then((res) => {
			list.value = (res.data?.list ?? []).map((v) => {
				return {
					...v,
					newscore: v.score == 0 ? '无积分' : v.score
				};
			});
		});
	}

	function cellClick(row, index, column) {
		if (row.uid && column.name === 'name') {
			goUserPageByUid(row.uid)
		}
		if (row.teamid && column.name === 'name') {
			uni.showToast({
				title: row.name,
				icon: 'none'
			})
		}
		if (column.name === 'mobile') {
			uni.makePhoneCall({
				phoneNumber: row.mobile
			});
		}
	}
</script>

<style lang="scss" scoped></style>