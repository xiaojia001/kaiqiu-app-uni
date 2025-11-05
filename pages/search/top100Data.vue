<template>
	<view>
		<view class="sticky-top">
			<view class="flex items-center justify-center bg-#fff h80rpx" @click="goSelectCity">
				<view class="absolute max-w-180rpx left-20rpx text-30rpx text-#77B980 f-c-c truncate">
					<uni-icons type="location" size="28rpx" color="#77b980"></uni-icons>
					{{crtCity.name}}
				</view>
				<view class="text-26rpx text-#333">{{typeName}}</view>
			</view>
			<me-tabs :height="80" v-model="tabIndex" :tabs="tabs" @change="refresh()"></me-tabs>
		</view>
		<zb-table :key="tableKey" show-heade :columns="columns" stripe :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
		</zb-table>
	</view>
</template>

<script setup>
	import { getTop100Data } from '@/api/top.js'
	import { goUserPageByUid } from '@/utils/goPage.js'
	const { selectCity } = useStore('user');
	const crtCity = ref({ id: selectCity.value.id, name: selectCity.value.name })
	const tid = ref('')
	const typeName = ref('')
	const tabIndex = ref(0)
	const list = ref([])
	const tabs = [{ name: '全城' }, { name: '全省' }, { name: '全球' }]
	let columns = ref([{
			type: 'index',
			label: '序号',
			width: uni.upx2px(120),
			align: 'center'
		},
		{
			type: 'slot',
			name: 'realname',
			label: '姓名',
			width: uni.upx2px(240),
			align: 'center'
		},
		{
			name: 'score',
			label: '当前积分',
			align: 'center',
			width: uni.upx2px(140),
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
		}
	])
	const tableKey = ref(0)
	onLoad(({ tid: typeId, name }) => {
		tid.value = +typeId
		// if (tid.value === 6) {
		// 	columns.value[2].label = '等级'
		// }
		typeName.value = name
		refresh(true)
	})

	function refresh(isFirst) {
		getTop100Data({ city: crtCity.value.name, tid: tid.value, tabIndex: tabIndex.value }).then(res => {
			list.value = res.data?.list ?? []
			// typeName.value = res.data?.title
			isFirst && columns.value.push({
				name: 'special',
				label: res.data?.th,
				align: 'center',
				width: uni.upx2px(120),
			})
		})
	}

	function goSelectCity() {
		uni.$off('refreshCity')
		uni.$once('refreshCity', (item) => {
			crtCity.value = item
			refresh()
		})
		const { id, name } = crtCity.value
		uni.navigateTo({
			url: `/pages/main/selectCityPage?id=${id}&name=${name}`
		})
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
		return obj;
	}


	function cellClick(row, index, column) {
		if (row.uid) {
			goUserPageByUid(row.uid)
		}
	}
</script>

<style lang="scss" scoped>
	.sticky-top {
		// padding-top: var(--status-bar-height);
		z-index: 990;
		position: sticky;
		top: var(--window-top);
		background-color: #fff;
	}
</style>