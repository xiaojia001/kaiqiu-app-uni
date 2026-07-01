/**
 * 乒乓球双打队友分析器 - 增强版
 * 重点分析: 团体赛(按eventid分组)、以弱胜强、单打能力
 */

/**
 * 判断是否为胜利
 */
function isWin(game) {
  if (!game) return false;
  const r1 = parseInt(game.result1) || 0;
  const r2 = parseInt(game.result2) || 0;
  return r1 > r2;
}

/**
 * 判断是否为双打比赛
 * flag=1 表示双打赛
 */
function isDoubleGame(game) {
  if (!game) return false;
  return String(game.flag) === '1';
}

/**
 * 按 eventid 分组分析比赛
 * 同一 eventid 表示同一比赛周期（可能是团体赛）
 */
function groupGamesByEvent(games) {
  const eventMap = {};

  for (const game of games) {
    const eventid = String(game.eventid || '0');
    if (!eventMap[eventid]) {
      eventMap[eventid] = {
        eventid,
        games: [],
        hasDouble: false,
        hasSingle: false,
        teamSize: 0,
        myWins: 0,
        totalGames: 0
      };
    }

    const event = eventMap[eventid];
    event.games.push(game);
    event.totalGames++;

    if (isDoubleGame(game)) {
      event.hasDouble = true;
    } else {
      event.hasSingle = true;
    }

    if (isWin(game)) {
      event.myWins++;
    }
  }

  return eventMap;
}

/**
 * 判断是否为团体赛
 * 条件：同一eventid下同时有单打和双打，或有多场不同对手的比赛
 */
function isTeamEvent(event) {
  // 同时有单打和双打 = 团体赛
  if (event.hasDouble && event.hasSingle) {
    return true;
  }

  // 单eventid多场次 = 可能是循环赛/团体赛
  if (event.totalGames >= 3) {
    return true;
  }

  return false;
}

/**
 * 获取双打搭档名字
 */
function getDoublePartner(game, myUsername) {
  if (!isDoubleGame(game)) return null;

  // username1 和 username11 是我方两人的名字
  // username2 和 username22 是对方两人的名字
  const myP1 = game.username1 || '';
  const myP2 = game.username11 || '';
  const oppP1 = game.username2 || '';
  const oppP2 = game.username22 || '';

  // 返回我方另一名选手的名字
  if (myP1 === myUsername && myP2) return myP2;
  if (myP2 === myUsername && myP1) return myP1;

  return null;
}

/**
 * 获取对手名字（双打时返回队伍名）
 */
function getOpponentName(game) {
  const p1 = game.username2 || '';
  const p2 = game.username22 || '';

  if (p2 && p2 !== '0' && p2 !== '') {
    return `${p1}/${p2}`;
  }
  return p1 || '未知';
}

/**
 * 计算对手实力标签（基于积分差）
 * 积分差对应表:
 * 0-12: 8分
 * 13-37: 7/10分
 * 38-62: 6/13分
 * 63-87: 5/16分
 * 88-112: 4/20分
 * 113-137: 3/25分
 * 138-162: 2/30分
 * 163-187: 2/35分
 * 188-212: 1/40分
 * 213-237: 1/45分
 * 238+: 0/50分
 */
function getOpponentStrengthLabel(ratingDiff, isWin) {
  const absDiff = Math.abs(ratingDiff);

  // 实力标签基于积分差
  if (absDiff >= 238) {
    return isWin ? '巨人杀手' : '完败';
  } else if (absDiff >= 188) {
    return isWin ? '爆冷' : '惨败';
  } else if (absDiff >= 138) {
    return isWin ? '大冷' : '溃败';
  } else if (absDiff >= 113) {
    return isWin ? '冷门' : '惨负';
  } else if (absDiff >= 88) {
    return isWin ? '爆冷' : '完败';
  } else if (absDiff >= 63) {
    return isWin ? '较强' : '惜败';
  } else if (absDiff >= 38) {
    return isWin ? '略强' : '略输';
  } else if (absDiff >= 13) {
    return isWin ? '微弱优势' : '微弱劣势';
  }
  return isWin ? '正常' : '正常';
}

