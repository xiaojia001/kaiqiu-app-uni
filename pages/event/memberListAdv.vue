<template>
	<view>
		<view class="bg-#FFFEFF text-#39B54A px20rpx pb20rpx">{{ baseInfo.event_name }}</view>
		<view class="bg-#FFFEFF text-#666 px20rpx flex items-center h80rpx mt2px justify-between">
			<text>{{ baseInfo.match_name }}</text>
			<view class="flex items-center gap-10rpx">
				<!-- 排序选择器 -->
				<picker mode="selector" :range="sortOptions" range-key="label" @change="onSortChange">
					<view class="flex items-center text-24rpx text-#666">
						<text>{{ currentSort.label }}</text>
						<uni-icons type="bottom" size="12"></uni-icons>
					</view>
				</picker>
				<!-- 刷新按钮 -->
				<view v-if="!polling" class="f-c-c" @click="startPolling">
					<uni-icons type="refresh" size="20" color="#39B54A"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 轮询进度显示 -->
		<view v-if="polling" class="bg-#F89703 text-#fff px20rpx flex items-center h80rpx justify-between">
			<view class="flex items-center">
				<uni-icons type="search" size="16" color="#fff"></uni-icons>
				<text class="ml10rpx text-24rpx">正在更新: {{ pollingInfo.currentName }} ({{ pollingInfo.current }}/{{ pollingInfo.total }})</text>
			</view>
			<view class="text-24rpx">{{ pollingInfo.percent }}%</view>
		</view>
		
		<!-- 积分统计栏 -->
		<view v-if="!polling && scoreLoaded" class="flex text-24rpx bg-#FFFEFF text-#39B54A">
			<view class="flex-1 flex-col f-c-c py10rpx border-r border-#E5E5E5">
				<view>当前积分</view>
			</view>
			<view class="flex-1 flex-col f-c-c py10rpx border-r border-#E5E5E5">
				<view>年度积分</view>
			</view>
			<view class="flex-1 flex-col f-c-c py10rpx">
				<view>最高积分</view>
			</view>
		</view>
		
		<zb-table show-heade :columns="columns" stripe :fit="false" border :data="cptList" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
			<template #name="{row}">
				<text class="text-#E6326E" v-if="row.role==5">*</text>
				<text>{{row.name}}</text>
			</template>
			<template #sex="{row}">
				<text>{{getSex(row)}}</text>
			</template>
			<template #currentScore="{row}">
				<text :class="row.currentScore !== row.score ? 'text-#39B54A' : ''">{{ row.currentScore ?? '-' }}</text>
			</template>
			<template #yearScore="{row}">
				<text :class="row.yearScore !== row.score ? 'text-#F89703' : ''">{{ row.yearScore ?? '-' }}</text>
			</template>
			<template #maxScore="{row}">
				<text>{{ row.maxScore ?? '-' }}</text>
			</template>
		</zb-table>
		
		<!-- 空状态 -->
		<view v-if="!polling && cptList.length === 0" class="f-c-c flex-col py100rpx text-#999 text-28rpx">
			<uni-icons type="person" size="60" color="#E5E5E5"></uni-icons>
			<text class="mt20rpx">暂无报名人员</text>
		</view>
	</view>
</template>

