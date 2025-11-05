<template>
	<view class="pb10rpx">
		<view class="flex items-center p20rpx justify-between bg-#fff">
			<text class="text-#333 text-26rpx f-c-c">
				<text class="text-32rpx mr6rpx font-600">{{ crtItem.name }}</text>
				<text v-if="crtItem.qualNum > 0">(小组出线{{ crtItem.qualNum }}人)</text>
			</text>
			<view v-if="groups.length" class="score-btn f-c-c" @click="goSetScorePage">录入成绩</view>
			<view v-else class="score-btn f-c-c">设定中...</view>
		</view>
		<template v-if="groups.length">
			<view class="mb50rpx" v-for="(item, i) in groups" :key="i">
				<view class="p20rpx bg-#fff p20rpx text-#F89703">第{{ i + 1 }}台</view>
				<zb-table show-heade :columns="setTableColumns(item, i)" :stripe="false" :fit="false" border :data="setTableData(item, i)" :cell-style="setCellStyle"
					:cell-header-style="setCellHeaderStyle" @cellClick="(...rest)=>cellClick(...rest,i)"></zb-table>
			</view>
		</template>
	</view>
</template>
<script setup>
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	import { getGroups } from '@/api/event.js';
	import { goUserPageByUid, goTTdetailPage, goGroupDetailPage } from '@/utils/goPage.js'
	import { watch } from 'vue';
	const { userInfo } = useStore('user');
	const groupId = ref('');
	const groups = ref([]);
	let allGroups = [];
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
	
	setTimeout(() => {
		init();
	}, 50)

	watch(
		() => props.activeItemId,
		(val) => {
			groups.value = allGroups[val].groups;
		}
	);

	function init() {
		getGroups({ eventid: props.eventDetail.eventid, itemid: props.activeItemId }).then((res) => {
			if (res.data) {
				allGroups = res.data;
				groups.value = res.data[props.activeItemId].groups;
			}
		});
	}

	function setTableColumns(item, i) {
		let list = [];
		list.push({
			name: 'newUsername',
			label: `第${i + 1}组`,
			width: 100,
			fixed: 'left',
			align: 'center'
		});
		list.push(
			...item.map((v, index) => {
				let pxWidth = (uni.upx2px(750) - 100) / item.length;
				return {
					name: 'col' + (index + 1),
					label: index + 1,
					align: 'center',
					emptyString: ' ',
					width: pxWidth
				};
			})
		);
		return list;
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
		if (rowIndex + 1 === columnIndex) {
			obj.background = '#F2F1EE';
		}
		if (row.uid == userInfo.value.id) {
			obj.color = '#F89703';
			obj.fontWeight = 600;
		}
		return obj;
	}

	function cellClick(row, index, column, i) {
		if (column.name === 'newUsername') {
			goUserPageByUid(row.uid)
		}
	}

	function goSetScorePage() {
		const { ifTT } = props.crtItem
		if (ifTT) {
			goTTdetailPage({ itemid: props.activeItemId, eventid: props.eventDetail.eventid })
		} else {
			goGroupDetailPage({ itemid: props.activeItemId, eventid: props.eventDetail.eventid })
		}
	}
</script>

<style lang="scss" scoped>
	.score-btn {
		border: 2rpx solid #39b54a;
		color: #39b54a;
		padding: 8rpx 16rpx;
		font-size: 26rpx;
	}
</style>