/**
 * 根据积分差计算以弱胜强加分
 */
function calculateUpsetBonus(ratingDiff, isWin) {
  if (!isWin) return 0;

  const absDiff = Math.abs(ratingDiff);
  if (absDiff >= 238) return 50;
  if (absDiff >= 213) return 45;
  if (absDiff >= 188) return 40;
  if (absDiff >= 163) return 35;
  if (absDiff >= 138) return 30;
  if (absDiff >= 113) return 25;
  if (absDiff >= 88) return 20;
  if (absDiff >= 63) return 16;
  if (absDiff >= 38) return 13;
  if (absDiff >= 13) return 10;
  return 8; // 0-12
}

/**
 * 分析用户近期比赛数据 - 增强版
 * @param {Array} games 比赛数据
 * @param {string} myUid 用户ID
 * @param {number} myScore 用户积分
 * @param {number} maxEvents 最大分析赛事数，默认3
 */
function analyzeRecentGames(games, myUid, myScore = 0, maxEvents = 3) {
  if (!games || games.length === 0) {
    return {
      totalGames: 0,
      winRate: 0,
      doubleWinRate: 0,
      teamWinRate: 0,
      upsetWins: 0,
      avgScoreDiff: 0,
      recentForm: [],
      consistency: 0,
      doubleGames: 0,
      teamGames: 0,
      teamEvents: [],
      matchResults: [],
      detailedStats: {}
    };
  }

  // 过滤有效比赛
  const validGames = games.filter(g => g && typeof g === 'object');
  const totalGames = validGames.length;

  if (totalGames === 0) {
    return {
      totalGames: 0,
      winRate: 0,
      doubleWinRate: 0,
      teamWinRate: 0,
      upsetWins: 0,
      avgScoreDiff: 0,
      recentForm: [],
      consistency: 0,
      doubleGames: 0,
      teamGames: 0,
      teamEvents: [],
      matchResults: [],
      detailedStats: {}
    };
  }

  // 获取我的用户名（从第一条比赛获取）
  const myUsername = validGames[0]?.username1 || '';

  // 按 eventid 分组
  const eventMap = groupGamesByEvent(validGames);
  let events = Object.values(eventMap);

  // 按时间排序（假设数组顺序是时间倒序）
  events.sort((a, b) => {
    // 获取每个 event 的最早比赛时间
    const aTime = a.games[0]?.dateline || '';
    const bTime = b.games[0]?.dateline || '';
    return bTime.localeCompare(aTime);
  });

  // 只取最近N个 event
  const recentEvents = events.slice(0, maxEvents);

  // 统计变量
  let wins = 0;
  let doubleGames = 0;
  let doubleWins = 0;
  let upsetWins = 0;
  let totalScoreDiff = 0;
  let upsetBonusTotal = 0;
  const recentForm = [];
  const matchResults = [];

  // 分析最近3个 event 的所有比赛
  for (const event of recentEvents) {
    // 按时间排序 event 内的比赛
    const sortedGames = event.games.slice(0, 10).sort((a, b) => {
      const aTime = a.dateline || '';
      const bTime = b.dateline || '';
      return bTime.localeCompare(aTime);
    });

    for (const game of sortedGames) {
      const win = isWin(game);
      const isDouble = isDoubleGame(game);

      if (win) wins++;
      if (isDouble) {
        doubleGames++;
        if (win) doubleWins++;
      }

      // 计算净胜分（比分差）
      const score1 = String(game.score1 || '0');
      const scoreDiff = parseInt(score1.replace(/[+-]/, '')) || 0;
      totalScoreDiff += Math.abs(scoreDiff);

      // 计算当前玩家的加减分（仅显示当前玩家的积分变化）
      let myPointDiff = '';
      if (String(game.uid1) === String(myUid)) {
        // 我是uid1，显示score1
        myPointDiff = game.score1 || '0';
      } else if (String(game.uid2) === String(myUid)) {
        // 我是uid2，显示score2
        myPointDiff = game.score2 || '0';
      }

      // 局分（result1:result2）
      const gameScore = `${game.result1 || '0'}:${game.result2 || '0'}`;

      // 计算积分差（基于ascore1估算对手积分）
      // ascroe1是攻击方（uid1）的赛前积分
      // 如果当前用户是uid2，则ascroe1代表对手（uid1）的积分
      let ratingDiff = 0;
      if (String(game.uid2) === String(myUid)) {
        // 我是uid2（防守方），ascroe1是对手（uid1）的积分
        const opponentScore = parseInt(game.ascore1) || 0;
        ratingDiff = (myScore || 0) - opponentScore;
      } else if (String(game.uid1) === String(myUid)) {
        // 我是uid1（攻击方），对手积分未知，用当前积分估算
        // 假设对手积分与自己相近，ratingDiff=0
        ratingDiff = 0;
      }

      // 以弱胜强分析 - 基于积分差
      if (ratingDiff < 0 && win) {
        // 赢了比我分高的对手
        upsetWins++;
        upsetBonusTotal += calculateUpsetBonus(ratingDiff, win);
      } else if (ratingDiff < -50 && win) {
        // 大比分战胜高积分对手
        upsetWins++;
        upsetBonusTotal += calculateUpsetBonus(ratingDiff, win);
      }

      recentForm.push(win ? '胜' : '负');

      // 获取双打搭档
      const partner = isDouble ? getDoublePartner(game, myUsername) : null;

      // 计算对手实力标签（基于积分差）
      const strengthLabel = getOpponentStrengthLabel(ratingDiff, win);

      // 记录详细对局信息
      // pointDiff有值时显示加减分，否则显示局分
      const displayScore = (myPointDiff !== undefined && myPointDiff !== null && myPointDiff !== '') ? myPointDiff : gameScore;
      matchResults.push({
        id: game.gameid,
        eventid: String(game.eventid || '0'),
        playerName: myUsername,  // 玩家昵称
        opponent: getOpponentName(game),  // 双打时返回 "对手1/对手2"
        partner: partner,  // 双打搭档
        result: win ? '胜' : '负',
        score: gameScore,  // 局分
        pointDiff: isDouble ? null : displayScore, // 双打不显示，单打显示加减分或局分
        type: isDouble ? '双打' : '单打',
        isTeamEvent: isTeamEvent(event),
        groupStage: game.groupid && game.groupid !== '-1',
        time: game.dateline || ''
      });
    }
  }

  // 识别团体赛
  let teamEvents = [];
  let teamGames = 0;
  let teamWins = 0;

  for (const event of events) {
    if (isTeamEvent(event)) {
      teamEvents.push(event);
      teamGames += event.totalGames;
      teamWins += event.myWins;
    }
  }

  const matchCount = matchResults.length;
  const winRate = matchCount > 0 ? (wins / matchCount) * 100 : 0;
  const doubleWinRate = doubleGames > 0 ? (doubleWins / doubleGames) * 100 : 0;
  const teamWinRate = teamGames > 0 ? (teamWins / teamGames) * 100 : 0;
  const avgScoreDiff = matchCount > 0 ? totalScoreDiff / matchCount : 0;
  const singleWinRate = (wins - doubleWins) > 0 && (totalGames - doubleGames) > 0
    ? ((wins - doubleWins) / (totalGames - doubleGames)) * 100 : 0;

  // 计算稳定性
  const consistency = calculateConsistency(recentForm);

  // 综合评分
  const baseScore =
    (doubleWinRate * 0.30) +
    (singleWinRate * 0.20) +
    (teamWinRate * 0.20) +
    (Math.min(upsetWins * 5, 25) * 0.15) +
    (consistency * 0.10) +
    (Math.min(totalGames * 2, 20) * 0.05);

  return {
    totalGames,
    winRate: winRate.toFixed(1),
    doubleWinRate: doubleWinRate.toFixed(1),
    teamWinRate: teamWinRate.toFixed(1),
    singleWinRate: singleWinRate.toFixed(1),
    upsetWins,
    avgScoreDiff: avgScoreDiff.toFixed(1),
    recentForm,
    consistency: consistency.toFixed(1),
    doubleGames,
    teamGames,
    teamEventCount: teamEvents.length,
    upsetBonusTotal,
    baseScore: baseScore.toFixed(1),
    matchResults,
    teamEvents: teamEvents.slice(0, 5), // 最近5个团体赛
    detailedStats: {
      singles: totalGames - doubleGames,
      doubles: doubleGames,
      teamEvents: teamEvents.length,
      upsets: upsetWins,
      avgPointDiff: avgScoreDiff.toFixed(1)
    }
  };
}

