<template>
	<view class="pb10rpx">
		<view class="flex items-center p20rpx justify-between bg-#fff">
			<text class="text-#333 text-26rpx f-c-c">
				<text class="text-32rpx mr6rpx font-600">项目 {{ crtItem.name }}</text>
			</text>
			<view v-if="listMe.length" class="change-btn f-c-c" @click="showInfo">积分变化待确认</view>
		</view>
		<zb-table show-heade :columns="column" :stripe="false" :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @rowClick="rowClick">
			<template #change="{row}">
				{{row.change>0?`+${row.change}`:row.change}}
			</template>
		</zb-table>
		<view v-if="listMe.length" class="mt40rpx">
			<view class="p20rpx bg-#fff flex items-center text-32rpx text-#333">
				个人积分变化(仅供参考)
			</view>
			<zb-table show-heade :columns="columnMe" :stripe="false" :fit="false" border :data="listMe" :cell-style="setStyleMe" :cell-header-style="setStyleMe" @cellClick="cellClick">
				<template #result="{row}">
					{{`${row.result1}:${row.result2}`}}
				</template>
				<template #username1="{row}">我</template>
			</zb-table>
		</view>
	</view>
</template>
<script setup>
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	import { getScoreChangeByEventid } from '@/api/event.js';
	import { goUserPageByUid } from '@/utils/goPage.js'
	import { computed, watch } from 'vue';
	const { userInfo } = useStore('user');
	const groupId = ref('');
	const list = ref([]);
	let allList = [];
	const ifCalObj = ref({})
	const myScObj = ref({})
	const props = defineProps({
		eventDetail: {
			default: () => ({}),
			type: Object
		},
		crtItem: {
			default: () => ({}),
			type: Object
		},
		activeItemId: {
			default: null,
			type: [String, Number]
		}
	});
	const column = [{
			type: 'index',
			label: '序号',
			width: uni.upx2px(120),
			fixed: 'left',
			align: 'center'
		},
		{
			name: 'realname',
			label: '姓名',
			width: uni.upx2px(170),
			align: 'center'
		},
		{
			name: 'prescore',
			label: '赛前积分',
			align: 'center',
			width: uni.upx2px(170),
		},
		{
			name: 'postscore',
			label: '赛后积分',
			align: 'center',
			width: uni.upx2px(170),
		},
		{
			type: 'slot',
			name: 'change',
			label: '变化',
			align: 'center',
			width: uni.upx2px(120),
		},
	]
	const columnMe = [{
			type: 'index',
			label: '序号',
			width: uni.upx2px(120),
			fixed: 'left',
			align: 'center'
		},
		{
			type: 'slot',
			name: 'username1',
			label: '姓名1',
			width: uni.upx2px(170),
			align: 'center'
		},
		{
			name: 'username2',
			label: '姓名2',
			align: 'center',
			width: uni.upx2px(170),
		},
		{
			type: 'slot',
			name: 'result',
			label: '比分',
			align: 'center',
			width: uni.upx2px(170),
		},
		{
			name: 'score1',
			label: '变化',
			align: 'center',
			width: uni.upx2px(120),
		},
	]
	init();

	watch(
		() => props.activeItemId,
		(val) => {
			list.value = allList[val] ?? [];
		}
	);

	const ifCal = computed(() => {
		return ifCalObj.value?.[props.activeItemId] === 1
	})

	const listMe = computed(() => {
		return myScObj.value?.[props.activeItemId] ?? []
	})

	function init() {
		getScoreChangeByEventid(props.eventDetail.eventid).then((res) => {
			if (res.data) {
				allList = res.data.sc ?? {};
				list.value = allList[props.activeItemId] ?? [];
				ifCalObj.value = res.data.ifCal ?? {}
				myScObj.value = res.data.mysc ?? {}
			}
		});
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
			fontSize: '28rpx',
			paddingLeft: '6rpx',
			paddingRight: '6rpx'
		};
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = {
			fontSize: '28rpx',
			paddingLeft: '6rpx',
			paddingRight: '6rpx'
		};
		if (columnIndex % 2 == 0 && columnIndex > 0) {
			obj.color = '#E6326E';
		} else if (columnIndex % 2 == 1) {
			obj.color = '#248DFF';
		}
		return obj;
	}

	function setStyleMe({ row, column, rowIndex, columnIndex }) {
		let obj = {
			fontSize: '28rpx',
			paddingLeft: '6rpx',
			paddingRight: '6rpx'
		};
		if (columnIndex === 2) {
			obj.color = '#248DFF';

		} else if (columnIndex > 2) {
			obj.color = '#E6326E';
		}
		return obj;
	}

	function rowClick({ uid }) {
		uid && goUserPageByUid(uid)
	}

	function cellClick(row, index, column) {
		if (column.name === 'username2') {
			goUserPageByUid(row.uid2)
		}
	}

	function showInfo() {
		uni.showToast({
			title: "此积分仅供参考,站方会在10个工作日后确认",
			icon: 'none',
			duration: 3000
		})
	}
</script>

<style lang="scss" scoped>
	.change-btn {
		border: 2rpx solid #E6326E;
		color: #E6326E;
		padding: 8rpx 16rpx;
		font-size: 26rpx;
	}
</style>