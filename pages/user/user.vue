<template>
	<mescroll-body @init="mescrollInit" top="0" @down="downCallback" @up="upCallback" :down="{ bgColor: '#248DFF' }" :up="{ toTop: { src: '' } }">
		<view class="bg-#E7E6E8">
			<view class="f-c-c flex-col pt40rpx bg-#248DFF text-#fff">
				<view class="w192rpx h192rpx rounded-91rpx bg-white">
					<image class="w-full h-full rounded-91rpx" :src="userInfo?.realpic" mode=""></image>
				</view>
				<view class="mt14px flex items-center">
					<text class="text-40rpx font-500 mr10rpx">{{ userInfo?.realname }}</text>
					<text class="text-24rpx">{{ userInfo?.username }}</text>
					<uni-icons v-if="userInfo?.star" class="ml-4rpx" type="star-filled" color="#E49B37"></uni-icons>
					<uni-fav v-if="notMe" class="ml-10rpx" circle :checked="hasFollowed" @click="goFollow" :contentText="{ contentDefault: '关注', contentFav: '已关注' }" />
				</view>
				<view class="mt6px">
					<text class="text-40rpx font-500 mr10rpx">{{userInfo?.scope||'全国'}}排名</text>
					<text class="text-24rpx">{{ userInfo?.rank }}</text>
				</view>
				<view class="flex text-24rpx mt60rpx w-full">
					<view class="flex-1 flex-col f-c-c">
						<view>当前积分</view>
						<view class="text-48rpx">{{ userInfo?.score ?? '-' }}</view>
					</view>
					<view class="flex-1 flex-col f-c-c boder-l-r">
						<view>年度积分</view>
						<view class="text-48rpx">{{ userInfo?.maxScoreTheYear ?? '-' }}</view>
					</view>
					<view class="flex-1 flex-col f-c-c">
						<view>最高积分</view>
						<view class="text-48rpx">{{ userInfo?.maxscore ?? '-' }}</view>
					</view>
				</view>
				<view class="f-c-c text-22rpx mt20rpx mb4rpx">数据更新时间{{ userInfo?.lastUpdate ?? '-' }}</view>
			</view>
			<view v-if="scoreChangeData.length" class="p20rpx bg-#FFFEFF text-30rpx text-#8F8E96">
				<view class="text-26rpx text-center -mb30px">最近40场比赛积分趋势</view>
				<e-chart ref="echartRef" @ready="setChartData" :height="460" />
			</view>
			<view v-if="showTags.length" class="mt40rpx p40rpx bg-#FFFEFF text-30rpx text-#8F8E96x">
				<view class="text-32rpx text-#333 text-center mb-22px">收到最多评价</view>
				<view class="flex flex-wrap f-c-c e-tag-wrap">
					<view v-for="item in showTags" :key="item.ename" class="f-c-c e-tag" :class="[`e-tag-${item.etype}`,item.selected==1?'selected':'']">
						{{item.ename}} ({{item.count}}) <uni-icons class="ml-10rpx" v-if="item.selected==1" color="#fff" type="checkmarkempty" />
					</view>
				</view>
			</view>
			<view v-if="userInfo.description" class="mt40rpx p20rpx bg-#FFFEFF text-30rpx main-inof-box text-#8F8E96">
				<rich-text :nodes="description"></rich-text>
			</view>
			<view class="mt40rpx p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view class="flex justify-between">
					<text>性别年龄: {{ userInfo?.sex }}{{ userInfo?.age ? ` ${userInfo?.age}岁` : '' }}</text>
					<text>所在: {{ userInfo?.resideprovince }}</text>
				</view>
				<view class="mt-8px">专业背景: {{ userInfo?.bg }}</view>
				<view class="mt-8px">底板型号: {{ userInfo?.qiupai }} {{ userInfo?.qiupaitype }}</view>
				<view class="mt-8px">正手套胶: {{ userInfo?.zhengshou }} {{ userInfo?.zhengshoutype }}</view>
				<view class="mt-8px">反手套胶: {{ userInfo?.fanshou }} {{ userInfo?.fanshoutype }}</view>
			</view>
			<view class="mt40rpx p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.Top3OfBeatUsernameScore">
					<view class="info-title">击败分数最高前三名:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in userInfo.Top3OfBeatUsernameScore" :key="i" @click="goListUser('Top3OfBeat', i)">{{ item }}</view>
				</view>
			</view>
			<view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.TopPlayerUsernameScore">
					<view class="info-title">交手分数最高前三名:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in userInfo.TopPlayerUsernameScore" :key="i" @click="goListUser('TopPlayer', i)">{{ item }}</view>
				</view>
			</view>
			<view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.Top3ManOfBeatUsernameScore">
					<view class="info-title">击败男子最高前三名:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in userInfo.Top3ManOfBeatUsernameScore" :key="i" @click="goListUser('Top3ManOfBeat', i)">{{ item }}</view>
				</view>
			</view>
			<view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.Top3WomanOfBeatUsernameScore">
					<view class="info-title">击败女子最高前三名:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in userInfo.Top3WomanOfBeatUsernameScore" :key="i" @click="goListUser('Top3WomanOfBeat', i)">{{ item }}</view>
				</view>
			</view>
			<view v-if="userInfo.kuzhu" class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view>
					<view class="info-title">苦主:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in kuzhu" :key="i">
						<text @click="goUserPageByUid(item.uid)">{{ item.description1 }}</text>
						<text @click="goMatchInfo('KuZhu', i)">{{ item.description2 }}</text>
					</view>
				</view>
			</view>
			<view v-if="userInfo.fuxing" class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view>
					<view class="info-title">福星:</view>
					<view class="pl50rpx mt6rpx" v-for="(item, i) in fuxing" :key="i">
						<text @click="goUserPageByUid(item.uid)">{{ item.description1 }}</text>
						<text @click="goMatchInfo('FuXing', i)">{{ item.description2 }}</text>
					</view>
				</view>
			</view>
			<view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="oftenPlayer.length">
					<view class="info-title">经常交手:</view>
					<view class="pl30rpx mt6rpx">
						<view class="ml-20rpx" v-for="(item, i) in oftenPlayer" :key="i">{{ item }}</view>
					</view>
				</view>
			</view>
			<!-- <view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="oftenPlayer.length">
					<view class="info-title">maxConsWin:</view>
					<view class="pl30rpx mt6rpx">
						<view class="ml-20rpx" @click="goMatchDetailByGameid(userInfo.maxConsWinLastGameId)">{{ userInfo.maxConsWin??0 }}</view>
					</view>
				</view>
			</view> -->
			<view class="p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.latest_headtohead_gameid">
					<view @click="goMatchDetailByGameid(userInfo.latest_headtohead_gameid)" class="info-title">
						我与{{ userInfo.realname }}的交战历史
						<text class="text-#248DFF">详情</text>
					</view>
				</view>
			</view>
			<view v-if="userInfo.path?.length" class="mt-4px p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
					<view class="info-title">
						{{userInfo.realname}}<text class="font-600 text-#248DFF mx4rpx">{{userInfo.pathNum}}阶</text>挑战世界冠军<text class="font-600 text-#248DFF mx4rpx">{{userInfo.champion}}</text>成功
					</view>
					<view class="mt6rpx">
						<view v-for="(item,i) in userInfo.path" :key="i" class="flex justify-between items-center mt14px">
							<view class="w140rpx h140rpx rounded-70rpx bg-white" @click="goUserPageByUid(item.uid1)">
								<image class="w-full h-full rounded-70rpx" :src="item.face1" mode=""></image>
							</view>
							<view class="flex-1 flex flex-col f-c-c text-#999 text-24rpx">
								<view class="text-#666 text-28rpx">{{item.realname1}} <text>{{item.result1}}:{{item.result2}}</text> {{item.realname2}}</view>
								<view>{{item.title}}</view>
								<view>{{item.dateline}} {{item.city}}</view>
							</view>
							<view class="w140rpx h140rpx rounded-70rpx bg-white" @click="goUserPageByUid(item.uid2)">
								<image class="w-full h-full rounded-70rpx" :src="item.face2" mode=""></image>
							</view>
						</view>
					</view>
			</view>
			<view class="mt-4px p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view v-if="userInfo.allCities">
					<view class="info-title">曾参加比赛城市:</view>
					<view class="pl30rpx mt6rpx flex flex-wrap city-gap">
						<text v-for="(item, i) in userInfo.allCities" :key="i">{{ item }}</text>
					</view>
				</view>
			</view>
			<view v-if="userInfo.honors?.length" class="mt-4px p20rpx bg-#FFFEFF text-28rpx text-#8F8E96">
				<view class="info-title">近期荣耀:</view>
				<view class="mt12rpx flex items-center" v-for="(item, i) in userInfo.honors" :key="i" @click="goEventMainPage(item)">
					<view class="w40rpx h40rpx">
						<image class="w-full h-full" :src="item.honor" mode=""></image>
					</view>
					<text class="text-22rpx ml6rpx">{{ item.subject }}</text>
				</view>
			</view>
			<view class="mt-4px bg-#FFFEFF pt20rpx text-28rpx text-#8F8E96">
				<view class="info-title mx20rpx">近期战绩:</view>
				<zb-table show-heade :columns="columns" stripe :fit="false" border :data="games" :cell-style="setCellStyle" :cell-header-style="setCellHeaderStyle" @cellClick="cellClick">
					<template #username1="{ row }">
						<template v-if="row.flag === '0'">{{ row.username1 }}</template>
						<template v-if="row.flag === '1'">
							<view class="f-c-c flex-col h80rpx leading-[1.2]">
								<text>{{ row.username1 }}</text>
								<text>{{ row.username11 }}</text>
							</view>
						</template>
					</template>
					<template #username2="{ row }">
						<template v-if="row.flag === '0'">{{ row.username2 }}</template>
						<template v-if="row.flag === '1'">
							<view class="f-c-c flex-col h80rpx leading-[1.2]">
								<text>{{ row.username2 }}</text>
								<text>{{ row.username22 }}</text>
							</view>
						</template>
					</template>
				</zb-table>
			</view>
		</view>
	</mescroll-body>