/**
 * 计算稳定性
 */
function calculateConsistency(form) {
  if (form.length < 3) return 50;

  let changes = 0;
  for (let i = 1; i < form.length; i++) {
    if (form[i] !== form[i - 1]) changes++;
  }

  const consistency = 100 - (changes / (form.length - 1)) * 100;
  return Math.max(0, Math.min(100, consistency));
}

/**
 * 计算双打队友适合度 - 增强版
 */
function calculatePartnerCompatibility(player1, player2) {
  const scores = [];
  const reasons = [];

  // 1. 积分匹配度 (权重: 20%)
  const scoreDiff = Math.abs(player1.score - player2.score);
  const scoreScore = Math.max(0, 100 - scoreDiff * 2);
  scores.push({ name: '积分匹配', score: scoreScore, weight: 0.20 });
  if (scoreDiff <= 100) {
    reasons.push(`积分差距小 (${scoreDiff}分), 实力相当`);
  } else if (scoreDiff <= 300) {
    reasons.push(`积分差距适中 (${scoreDiff}分)`);
  } else {
    reasons.push(`积分差距较大 (${scoreDiff}分), 需要磨合`);
  }

  // 2. 双打胜率匹配 (权重: 25%)
  const doubleWinRate1 = parseFloat(player1.analysis?.doubleWinRate) || 0;
  const doubleWinRate2 = parseFloat(player2.analysis?.doubleWinRate) || 0;
  const doubleDiff = Math.abs(doubleWinRate1 - doubleWinRate2);
  const doubleWinScore = Math.max(0, 100 - doubleDiff * 2);
  scores.push({ name: '双打胜率', score: doubleWinScore, weight: 0.25 });
  reasons.push(`双打胜率: ${player1.name}${player1.analysis?.doubleWinRate}% vs ${player2.name}${player2.analysis?.doubleWinRate}%`);

  // 3. 团体赛表现 (权重: 15%)
  const teamWinRate1 = parseFloat(player1.analysis?.teamWinRate) || 0;
  const teamWinRate2 = parseFloat(player2.analysis?.teamWinRate) || 0;
  const teamScore = (teamWinRate1 + teamWinRate2) / 2;
  scores.push({ name: '团体赛表现', score: teamScore, weight: 0.15 });
  reasons.push(`团体胜率: ${player1.name}${player1.analysis?.teamWinRate}% vs ${player2.name}${player2.analysis?.teamWinRate}%`);

  // 4. 以弱胜强能力 (权重: 15%)
  const upset1 = player1.analysis?.upsetWins || 0;
  const upset2 = player2.analysis?.upsetWins || 0;
  const upsetScore = Math.min((upset1 + upset2) * 10, 100);
  scores.push({ name: '以弱胜强', score: upsetScore, weight: 0.15 });
  reasons.push(`以弱胜强次数: ${player1.name}${upset1}次 vs ${player2.name}${upset2}次`);

  // 5. 发挥稳定性 (权重: 15%)
  const consistency1 = parseFloat(player1.analysis?.consistency) || 50;
  const consistency2 = parseFloat(player2.analysis?.consistency) || 50;
  const consistencyScore = (consistency1 + consistency2) / 2;
  scores.push({ name: '发挥稳定性', score: consistencyScore, weight: 0.10 });
  reasons.push(`稳定性: ${player1.analysis?.consistency}% vs ${player2.analysis?.consistency}%`);

  // 计算总分
  const totalScore = scores.reduce((sum, item) => sum + item.score * item.weight, 0);

  const rating = getRating(totalScore);
  const suggestions = generateSuggestions(scores, player1, player2);

  return {
    totalScore: totalScore.toFixed(1),
    rating,
    breakdown: scores.map(s => ({
      ...s,
      score: s.score.toFixed(1)
    })),
    reasons,
    suggestions
  };
}

