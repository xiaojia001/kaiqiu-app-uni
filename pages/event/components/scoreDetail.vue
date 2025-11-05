<template>
	<view class="pb10rpx">
		<view v-if="honors.length" class="bg-#fff p20rpx">
			<view class="f-c-c p20rpx">名次列表</view>
			<view v-for="(item, i) in honors" :key="i" class="flex items-center" @click="goUserPageByUid(item.uid)">
				<view class="flex items-center text-#E6326E w162rpx">{{ item.honor }}</view>
				<view class="flex-1 honor-box truncate" :class="[i === 0 ? 'is-first' : '']">{{ item.name }}</view>
			</view>
		</view>
		<view class="mb50rpx" v-for="(item, i) in groups" :key="i">
			<view class="p20rpx bg-#fff p20rpx text-#F89703">第{{ i + 1 }}台</view>
			<zb-table show-heade :columns="setTableColumns(item, i)" :stripe="false" :fit="false" border :data="setTableData(item, i)" :cell-style="setCellStyle"
				:cell-header-style="setCellHeaderStyle" @cellClick="(...rest)=>cellClick(...rest,i)">
				<template #calc="{ row }">
					<calcCell :process="row.process||[]" />
				</template>
			</zb-table>
			<view v-if="item[0].detail_games">
				<view class="bg-#fffb85 f-c-c h70rpx border-1px border-solid border-#77B980" @click="setShow(i)">{{item[0].showDetail?'隐藏':'显示'}}第{{ i + 1 }}组详细成绩</view>
				<template v-if="item[0].showDetail">
					<view v-for="info in item[0].detail_games" :key="info.tgameid" class="flex flex-col items-center mt-30rpx">
						<view class="f-c-c border-1px border-solid border-#F89703 h40rpx text-#F89703 text-24rpx px-40rpx">{{info.roundname}}</view>
						<view class="w580rpx mt-12rpx">
							<zb-table show-heade :columns="innerColums" :stripe="false" :fit="false" border :data="info.games" :cell-style="setCellStyleSmall" :cell-header-style="setCellHeaderStyle">
								<template #username1="{ row }">
									<view class="leading-24rpx h-full whitespace-normal f-c-c" :class="[row.result1>row.result2?'text-#F89703':'']">
										<text>{{row.username1}}</text>
									</view>
								</template>
								<template #username2="{ row }">
									<view class="leading-30rpx h-full whitespace-normal f-c-c" :class="[row.result2>row.result1?'text-#F89703':'']">
										<text>{{row.username2}}</text>
									</view>
								</template>
								<template #bifen="{ row }">
									{{`${row.result1}:${row.result2}`}}
								</template>
								<template #detail="{ row }">
									<uni-icons v-if="row.flag==0" type="arrow-right" size="30rpx" @click="goMatchDetailByGameid(row.gameid)"></uni-icons>
								</template>
							</zb-table>
						</view>
					</view>
				</template>
			</view>
		</view>
		<ttGameInfo :key="activeItemId" v-if="ttgames.length" :matchData="ttgames"></ttGameInfo>
		<view v-if="ttdetailgames.length">
			<view class="bg-#fffb85 f-c-c h70rpx border-1px border-solid border-#77B980" @click="showTtDetail=!showTtDetail">{{showTtDetail?'隐藏':'显示'}}淘汰赛详细成绩</view>
			<template v-if="showTtDetail">
				<view v-for="info in ttdetailgames" :key="info.tgameid" class="flex flex-col items-center mt-30rpx">
					<view class="f-c-c border-1px border-solid border-#F89703 h40rpx text-#F89703 text-24rpx px-40rpx">{{info.roundname}}</view>
					<view class="w580rpx mt-12rpx">
						<zb-table v-if="info.games?.length" show-heade :columns="innerColums" :stripe="false" :fit="false" border :data="info.games" :cell-style="setCellStyleSmall"
							:cell-header-style="setCellHeaderStyle">
							<template #username1="{ row }">
								<view class="leading-24rpx h-full whitespace-normal f-c-c" :class="[row.result1>row.result2?'text-#F89703':'']">
									<text>{{row.username1}}</text>
								</view>
							</template>
							<template #username2="{ row }">
								<view class="leading-30rpx h-full whitespace-normal f-c-c" :class="[row.result2>row.result1?'text-#F89703':'']">
									<text>{{row.username2}}</text>
								</view>
							</template>
							<template #bifen="{ row }">
								{{`${row.result1}:${row.result2}`}}
							</template>
							<template #detail="{ row }">
								<uni-icons v-if="row.flag==0" type="arrow-right" size="30rpx" @click="goTtMatchDetail(row)"></uni-icons>
							</template>
						</zb-table>
					</view>
				</view>
			</template>
		</view>
		<view class="bg-#fff p20rpx f-c-c h200rpx" v-if="!groups.length&&isInit">
			暂无成绩信息
		</view>
	</view>
