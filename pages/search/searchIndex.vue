<template>
	<view>
		<view class="h100rpx px30rpx bg-#fff flex items-center relative">
			<uni-easyinput prefixIcon="search" v-model="searchText" :placeholder="placeholder" @confirm="refresh" @focus="inputFocus" @blur="inputBlur"></uni-easyinput>
			<template v-if="tabIndex==0">
				<view class="f-c-c ml26rpx text-28rpx" @click="showMore=!showMore">
					<text class="mr6rpx" :class="[showSelcet?'text-#F89703':'']">筛选</text>
					<uni-icons type="settings" size="28rpx" :color="showSelcet?'#F89703':'#333'"></uni-icons>
				</view>
			</template>
			<text v-else class="ml26rpx text-28rpx text-#F89703" @click="refresh">搜索</text>
			<hisPlayerList v-show="showHis" @searchHis="searchHis" />
			<searchMoreMatchBox v-show="showMore" :searchText="searchText" @searchMore="searchMore" />
		</view>
		<view class="sticky-top">
			<me-tabs :height="80" v-model="tabIndex" :tabs="tabs" @change="tabChange"></me-tabs>
		</view>

		<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback" :down="{auto:false}" :up="{auto:false,empty:{use:false}}">
			<matchList v-if="tabIndex==0" :list="list"></matchList>
			<gymList v-if="tabIndex==1" :list="list"></gymList>
			<playerList v-if="tabIndex==2" :list="list"></playerList>
		</mescroll-body>
	</view>
</template>

<script setup>
	import { computed } from 'vue';
	import meTabs from '@/components/me-tabs/me-tabs.vue'
	import matchList from './components/matchList.vue'
	import playerList from './components/playerList.vue'
	import gymList from './components/gymList.vue'
	import hisPlayerList from './components/hisPlayerList.vue'
	import searchMoreMatchBox from './components/searchMoreMatchBox.vue'
	import { getArenaListPageByKey } from '@/api/arena.js'
	import { getMatchListPageByKey } from '@/api/match.js'
	import { getUserListPageByKey } from '@/api/user.js'
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
	import useMescroll from '@/uni_modules/mescroll-uni/hooks/useMescroll.js';
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom); // 调用mescroll的hook
	const { setSearchPlayerHis } = useStore('user')
	const [lng, lat] = uni.getStorageSync('userLocation' ?? [])
	const tabIndex = ref(0)
	const searchText = ref('')
	const showHis = ref(false)
	const showMore = ref(false)
	const moreMatchSearchObj = ref({})
	const showSelcet = computed(() => {
		return Object.keys(moreMatchSearchObj.value).length > 0
	})
	const tabs = [{ name: '比赛', tip: '比赛名称', func: getMatchListPageByKey }, { name: '球馆', tip: '球馆名称', func: getArenaListPageByKey }, { name: '积分', tip: '用户姓名或昵称', func: getUserListPageByKey }]
	const placeholder = computed(() => {
		return `请输入${tabs[tabIndex.value].tip}`
	})
	let isInit = false
	const list = ref([])

	onLoad(({ player }) => {
		if (player) {
			tabIndex.value = 2
			searchText.value = player
			setTimeout(() => {
				refresh()
			}, 500)
		}
	})

	function tabChange(val) {
		refresh()
	}

	const upCallback = async (mescroll) => {
		let obj = { page: mescroll.num, key: searchText.value }
		if (tabIndex.value < 2) {
			if (!lng || !lat) {
				return mescroll.endErr();
			}
			obj = { ...obj, lng, lat }
		}
		let func = tabs[tabIndex.value].func
		if (tabIndex.value === 0) {
			if (Object.keys(moreMatchSearchObj.value).length) {
				obj = { lng, lat, search: 1, eventTitle: searchText.value, page: mescroll.num, ...moreMatchSearchObj.value }
			}
		}

		let flag = tabIndex.value === 0 && !Object.keys(moreMatchSearchObj.value).length && !searchText.value
		// console.log(tabIndex.value === 0, !Object.keys(moreMatchSearchObj.value).length, !searchText.value);

		if ((!searchText.value && tabIndex.value > 0) || flag) {
			list.value = [];
			return mescroll.endSuccess(0)
		}
		if (tabIndex.value === 2) {
			setSearchPlayerHis(searchText.value)
		}
		func(obj)
			.then((res) => {
				let rows = res.data?.data ?? []
				if (mescroll.num == 1) list.value = []; //如果是第一页需手动制空列表
				list.value = list.value.concat(rows); //追加新数据
				mescroll.endSuccess(rows.length); // 请求成功, 结束加载
			})
			.catch(() => {
				mescroll.endErr(); // 请求失败, 结束加载
			});
	};

	function inputFocus() {
		if (tabIndex.value === 2) {
			showHis.value = true
		}
	}

	function inputBlur() {
		setTimeout(() => {
			showHis.value = false
		}, 100)
	}

	function searchHis(val) {
		searchText.value = val
		refresh()
	}

	function searchMore(obj) {
		moreMatchSearchObj.value = obj
		showMore.value = false
		refresh()
	}

	function refresh() {
		getMescroll().scrollTo(0, 0)
		isInit = true;
		list.value = []; // 先置空列表,显示加载进度
		getMescroll().resetUpScroll(true); // 再刷新列表数据
	}
</script>

<style lang="scss" scoped>
	.sticky-top {
		// height: 80rpx;
		// padding-top: var(--status-bar-height);
		z-index: 40;
		position: sticky;
		// background-color: #fff;
		/* #ifdef H5 */
		top: var(--window-top);
		/* #endif */
		/* #ifdef APP */
		top: 0;
		/* #endif */

	}
</style>