</template>

<script setup>
	import { computed, shallowRef } from 'vue';
	import { getAdvProfile, goFolloweeByUid, goCancelFolloweeByUid, getPageGamesByUid, getUserTags, getUserScores } from '@/api/user.js';
	import { goUserPageByUid, goEventMainPage, goMatchDetailByGameid } from '@/utils/goPage.js';
	import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useMescroll from '@/uni_modules/mescroll-uni/hooks/useMescroll.js';
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom); // 调用mescroll的hook
	const userInfo = ref({
		Top3ManOfBeatUsernameScore: [],
		Top3WomanOfBeatUsernameScore: [],
		TopPlayerUsernameScore: [],
		allCities: [],
		description:'',
		Top3OfBeatUsernameScore: [],
		honors: [],
		games: {},
		hasFollowed: -1,
		OftenPlayer: ''
	});
	const echartRef = ref(null)
	const scoreChangeData = ref([])
	let echartInit = false
	const { userInfo: meInfo } = useStore('user');
	const hasFollowed = computed(() => {
		return Number(userInfo.value.hasFollowed) === 1;
	});
	const oftenPlayer = computed(() => {
		return (userInfo.value.OftenPlayer ?? '').split(',').filter((v) => !!v);
	});
	const showTags = ref([])
	const games = ref([]);
	const notMe = computed(() => {
		return !(Number(userInfo.value.hasFollowed) === -1);
	});
	const columns = shallowRef([])
	const crtUid = ref('');
	onLoad(({ uid }) => {
		crtUid.value = uid || meInfo.value.user_id;
		columns.value = [{
				type: 'index',
				name: 'index',
				label: '序号',
				align: 'center',
				width: uni.upx2px(90)
			},
			{
				type: 'slot',
				name: 'username1',
				label: '姓名',
				align: 'center',
				width: uni.upx2px(150)
			},
			{
				type: 'slot',
				name: 'username2',
				label: '姓名',
				align: 'center',
				width: uni.upx2px(150)
			},
			{
				name: 'bifen',
				label: '比分',
				align: 'center',
				width: uni.upx2px(90)
			},
			{
				name: 'score1',
				label: '变化',
				align: 'center',
				width: uni.upx2px(90)
			},
			{
				name: 'dateline',
				label: '日期',
				align: 'center',
				width: uni.upx2px(100)
			}
		]
		// getMainPageInfo(uid);
	});
	const description = computed(() => {
		if (!userInfo.value.description) return '';
		return wrapNumbersWithSpan(userInfo.value.description);
	});

	const kuzhu = computed(() => {
		return (userInfo.value?.kuzhu ?? '').split(';').map((str) => {
			let v = str.split(',');
			return {
				name: v[1],
				score: v[2],
				uid: v[3],
				matchId: v[4],
				detail: v[5],
				description1: `${v[1]}(${v[2]})`,
				description2: ` ${v[5]}`
			};
		});
	});
	const fuxing = computed(() => {
		return (userInfo.value?.fuxing ?? '').split(';').map((str) => {
			let v = str.split(',');
			return {
				name: v[1],
				score: v[2],
				uid: v[3],
				matchId: v[4],
				detail: v[5],
				description1: `${v[1]}(${v[2]})`,
				description2: ` ${v[5]}`
			};
		});
	});

	function goFollow() {
		if (!hasFollowed.value) {
			goFollowSet(true);
		} else {
			uni.showModal({
				title: '提示',
				content: '确认要取消关注吗?',
				success: (res) => {
					if (res.confirm) {
						goFollowSet(false);
					}
				}
			});
		}
	}

	function goFollowSet(flag) {
		let request = flag ? goFolloweeByUid : goCancelFolloweeByUid;
		request(userInfo.value.uid).then((res) => {
			userInfo.value.hasFollowed = flag ? 1 : 0;
		});
	}

	function goListUser(type, index) {
		let list = userInfo.value[type].split(',').filter((v) => !!v);
		let uid = list[2 - index];
		if (uid) goUserPageByUid(uid);
	}

	function wrapNumbersWithSpan(text) {
		// 匹配数字和百分比的正则表达式
		const numberPattern = /\d+(\.\d+)?%?/g;

		return text.replace(numberPattern, (match) => {
			return `<span style="color:#05A2EB">${match}</span>`;
		});
	}

	function setChartData() {
		const data = scoreChangeData.value.map(v => v.postscore)
		let max = Math.max(...data)
		let min = Math.min(...data)
		let during = parseInt((max - min) / 3)
		max += during
		min -= during
		const option = {
			xAxis: {
				type: 'category',
				data: scoreChangeData.value.map(v => v.dateline),
			},
			yAxis: {
				type: 'value',
				min, // 最小值设为数据最小值
				max, // 最大值设为数据最大值
			},
			series: [{
				name: '赛后分数',
				data,
				type: 'line',
				showSymbol: true,
				symbolSize: 2,
				itemStyle: {
					color: '#1990ff'
				},
				lineStyle: {
					color: '#248DFF'
				},
				markPoint: {
					data: [
						{ type: 'max', name: '最大值' },
						{ type: 'min', name: '最小值' }
					],
					symbol: 'circle', // 使用气泡样式
					symbolSize: 3, // 调整气泡大小
					label: {
						show: true,
						fontWeight: '400',
						fontSize: 10,
						color: '#666',
					}
				},
			}, ],
			grid: [{ left: 40, right: 15, top: 60, bottom: 40 }],
			tooltip: {
				trigger: 'axis', // 坐标轴触发
				width: 100,
				backgroundColor: 'rgba(0,0,0,0.6)', // 设置背景色为浅蓝色[citation:2]
				textStyle: { color: 'white' },
				position: [0, 0],
				axisPointer: {
					type: 'line',
					animation: true,
					snap: true,
				},
				formatter: function(params) {
					const index = params?.[0]?.dataIndex ?? 0
					const row = scoreChangeData.value[index]
					return `赛后积分: ${row.postscore}\n时间: ${row.dateline}\n比赛: ${row.title}`;
				}
			}
		};
		echartRef.value.init(option);
		echartInit = true
	}

	function getMainPageInfo(uid) {
		!echartInit && getUserScores(uid).then(res => {
			// console.log(res.data);
			scoreChangeData.value = res.data ?? []
			// echartInit && setChartData()
		})
		return getAdvProfile(uid).then((res) => {
			// console.log(res);
			userInfo.value = res.data;
			games.value = (res.data?.games?.data ?? []).map((v, i) => {
				return { ...v, bifen: `${v.result1}:${v.result2}` };
			});
		});
	}

	let isInit = false;
	const upCallback = async (mescroll) => {
		isInit = true;
		if (mescroll.num == 1) {
			try {
				getUserShowTags(crtUid.value)
				await getMainPageInfo(crtUid.value);
				mescroll.endSuccess(games.value.length); // 请求成功, 结束加载
			} catch (e) {
				mescroll.endErr(); // 请求失败, 结束加载
			}
		} else {
			getPageGamesByUid(crtUid.value, mescroll.num)
				.then((res) => {
					let list = (res.data?.data ?? []).map((v, i) => {
						return { ...v, bifen: `${v.result1}:${v.result2}` };
					});
					games.value = games.value.concat(list);
					mescroll.endSuccess(list.length); // 请求成功, 结束加载
				})
				.catch((e) => {
					mescroll.endErr(); // 请求失败, 结束加载
				});
		}
	};

	function refresh() {
		games.value = []; // 先置空列表,显示加载进度
		getMescroll().resetUpScroll(true); // 再刷新列表数据
	}

	function setCellHeaderStyle({ column, columnIndex }) {
		return { fontSize: '24rpx', paddingLeft: '0', paddingRight: '0' };
	}

	function setCellStyle({ row, column, rowIndex, columnIndex }) {
		let obj = { height: '80rpx', fontSize: '24rpx', paddingLeft: '0', paddingRight: '0' };
		if (column.name === 'bifen' && row.groupid == -1) {
			obj.color = '#F89703';
		}
		return obj;
	}

	function cellClick(row, index, column) {
		if (column.name === 'username2') {
			return goUserPageByUid(row.uid2);
		}
		if (column.name === 'bifen' && row.flag === '0') {
			return goMatchDetailByGameid(row.gameid);
		}
		if (column.name === 'dateline') {
			goEventMainPage(row);
		}
	}

	function goMatchInfo(type, index) {
		let gameid = userInfo.value[type]['gameids'][index];
		goMatchDetailByGameid(gameid);
	}

	function getUserShowTags(uid) {
		const paramUid = !notMe.value ? '0' : uid
		getUserTags({ uid, limitByCount: 6, getNegative: false }).then(res => {
			showTags.value = (res.data ?? []).filter(v => v.count > 0)
		})
	}
</script>

<style scoped lang="scss">
	.boder-l-r {
		border-left: 1px solid #fff;
		border-right: 1px solid #fff;
	}

	.main-inof-box {
		text-indent: 2em;
		line-height: 1.6;
	}

	.info-title {
		margin-bottom: 10rpx;
		padding-left: 20rpx;
		line-height: 50rpx;
		height: 50rpx;
		position: relative;
		border-left: 12rpx solid #248dff;
	}
	.city-gap{
		gap: 8rpx;
	}
	.e-tag-wrap {
		gap: 20rpx;
		.e-tag {
			color: #fff;

			&-0 {
				border-radius: 28rpx;
				height: 56rpx;
				line-height: 24rpx;
				font-size: 24rpx;
				padding: 0 30rpx;
				background: #E49B37;
			}

			&-1 {
				border-radius: 42rpx;
				height: 86rpx;
				line-height: 32rpx;
				font-size: 32rpx;
				padding: 0 50rpx;
				background: #77B980;
			}
		}
	}
</style>