<script setup>
	import zbTable from '@/uni_modules/zb-table/components/zb-table/zb-table.vue';
	import { get_member_detail } from '@/api/event.js';
	import { getAdvProfile } from '@/api/user.js';
	import { goUserPageByUid, getPageParams } from '@/utils/goPage.js'
	
	const baseInfo = ref({});
	const list = ref([]);
	const polling = ref(false);
	const scoreLoaded = ref(false);
	const pollingInfo = ref({ current: 0, total: 0, currentName: '', percent: 0 });
	
	// 排序选项
	const sortOptions = [
		{ key: 'default', label: '默认排序' },
		{ key: 'currentScore', label: '当前积分↓' },
		{ key: 'yearScore', label: '年度积分↓' },
		{ key: 'maxScore', label: '最高积分↓' },
		{ key: 'registerScore', label: '报名积分↓' }
	];
	const currentSort = ref(sortOptions[0]);
	
	// 积分统计
	const scoreStats = computed(() => {
		const validList = list.value.filter(v => v.currentScore);
		if (validList.length === 0) return null;
		return {
			currentSum: validList.reduce((sum, v) => sum + (parseInt(v.currentScore) || 0), 0),
			yearSum: validList.reduce((sum, v) => sum + (parseInt(v.yearScore) || 0), 0),
			maxSum: validList.reduce((sum, v) => sum + (parseInt(v.maxScore) || 0), 0)
		};
	});
	
	const cptList = computed(() => {
		let result = [...list.value];
		
		// 排序
		switch (currentSort.value.key) {
			case 'currentScore':
				result.sort((a, b) => (parseInt(b.currentScore) || 0) - (parseInt(a.currentScore) || 0));
				break;
			case 'yearScore':
				result.sort((a, b) => (parseInt(b.yearScore) || 0) - (parseInt(a.yearScore) || 0));
				break;
			case 'maxScore':
				result.sort((a, b) => (parseInt(b.maxScore) || 0) - (parseInt(a.maxScore) || 0));
				break;
			case 'registerScore':
				result.sort((a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0));
				break;
			default:
				result.sort((a, b) => a.number - b.number);
		}
		
		return result;
	});
	
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
			width: 90,
			fixed: 'left',
			align: 'center'
		},
		{
			type: 'slot',
			name: 'currentScore',
			label: '当前积分',
			align: 'center',
			width: 85
		},
		{
			type: 'slot',
			name: 'yearScore',
			label: '年度积分',
			align: 'center',
			width: 85
		},
		{
			type: 'slot',
			name: 'maxScore',
			label: '最高积分',
			align: 'center',
			width: 85
		},
		{
			name: 'newscore',
			label: '报名积分',
			align: 'center',
			width: 90
		},
		{
			name: 'paid',
			label: '确认',
			align: 'center',
			filters: {
				0: '交费中',
				1: '已交付',
				2: '已报名'
			},
			width: 60
		},
		{
			type: 'slot',
			name: 'sex',
			label: '性别',
			align: 'center',
			width: 56
		}
	];

	onLoad(() => {
		const { matchStr } = getPageParams()
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
					newscore: v.score == 0 ? '无积分' : v.score,
					currentScore: null,
					yearScore: null,
					maxScore: null
				};
			});
		});
	}
	
	// 开始轮询获取分数
	async function startPolling() {
		if (polling.value) return;
		
		polling.value = true;
		scoreLoaded.value = false;
		const members = list.value;
		const total = members.length;
		
		pollingInfo.value = {
			current: 0,
			total,
			currentName: '',
			percent: 0
		};
		
		// 重置分数
		list.value = members.map(v => ({
			...v,
			currentScore: null,
			yearScore: null,
			maxScore: null
		}));
		
		for (let i = 0; i < members.length; i++) {
			const member = members[i];
			
			if (!member.uid) {
				continue;
			}
			
			pollingInfo.value = {
				current: i + 1,
				total,
				currentName: member.name,
				percent: Math.round(((i + 1) / total) * 100)
			};
			
			try {
				const res = await getAdvProfile(member.uid);
				const profile = res.data || {};
				
				// 更新该成员的分数
				const index = list.value.findIndex(v => v.uid === member.uid);
				if (index !== -1) {
					list.value[index] = {
						...list.value[index],
						currentScore: profile.score ?? null,
						yearScore: profile.maxScoreTheYear ?? null,
						maxScore: profile.maxscore ?? null
					};
				}
			} catch (e) {
				console.error(`获取用户 ${member.name} 分数失败`, e);
			}
			
			// 延迟300ms再请求下一个，避免请求过快
			if (i < members.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 300));
			}
		}
		
		polling.value = false;
		scoreLoaded.value = true;
		uni.showToast({
			title: '更新完成',
			icon: 'success'
		});
	}
	
	function onSortChange(e) {
		currentSort.value = sortOptions[e.detail.value];
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

	function getSex({ sex }) {
		let obj = { 1: '男', 2: '女' }
		if (sex > 10) {
			let [one, two] = sex.split('')
			return obj[one] + '/' + obj[two]
		}
		return obj[sex]
	}
</script>

<style lang="scss" scoped>
	.gap-10rpx {
		gap: 10rpx;
	}
	.border-r {
		border-right: 1px solid #E5E5E5;
	}
</style>
