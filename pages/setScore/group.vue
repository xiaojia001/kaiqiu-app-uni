<template>
	<view class="w-full box-border" :style="{ height: windowHeight + 'px', paddingTop: statusBarHeight + 'px' }">
		<swiper v-if="groups.length" class="w-full h-full">
			<swiper-item v-for="(item, i) in groups" :key="i">
				<zb-table show-heade :columns="setTableColumns(item, i)" :stripe="false" :fit="false" border :data="setTableData(item, i)" :cell-style="(...rest) => setCellStyle(...rest, item)"
					:cell-header-style="(...rest) => setCellHeaderStyle(...rest, item)" @cellClick="(...rest) => cellClick(...rest, i)">
					<template #calc="{ row }">
						<calcCell height="100%" :process="row.process || []" />
					</template>
				</zb-table>
			</swiper-item>
		</swiper>
		<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">
			<view class="bg-#fff p8px text-center text-12px">
				<view class="text-18px text-#333">第{{rowInfo.group}}组 {{`${rowInfo.username1}:${rowInfo.username2}`}} {{`${rowInfo.result}`}}</view>
				<view class="w-full h1px bg-#f2f2f2 my7px"></view>
				<view class="flex flex-wrap gap-wrap">
					<view class="w-80px mt-3px f-c-c h26px">比分</view>
					<view v-for="item in scorePreList" :key="item" :class="[item===rowInfo.activeBifen?'active':'']" class="border-1px border-solid border-#77B980 f-c-c w-80px mt-3px box-border h26px"
						@click="clickBifen(item)">{{item}}</view>
				</view>
				<view class="flex items-center  gap-wrap mt8px">
					<view class="w80px text-14px">弃权</view>
					<uni-data-checkbox multiple v-model="rowInfo.checkbox" :localdata="localdata" @change="changeVal"></uni-data-checkbox>
				</view>
				<view class="w-full h1px bg-#f2f2f2 my6px"></view>
				<view class="flex">
					<button size="mini" @click="popup.close()">关闭</button>
					<button size="mini" type="primary" @click="setScore">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { computed } from 'vue';
	import calcCell from '@/pages/event/components/calcCell.vue';
	import { getGroupGames, update_score } from '@/api/match.js';
	import { goGroupDetailPage } from '@/utils/goPage.js';
	let params = {};
	const popup = ref(null);
	const groups = ref([]);
	const scorePreList = ['0:0', '2:0', '2:1', '1:2', '0:2', '3:0', '3:1', '3:2', '2:3', '1:3', '0:3', '4:0', '4:1', '4:2', '4:3', '3:4', '2:4', '1:4', '0:4'];
	const rowInfo = ref({ checkbox: [] });
	const localdata = computed(() => {
		return [{ text: rowInfo.value.username1, value: 'username1' }, { text: rowInfo.value.username2, value: 'username2' }]
	})
	let windowHeight = 0;
	let windowWidth = 0;
	let statusBarHeight = ref(0);
	let { windowHeight: h, windowWidth: w, statusBarHeight: sh } = uni.getSystemInfoSync();
	// #ifdef APP
	windowHeight = Math.min(h, w);
	windowWidth = Math.max(h, w);
	// #endif
	// #ifdef H5
	windowHeight = h;
	windowWidth = w;
	// #endif
	statusBarHeight.value = sh;
	onShow(() => {
		// #ifdef APP
		plus.screen.lockOrientation('landscape');
		// #endif
		setTimeout(() => {
			refresh();
		}, 50);
	});
	// #ifdef APP
	onUnload(() => {
		plus.screen.lockOrientation('portrait');
	});
	// #endif

	onLoad(({ itemid, eventid }) => {
		params = { itemid, eventid };
	});

	function refresh() {
		getGroupGames(params).then((res) => {
			groups.value = res.data ?? [];
		});
	}

	function setTableColumns(item, i) {
		let list = [];
		list.push({
			name: 'username',
			label: `第${i + 1}组`,
			width: 160,
			// fixed: 'left',
			align: 'center'
		});
		let pxWidth = (windowWidth - 340) / (item.names.length || 1);
		list.push(
			...item.names.map((v, index) => {
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
					name: 'sumScore',
					label: `积分`,
					width: 60,
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
					width: 60,
					align: 'center'
				}
			]
		);
		return list;
	}

	function setTableData(item, i) {
		let { names, scores, groupid } = item;
		let list = names.map((v, index) => {
			let obj = names.reduce((all, crt, sindex) => {
				let str = sindex === index ? '' : scores[`${names[index]['uid']}:${names[sindex]['uid']}`];
				all[`col${sindex + 1}`] = str
				all[`col${sindex + 1}-color`] = getColor(str)
				all[`col${sindex + 1}-info`] = sindex === index ? '' : {
					uid1: names[index]['uid'],
					uid2: names[sindex]['uid'],
					username1: names[index]['username'],
					username2: names[sindex]['username'],
					groupid,
					...params
				};
				return all;
			}, {});
			return {
				...v,
				...obj
			};
		});
		return list;
	}

	function getColor(str) {
		if (!str) return 0
		let arr = str.split(':')
		if (arr.length !== 2) return 0
		if (arr[0] == 'wo') return 0
		if (arr[1] == 'wo') return 1
		if (arr[0] > arr[1]) return 1
		return 0
	}

	function setCellHeaderStyle({ column, columnIndex }, { names }) {
		return {
			fontSize: '12px',
			paddingLeft: '0',
			paddingRight: '0'
			// height: (100 / (names.length || 1)) + 'vh'
		};
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }, { names }) {
		let obj = {
			fontSize: '12px',
			paddingLeft: '0',
			paddingRight: '0',
			height: (windowHeight - 40 - statusBarHeight.value) / (names.length || 1) + 'px',
			lineHeight: (windowHeight - 40 - statusBarHeight.value) / (names.length || 1) + 'px'
		};
		if (rowIndex + 1 === columnIndex) {
			obj.background = '#F2F1EE';
		}

		if (column.name.includes('col')) {
			obj.color = row[column.name + '-color'] === 1 ? '#E6326E' : '';
		}
		return obj;
	}

	function cellClick(row, index, column, i) {
		if (column.name.indexOf('col') >= 0 && row[column.name + '-info']) {
			rowInfo.value = { ...row[column.name + '-info'], result: row[column.name], show: true, group: i + 1, checkbox: [], activeBifen: '' }
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
		const { activeBifen, groupid, uid1, uid2, eventid, itemid } = rowInfo.value
		if (!activeBifen) {
			return uni.showToast({ title: '请设置比分', icon: 'none' })
		}
		update_score({ groupid, score: activeBifen, uid1, uid2, eventid, itemid }).then(res => {
			popup.value.close()
			refresh()
		})
	}
</script>

<style lang="scss" scoped>
	.gap-wrap {
		gap: 4px;
	}

	.active {
		background: #77B980;
		color: #fff;
	}
</style>