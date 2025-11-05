<template>
	<view class="tournament-container">
		<!-- 晋级表标题 -->
		<view class="tournament-title">
			<view class="f-c-c">
				<text class="mr26rpx">赛事对战晋级表</text>
				<picker v-if="roundArr.length > 1" @change="bindPickerChange" :value="hideIndex" :range="roundArr">
					<view class="font-500 bg-#fff px16rpx flex items-center h40rpx">
						{{ roundArr[hideIndex] }}
						<uni-icons class="ml8rpx" type="bottom" size="30rpx"></uni-icons>
					</view>
				</picker>
			</view>
		</view>
		<!-- 轮次容器（横向排列） -->
		<view class="rounds-container">
			<template v-for="(roundData, roundIndex) in cptProcessedRounds" :key="roundIndex">
				<!-- 单个轮次 -->
				<view class="round-item">
					<!-- 轮次名称 -->
					<view class="round-name">{{ roundData.roundname }}</view>
					<!-- 该轮次所有比赛 -->
					<view class="games-container relative" :style="{ height: calcMaxHeight + 'rpx' }">
						<template v-for="(game, gameIndex) in roundData.games" :key="gameIndex">
							<!-- 单场比赛卡片 -->
							<view class="game-card" @click="goScoreDetail(game)">
								<!-- 选手1 -->
								<view class="player player-1" :class="{ winner: game.winner1 }">
									<view class="player-name">{{ game.username1 }}</view>
									<view class="player-score">{{ game.result1 }}</view>
								</view>
								<!-- 对战分隔线 -->
								<view class="vs-line"></view>
								<!-- 选手2 -->
								<view class="player player-2" :class="{ winner: game.winner2 }">
									<view class="player-name">{{ game.username2 }}</view>
									<view class="player-score">{{ game.result2 }}</view>
								</view>
							</view>
						</template>
						<view v-if="roundData.games.length > 1" class="absolute h-full w60rpx -right-60rpx top-0 flex flex-col items-center justify-around">
							<view
								class="bg-#ccc w1rpx relative"
								v-for="number in roundData.games.length / 2"
								:key="number"
								:style="{ height: calcMaxHeight / roundData.games.length + 'rpx' }"
							>
								<view class="absolute bg-#ccc h1rpx w30rpx top-0 right-0"></view>
								<view class="absolute bg-#ccc h1rpx w30rpx bottom-0 right-0"></view>
								<view class="absolute bg-#ccc h1rpx w30rpx top-1/2 left-0"></view>
							</view>
						</view>
					</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { goMatchDetailByTTReq } from '@/utils/goPage.js';
// 1. 接收父组件传递的赛事数据（此处直接使用提供的原始数据，实际可通过props接收）
const props = defineProps({
	matchData: {
		required: true,
		type: Array
	}
});
const hideIndex = ref(0);
const tournamentData = computed(() => props.matchData);

const calcMaxHeight = computed(() => {
	return (cptProcessedRounds.value[0]?.games?.length ?? 0) * 180;
});

// 2. 处理数据：按轮次顺序整理，匹配比分与选手
const processedRounds = ref([]);
const roundArr = computed(() => {
	return processedRounds.value
		.map((v, i) => {
			if (i === 0) {
				return '不隐藏层级';
			}
			return `隐藏${processedRounds.value[i - 1].roundname}`;
		})
		.slice(0, processedRounds.value.length - 1);
});

const cptProcessedRounds = computed(() => {
	return processedRounds.value.slice(hideIndex.value);
});

function bindPickerChange(e) {
	hideIndex.value = +e.detail.value;
}

// 新增：判断获胜者，返回{winner1: 布尔值, winner2: 布尔值}
const getWinnerFlags = (game) => {
	const { username1, username2, result1, result2 } = game;
	const winnerFlags = { winner1: false, winner2: false };

	// 场景1：轮空（一方为“轮空”，另一方胜）
	if (username1 === '轮空') {
		winnerFlags.winner2 = true;
	} else if (username2 === '轮空') {
		winnerFlags.winner1 = true;
	}
	// 场景2：弃赛（一方为“弃”，另一方胜）
	else if (result2.includes('弃')) {
		winnerFlags.winner1 = true;
	} else if (result1.includes('弃')) {
		winnerFlags.winner2 = true;
	}
	// 场景3：正常数字比分（对比数值）
	else {
		const score1 = parseInt(result1, 10);
		const score2 = parseInt(result2, 10);
		if (!isNaN(score1) && !isNaN(score2)) {
			winnerFlags.winner1 = score1 > score2;
			winnerFlags.winner2 = score2 > score1;
		}
	}
	return winnerFlags;
};

function goScoreDetail(game) {
	const { eventid, itemid, uid1, uid2, flag } = game;
	if (flag === '0' && uid1 && uid2) {
		goMatchDetailByTTReq({ eventid, itemid, uid1, uid2 });
	}
}
onMounted(() => {
	// 按round字段排序（1-5对应1/16决赛至决赛）
	const sortedRounds = [...tournamentData.value].sort((a, b) => {
		return parseInt(a.games[0].round) - parseInt(b.games[0].round);
	});

	// 处理每轮比赛数据，补充完整比分
	sortedRounds.forEach((round) => {
		const processedGames = round.games.map((game) => {
			// 从scores中获取对应比分（key为"uid1:uid2"）
			const scoreKey = `${game.uid1}:${game.uid2}`;
			const fullScore = round.scores[scoreKey] || '';
			const [score1, score2] = fullScore.split(':');
			const { winner1, winner2 } = getWinnerFlags(game);
			return {
				...game,
				// 补充完整比分（处理轮空、弃赛等特殊情况）
				result1: game.result1.trim(),
				result2: game.result2.trim(),
				winner1, //选手1是否获胜
				winner2 // 选手2是否获胜
			};
		});

		processedRounds.value.push({
			...round,
			games: processedGames
		});
	});
});
</script>

<style scoped>
/* 容器样式 */
.tournament-container {
	padding: 16rpx;
	background-color: #f5f5f5;
}

.tournament-title {
	font-size: 24rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20rpx;
	color: #333;
}

/* 轮次横向容器（可横向滚动） */
.rounds-container {
	display: flex;
	gap: 60rpx;
	overflow-x: auto;
	padding-bottom: 16rpx;
}

/* 单个轮次样式 */
.round-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	/* min-width: 220rpx; */
}

.round-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #666;
	margin-bottom: 12rpx;
	text-align: center;
}

/* 该轮次比赛容器 */
.games-container {
	display: flex;
	flex-direction: column;
	/* gap: 40px; */
	/* 比赛之间的垂直间距 */
	justify-content: space-around;
}

/* 单场比赛卡片 */
.game-card {
	width: 190rpx;
	box-sizing: border-box;
	background-color: #fff;
	border-radius: 8rpx;
	padding: 12rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	position: relative;
}

/* 选手样式 */
.player {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 22rpx;
}

.player-name {
	/* max-width: 140rpx; */
	flex-grow: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: #333;
}

.player-score {
	position: absolute;
	left: 100%;
	transform: translateX(6rpx);
	text-align: right;
	color: #248dff;
}

/* 对战分隔线 */
.vs-line {
	height: 1rpx;
	background-color: #eee;
	margin: 4rpx 0;
}

.winner .player-name {
	color: #ff3d00;
	/* 高亮颜色：红色 */
	font-weight: bold;
	/* 字体加粗 */
}
</style>
