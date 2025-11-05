<template>
	<view class="relative">
		<view class="flex items-center justify-between bg-#fff h80rpx px20rpx relative">
			<view class=" max-w-180rpx  text-30rpx text-#77B980 f-c-c truncate" @click="goSelectCity">
				<uni-icons type="location" size="28rpx" color="#77b980"></uni-icons>
				{{crtCity.name}}
			</view>
			<view class="f-c-c" @click="showMore=!showMore">
				<text class="mr6rpx" :class="[showSelcet?'text-#F89703':'']">筛选</text>
				<uni-icons type="settings" size="28rpx" :color="showSelcet?'#F89703':'#333'"></uni-icons>
			</view>
		</view>
		<view v-if="showMore" class="bg-#fff setting-box px20rpx pb10rpx box-border absolute z3000">
			<view v-for="(tag,i) in allTag" class="flex mb-12px">
				<view class="w102rpx">{{tag.name}}</view>
				<view class="flex-1 flex flex-wrap flex-gap-18rpx">
					<view class="f-c-c w182rpx text-24rpx item-box" :class="[index===selctIndexs[i]?'active':'']" v-for="(item,index) in tag.list" :key="`${item}-${i}`" @click="setClickItem(i,index)">
						{{item}}
					</view>
				</view>
			</view>
			<view class="flex box-border pr20rpx mb4rpx">
				<button class="flex-1 ml-20rpx" size="mini" @click="selctIndexs = [0,0,0,0]">重置</button>
				<button class="flex-1 ml-40rpx" size="mini" type="primary" @click="refresh">确定</button>
			</view>
		</view>
		<view class="sticky-top">
			<me-tabs :height="80" v-model="tabIndex" :tabs="tabs" @change="refresh()"></me-tabs>
		</view>
		<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback">
			<zb-table show-heade :columns="columns" stripe :fit="false" border :data="list" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
				<template #birthyear="{row}">
					<text>{{row.birthyear==0?'':row.birthyear}}</text>
				</template>
			</zb-table>
		</mescroll-body>
	</view>
</template>

<script setup>
	import { getPageUserRankList } from '@/api/user.js'
	import { goUserPageByUid } from '@/utils/goPage.js'
	import useMescroll from "@/uni_modules/mescroll-uni/hooks/useMescroll.js";
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom) // 调用mescroll的hook
	const { selectCity } = useStore('user');
	const crtCity = ref({ id: selectCity.value.id, name: selectCity.value.name })
	const list = ref([]) // 数据列表
	const tabIndex = ref(0)
	const showMore = ref(false)
	let isInit = false
	const tabs = [{ name: '全城' }, { name: '全省' }, { name: '全球' }]
	let allTag = [
		{ name: '年龄', list: ['全部', '10岁以下', '11~16岁', '17~29岁', '30~39岁', '40~49岁', '50~59岁', '60~69岁', '70~79岁', '80岁以上'] },
		{ name: '性别', list: ['全部', '男', '女'] },
		{ name: '背景', list: ['全部', '业余', '专业'] },
		{ name: '积分', list: ['全部', 'U1500', 'U1700', 'U1900', 'U2100', 'U2300', 'U2500'] }
	]
	const selctIndexs = ref([0, 0, 0, 0])
	const showSelcet = computed(() => {
		return selctIndexs.value.some(v => v !== 0)
	})
	const slectIndexStr = computed(() => {
		let [a, b, c, d] = selctIndexs.value
		let first = (tabIndex.value + 1) * 10 + (a + 1) + ''
		return first + (b + 1) + (c + 1) + (d + 1)
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
			name: 'minscore',
			label: '最低积分',
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
	]

	function setClickItem(i, index) {
		selctIndexs.value[i] = index
	}

	const upCallback = (mescroll) => {
		isInit = true
		getPageUserRankList({
			city: "-" + (tabIndex.value + 1),
			now: crtCity.value.name,
			sort: "2",
			page: mescroll.num,
			index: slectIndexStr.value
		}).then(res => {
			const rows = res.data?.data || [] // 当前页数据
			if (mescroll.num == 1) list.value = [];
			list.value = list.value.concat(rows); //追加新数据
			mescroll.endSuccess(rows.length); // 请求成功, 结束加载
			if (mescroll.num == 1) {
				mescroll.triggerUpScroll()
			}
		}).catch(() => {
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}

	function refresh() {
		showMore.value = false
		list.value = [] // 先置空列表,显示加载进度
		getMescroll().scrollTo(0, 0)
		getMescroll().resetUpScroll(true) // 再刷新列表数据
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

	function cellClick(row, index, column) {
		if (row.uid) {
			goUserPageByUid(row.uid)
		}
	}
</script>

<style lang="scss" scoped>
	.sticky-top {
		z-index: 990;
		position: sticky;
		top: var(--window-top);
		background-color: #fff;
	}

	.setting-box {
		// z-index: 999;
		width: 100%;
		background: #fff;
		// top: 100%;
		// left: 0;
		min-height: 300rpx;

		.item-box {
			height: 40rpx;
			border-radius: 20rpx;
			border: 1rpx solid #ccc;

			&.active {
				border: 1rpx solid #77b980;
				background: #77b980;
				color: #fff;
			}
		}
	}
</style>