/**
 * 获取评价等级
 */
function getRating(score) {
  if (score >= 85) return { grade: 'S', label: '绝佳搭档', color: 'gold' };
  if (score >= 70) return { grade: 'A', label: '优秀搭档', color: 'green' };
  if (score >= 55) return { grade: 'B', label: '良好搭档', color: 'blue' };
  if (score >= 40) return { grade: 'C', label: '一般搭档', color: 'gray' };
  return { grade: 'D', label: '不太适合', color: 'red' };
}

/**
 * 生成建议
 */
function generateSuggestions(scores, player1, player2) {
  const suggestions = [];

  const doubleWinIssue = scores.find(s => s.name === '双打胜率' && s.score < 50);
  if (doubleWinIssue) {
    suggestions.push('双打胜率偏低,需要多练习配合');
  }

  const teamIssue = scores.find(s => s.name === '团体赛表现' && s.score < 40);
  if (teamIssue) {
    suggestions.push('团体赛经验较少,可多参加团队比赛培养默契');
  }

  const upsetIssue = scores.find(s => s.name === '以弱胜强' && s.score < 30);
  if (upsetIssue) {
    suggestions.push('以弱胜强能力一般,实力可能有一定差距');
  }

  const goodMatch = scores.filter(s => s.score >= 70);
  if (goodMatch.length >= 3) {
    suggestions.push('多项指标匹配度高,是理想的搭档选择');
  }

  // 个性化建议
  const upset1 = player1.analysis?.upsetWins || 0;
  const upset2 = player2.analysis?.upsetWins || 0;
  if (upset1 > 3 && upset2 < 1) {
    suggestions.push(`${player1.name}擅长以弱胜强,可带${player2.name}提升信心`);
  } else if (upset2 > 3 && upset1 < 1) {
    suggestions.push(`${player2.name}擅长以弱胜强,可带${player1.name}提升信心`);
  }

  return suggestions;
}

/**
 * 获取完整用户分析报告
 */
function generatePlayerReport(user, analysis, games) {
  return {
    uid: user.uid,
    name: user.realname || '匿名',  // 真名
    nickname: user.username2 || user.username || '匿名',  // 昵称
    score: parseInt(user.score) || 0,
    maxscore: parseInt(user.maxscore) || 0,
    sex: String(user.sex) === '1' ? '男' : String(user.sex) === '2' ? '女' : '未知',
    birthyear: user.birthyear || '未知',
    location: `${user.resideprovince || ''}${user.residecity || ''}`,

    analysis,

    scores: {
      current: user.score || 0,      // 当前积分
      max: user.maxscore || 0,        // 历史最高
      min: user.minscore || 0,       // 历史最低
      yearMax: user.maxScoreTheYear || 0  // 年度最高
    },

    totalGames: analysis.totalGames,
    matchResults: analysis.matchResults
  };
}

export {
  analyzeRecentGames,
  calculatePartnerCompatibility,
  generatePlayerReport,
  isWin,
  isDoubleGame,
  groupGamesByEvent,
  isTeamEvent,
  getDoublePartner,
  getOpponentName,
  getOpponentStrengthLabel
};