</template>
<script setup>
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	import calcCell from './calcCell.vue'
	import { goUserPageByUid, goMatchDetailByReq, goMatchDetailByGameid, goMatchDetailByTTReq } from '@/utils/goPage.js'
	import ttGameInfo from './ttGameInfo.vue'
	import { getAllResult, getAllHonors } from '@/api/event.js';
	import { watch } from 'vue';
	const { userInfo } = useStore('user');
	const isInit = ref(false)
	const groupId = ref('');
	const groups = ref([]);
	const honors = ref([]);
	const ttgames = ref([]);
	const ttdetailgames = ref([])
	const showTtDetail = ref(false)
	let allGroups = {};
	let allHonors = {};
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

	const innerColums = [{
			type: 'index',
			label: `序号`,
			width: uni.upx2px(70),
			align: 'center'
		}, {
			name: 'username1',
			type: 'slot',
			label: '选手1',
			width: uni.upx2px(180),
			align: 'center'
		},
		{
			name: 'username2',
			type: 'slot',
			label: '选手2',
			width: uni.upx2px(180),
			align: 'center'
		},
		{
			name: 'bifen',
			type: 'slot',
			label: `比分`,
			width: uni.upx2px(80),
			align: 'center'
		},
		{
			name: 'detail',
			type: 'slot',
			label: `详情`,
			width: uni.upx2px(60),
			align: 'center'
		}
	]

	init();

	watch(
		() => props.activeItemId,
		(val) => {
			groups.value = allGroups.groups[val];
			honors.value = allHonors[val].filter((v) => v.uid != 0);
			ttgames.value = allGroups.ttgames[val] ?? []
			ttdetailgames.value = allGroups.ttdetailgames[val] ?? []
		}
	);


	function init() {
		getAllResult({ eventid: props.eventDetail.eventid, itemid: props.activeItemId }).then((res) => {
			if (res.data) {
				allGroups = res.data;
				groups.value = res.data.groups[props.activeItemId] ?? [];
				ttgames.value = res.data.ttgames[props.activeItemId] ?? []
				ttdetailgames.value = res.data.ttdetailgames[props.activeItemId] ?? []
			}
		}).finally(() => {
			isInit.value = true
		});
		getAllHonors({ eventid: props.eventDetail.eventid }).then((res) => {
			allHonors = res.data;
			honors.value = res.data[props.activeItemId].filter((v) => v.uid != 0);
		});
	}

	function setShow(i) {
		let crtitem = groups.value[i][0]
		if (crtitem.showDetail) {
			crtitem.showDetail = false
		} else {
			groups.value.forEach(v => v[0].showDetail = false)
			crtitem.showDetail = true
		}
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
				let pxWidth = 40;
				return {
					name: 'col' + (index + 1),
					label: index + 1,
					align: 'center',
					emptyString: ' ',
					width: pxWidth
				};
			})
		);
		list.push(
			...[{
					name: 'score',
					label: `积分`,
					width: 50,
					align: 'center'
				},
				{
					name: 'calc',
					label: `计算`,
					type: 'slot',
					width: 60,
					align: 'center'
				},
				{
					name: 'rank',
					label: `名次`,
					width: 50,
					align: 'center'
				}
			]
		);
		return list;
	}

	function setTableData(item, i) {
		const { games, colors, uid, teamid } = item[0];
		const viewId = teamid && teamid !== '0' ? 'teamid' : 'uid';
		let list = item.map((v, index) => {
			let obj = item.reduce((all, crt, sindex) => {
				all[`col${sindex + 1}`] = sindex === index ? '' : games[`${item[index][viewId]}:${item[sindex][viewId]}`];
				all[`col${sindex + 1}-color`] = sindex === index ? '' : colors[`${item[index][viewId]}:${item[sindex][viewId]}`];
				if (viewId === 'uid') {
					all[`col${sindex + 1}-info`] = sindex === index ? '' : { groupid: item[index]['groupid'], uid1: item[index][viewId], uid2: item[sindex][viewId] };
				}
				return all;
			}, {});
			return {
				...v,
				...obj,
				newUsername: `${index + 1}${v.username}`
			};
		});
		return list;
	}

	function setCellHeaderStyle({ column, columnIndex }) {
		return {
			fontSize: '24rpx',
			paddingLeft: '0',
			paddingRight: '0'
		};
	}

	function setCellStyleSmall({ row, column, rowIndex, columnIndex }) {
		let obj = {
			height: '80rpx',
			fontSize: '24rpx',
			paddingLeft: '0',
			paddingRight: '0',
			background: '#F2F0F2',
		};
		return obj;
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = {
			height: '80rpx',
			fontSize: '24rpx',
			paddingLeft: '0',
			paddingRight: '0'
		};
		if (rowIndex + 1 === columnIndex) {
			obj.background = '#F2F1EE';
		}

		if (column.name.includes('col')) {
			obj.color = row[column.name + '-color'] === 1 ? '#E6326E' : '';
		}
		if (column.name === 'rank' && row.rank <= props.crtItem.qualNum) {
			obj.color = "#E6326E"
			obj.fontWeight = 600
		}
		return obj;
	}

	function cellClick(row, index, column, i) {
		if (column.name === 'newUsername') {
			goUserPageByUid(row.uid)
		}
		if (column.name.indexOf('col') >= 0 && row[column.name + '-info']) {
			goMatchDetailByReq(row[column.name + '-info'])
		}
	}

	function goTtMatchDetail(row) {
		const { uid1, uid2 } = row
		goMatchDetailByTTReq({ uid1, uid2, eventid: props.eventDetail.eventid, itemid: props.activeItemId })
	}
</script>

<style lang="scss" scoped>
	.score-btn {
		border: 2rpx solid #39b54a;
		color: #39b54a;
		padding: 8rpx 16rpx;
		font-size: 26rpx;
	}

	.honor-box {
		height: 60rpx;
		line-height: 60rpx;
		padding-left: 6rpx;
		color: #2c84ff;
		border: 1px solid #666;
		border-top: none;

		&.is-first {
			border-top: 1px solid #666;
		}
	}
</style>