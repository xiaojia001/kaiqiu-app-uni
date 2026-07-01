#!/usr/bin/env node

/**
 * 乒乓球双打队友分析器
 *
 * 使用方法:
 *   node index.js --city 城市名 --top N --maxscore 积分上限
 *
 * 示例:
 *   node index.js --city 成都 --top 20 --maxscore 1500
 *   node index.js --city 上海 --top 10 --maxscore 1700 --token YOUR_TOKEN --myuid 12345
 */

import { getPageUserRankList, getAllGamesByUid, getBatchEventDetails } from './api.js';
import { analyzeRecentGames, calculatePartnerCompatibility, generatePlayerReport } from './analyzer.js';
import fs from 'fs';

// 命令行参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    city: '',
    top: 20,
    events: 3,
    token: '',
    myUid: '',
    maxScore: 5000,
    output: ''  // 输出文件路径
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) {
      config.city = args[++i];
    } else if (args[i] === '--top' && args[i + 1]) {
      config.top = parseInt(args[++i]) || 20;
    } else if (args[i] === '--events' && args[i + 1]) {
      config.events = parseInt(args[++i]) || 3;
    } else if (args[i] === '--token' && args[i + 1]) {
      config.token = args[++i];
    } else if (args[i] === '--myuid' && args[i + 1]) {
      config.myUid = args[++i];
    } else if (args[i] === '--maxscore' && args[i + 1]) {
      config.maxScore = parseInt(args[++i]) || 5000;
    } else if (args[i] === '--output' && args[i + 1]) {
      config.output = args[++i];
    } else if (args[i] === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp() {
  console.log(`
乒乓球双打队友分析器

使用方法:
  node index.js [参数]

参数:
  --city <城市名>      必填,指定城市,如: 成都、上海、杭州
  --top <数量>         可选,分析前N名用户,默认: 20
  --events <数量>       可选,分析最近N个赛事,默认: 3
  --maxscore <积分>     可选,年度积分上限,默认: 5000(不限制)
  --token <令牌>       可选,用户令牌(获取更详细数据)
  --myuid <UID>        可选,你的用户UID(用于对比分析)
  --output <文件名>     可选,导出HTML报告,如: report.html
  --help               显示帮助信息

示例:
  node index.js --city 成都 --top 20
  node index.js --city 上海 --top 10 --events 5
  node index.js --city 成都 --top 10 --output report.html
`);
}

/**
 * 打印分隔线
 */
function printLine() {
  console.log('='.repeat(80));
}

/**
 * 导出HTML报告
 */
function exportHTML(profiles, filename) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>乒乓球双打队友分析报告</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { text-align: center; color: #333; margin-bottom: 30px; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h2 { color: #1890ff; margin-bottom: 15px; border-bottom: 2px solid #1890ff; padding-bottom: 8px; }
    .player-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .player-card { border: 1px solid #e8e8e8; border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.3s; }
    .player-card:hover { border-color: #1890ff; box-shadow: 0 4px 12px rgba(24,144,255,0.2); }
    .player-card.active { border-color: #1890ff; background: #e6f7ff; }
    .player-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px; }
    .player-info { font-size: 14px; color: #666; margin-bottom: 5px; }
    .score-badge { display: inline-block; background: #1890ff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .score-info { margin: 10px 0; padding: 8px; background: #f0f5ff; border-radius: 6px; font-size: 14px; }
    .detail-section { display: none; }
    .detail-section.active { display: block; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
    .stat-item { text-align: center; padding: 10px; background: #fafafa; border-radius: 6px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1890ff; }
    .stat-label { font-size: 12px; color: #666; }
    .chart-container { height: 300px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
    th:first-child, td:first-child { width: 120px; white-space: nowrap; }
    th:nth-child(3), td:nth-child(3) { width: 100px; white-space: nowrap; }
    th:nth-child(4), td:nth-child(4) { width: 60px; white-space: nowrap; text-align: center; }
    td:nth-child(2) { }
    th { background: #fafafa; font-weight: 600; }
    tr:hover { background: #fafafa; }
    .win { color: #52c41a; }
    .lose { color: #ff4d4f; }
    .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 5px; }
    .tag-win { background: #d9ffb3; color: #52c41a; }
    .tag-lose { background: #ffd9d9; color: #ff4d4f; }
    .tag-team { background: #fff0f0; color: #fa8c16; }
    .tag-knockout { background: #fff7e6; color: #fa8c16; }
    .knockout { background: #fffbf0; }
    .knockout-score { color: #fa8c16; font-weight: bold; }
    .point-cell { font-family: monospace; }
    .event-group { margin-bottom: 20px; padding: 10px; background: #fafafa; border-radius: 8px; }
    .event-group h4 { margin: 10px 0; color: #333; }
    .top-players { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 15px; }
    .top-player { text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
    .top-player.gold { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .top-player.silver { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .top-player.bronze { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .rank { font-size: 24px; margin-bottom: 5px; }
    .top-name { font-weight: bold; font-size: 14px; }
    .top-score { font-size: 12px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏓 乒乓球双打队友分析报告</h1>
    <div class="card">
      <h2>🏆 TOP 5 推荐搭档</h2>
      <div class="top-players">
${profiles.slice(0, 5).map((p, i) => `
        <div class="top-player ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">
          <div class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</div>
          <div class="top-name">${p.nickname} (${p.name})</div>
          <div class="top-score">积分: ${p.score}</div>
          <div class="top-score">评分: ${p.totalScore?.toFixed(1) || 'N/A'}</div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <h2>📊 所有选手数据</h2>
      <div class="player-grid">
${profiles.map((p, i) => `
        <div class="player-card" onclick="showDetail(${i})" id="card-${i}">
          <div class="player-name">${p.nickname} (${p.name}) <span class="score-badge">${p.score}分</span></div>
          <div class="player-info">${p.sex} | ${p.location || ''}</div>
          <div class="player-info">🏆 胜率: ${p.analysis.winRate}% | 双打: ${p.analysis.doubleWinRate}% | 综合评分: ${p.totalScore?.toFixed(1) || 'N/A'}</div>
        </div>`).join('')}
      </div>
    </div>
${profiles.map((p, i) => {
  // 按event分组 - 使用analysis.matchResults保证与控制台一致
  const eventGroups = {};
  (p.analysis.matchResults || []).forEach(m => {
    const eid = m.eventid;
    if (!eventGroups[eid]) {
      eventGroups[eid] = { matches: [], eventDetail: p.eventDetails?.[eid] || {} };
    }
    eventGroups[eid].matches.push(m);
  });
  const eventList = Object.entries(eventGroups)
    .map(([eid, data]) => ({
      eventid: eid,
      name: data.eventDetail.name || `赛事${eid}`,
      isTeam: data.eventDetail.isTeam || false,
      matches: data.matches.sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    }))
    .sort((a, b) => (b.matches[0]?.time || '').localeCompare(a.matches[0]?.time || ''));

  return `
    <div class="card detail-section" id="detail-${i}">
      <h2>${p.nickname} (${p.name}) - 详细数据 <span class="score-badge">${p.score}分</span></h2>
      <div class="score-info">
        <span>📊 积分: 当前${p.scores?.current || 0} | 年度最高${p.scores?.yearMax || 0} | 历史最高${p.scores?.max || 0} | 历史最低${p.scores?.min || 0}</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-value">${p.analysis.winRate}%</div><div class="stat-label">总胜率</div></div>
        <div class="stat-item"><div class="stat-value">${p.analysis.doubleWinRate}%</div><div class="stat-label">双打胜率</div></div>
        <div class="stat-item"><div class="stat-value">${p.analysis.totalGames}</div><div class="stat-label">总场次</div></div>
        <div class="stat-item"><div class="stat-value">${p.analysis.consistency}%</div><div class="stat-label">稳定性</div></div>
      </div>
      <div class="chart-container">
        <canvas id="chart-${i}"></canvas>
      </div>
      <h3>📋 近期对局</h3>
${eventList.map(ev => `
      <div class="event-group">
        <h4>📍 ${ev.name}${ev.isTeam ? ' <span class="tag tag-team">团体赛</span>' : ''}</h4>
        <table>
          <thead><tr><th>类型</th><th>对阵</th><th>胜负</th><th>积分</th></tr></thead>
          <tbody>
${ev.matches.slice(0, 10).map(m => {
  const isKnockout = !m.groupStage;
  const isDouble = m.type === '双打';
  // 双打格式: 搭档/我 vs 对手1/对手2
  const vsInfo = isDouble && m.partner
    ? `${m.partner}/${m.playerName} vs ${m.opponent}`
    : `${m.playerName} vs ${m.opponent}`;
  // 胜负列: 胜负 + 比分
  const resultCell = `<span class="${m.result === '胜' ? 'win' : 'lose'}">${m.result}</span> ${m.score}`;
  // 积分列: 单打显示积分变化，双打显示空
  const pointCell = isDouble ? '-' : (m.pointDiff !== undefined && m.pointDiff !== null && m.pointDiff !== '' ? m.pointDiff : m.score);
  return `
            <tr${isKnockout ? ' class="knockout"' : ''}>
              <td>${m.type}${isKnockout ? ' <span class="tag tag-knockout">淘汰赛</span>' : ''}</td>
              <td>${vsInfo}</td>
              <td class="${m.result === '胜' ? 'win' : 'lose'}">${resultCell}</td>
              <td class="${m.result === '胜' ? 'win' : 'lose'}">${pointCell}</td>
            </tr>`;}).join('')}
          </tbody>
        </table>
      </div>`).join('')}
    </div>`;}).join('')}
  </div>
  <script>
    function showDetail(index) {
      document.querySelectorAll('.detail-section').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.player-card').forEach(el => el.classList.remove('active'));
      document.getElementById('detail-' + index).classList.add('active');
      document.getElementById('card-' + index).classList.add('active');
      window.scrollTo(0, document.getElementById('detail-' + index).offsetTop - 20);
    }

    // 渲染图表
${profiles.map((p, i) => `
    new Chart(document.getElementById('chart-${i}'), {
      type: 'bar',
      data: {
        labels: ['单打', '双打', '团体'],
        datasets: [{
          label: '胜率',
          data: [${p.analysis.singleWinRate || 0}, ${p.analysis.doubleWinRate || 0}, ${p.analysis.teamWinRate || 0}],
          backgroundColor: ['#1890ff', '#52c41a', '#fa8c16']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });`).join('')}
  </script>
</body>
</html>`;

  fs.writeFileSync(filename, html, 'utf-8');
  console.log(`\n📄 HTML报告已导出: ${filename}`);
}

/**
 * 打印分析结果
 */
function printReport(player, analysis, gamesData, rank, eventDetails = {}) {
  const rankStr = rank ? `#${rank}` : '';
  console.log(`\n【${player.nickname}】( ${player.name} ) ${player.sex} | ${player.birthyear !== '未知' ? `${player.birthyear}年生` : ''} | 积分: ${player.score} ${rankStr}`);
  if (player.location) {
    console.log(`  📍 ${player.location}`);
  }
  if (player.scores) {
    console.log(`  📊 积分: 当前${player.scores.current} | 年度最高${player.scores.yearMax} | 历史最高${player.scores.max} | 历史最低${player.scores.min}`);
  }
  console.log('-'.repeat(60));

  // 详细统计
  const stats = analysis.detailedStats || {};
  console.log(`  📊 比赛类型分布:`);
  const singlesStr = `单打: ${stats.singles || 0}场`;
  const doublesStr = `双打: ${stats.doubles || 0}场`;
  const teamsStr = stats.teams > 0 ? ` | 团体: ${stats.teams}场` : '';
  console.log(`     ${singlesStr} | ${doublesStr}${teamsStr}`);

  // 胜率统计
  console.log(`  🏆 胜率统计:`);
  console.log(`     总胜率: ${analysis.winRate}% | 单打赢率: ${analysis.singleWinRate}%`);
  console.log(`     双打胜率: ${analysis.doubleWinRate}% | 团体胜率: ${analysis.teamWinRate}%`);

  // 近期状态
  console.log(`  📋 近期状态: ${analysis.recentForm.join(' ')} | 稳定性: ${analysis.consistency}%`);

  // 综合评分
  console.log(`  🎯 综合评分: ${player.totalScore?.toFixed(1) || 'N/A'}`);

  // 详细对局记录 - 按赛事分组显示
  if (analysis.matchResults && analysis.matchResults.length > 0 && gamesData) {
    // 按 eventid 分组
    const eventGroups = {};
    for (const m of analysis.matchResults) {
      if (!eventGroups[m.eventid]) {
        eventGroups[m.eventid] = [];
      }
      eventGroups[m.eventid].push(m);
    }

    // 获取赛事详情并按时间排序（最近的在前）
    const eventList = Object.entries(eventGroups)
      .map(([eventid, matches]) => {
        const detail = eventDetails[eventid] || {};
        // 从 gamesData 中获取该赛事的最新比赛日期
        const eventGames = gamesData.filter(g => String(g.eventid) === eventid);
        const latestDate = eventGames.length > 0
          ? eventGames.reduce((max, g) => g.dateline > max ? g.dateline : max, eventGames[0].dateline)
          : '';
        return {
          eventid,
          name: detail.name || `赛事${eventid}`,
          isTeam: detail.isTeam || false,
          matches,
          latestDate
        };
      })
      .sort((a, b) => (b.latestDate || '').localeCompare(a.latestDate || '')); // 按时间倒序

    console.log(`\n  📋 最近对局 (最近${eventList.length}个赛事):`);

    let matchNum = 1;
    for (const event of eventList) {
      console.log(`\n  📍 ${event.name}${event.isTeam ? ' [团体赛]' : ''}`);

      for (const m of event.matches) {
        // 双打格式: 搭档/我 vs 对手1/对手2
        // 单打格式: 我 vs 对手
        let vsInfo;
        if (m.type === '双打' && m.partner) {
          vsInfo = `${m.partner}/${m.playerName} vs ${m.opponent}`;
        } else {
          vsInfo = `${m.playerName} vs ${m.opponent}`;
        }

        // 单打显示: 胜负 比分 积分变化，双打显示: 胜负 比分
        const isDouble = m.type === '双打';
        const pointInfo = isDouble ? '' : ` ${m.pointDiff !== undefined && m.pointDiff !== null && m.pointDiff !== '' ? m.pointDiff : m.score}`;
        console.log(`     ${matchNum}. ${vsInfo} | ${m.result} ${m.score}${pointInfo}`);
        matchNum++;
      }
    }
  }
}

/**
 * 打印搭档适合度分析
 */
function printCompatibilityReport(myProfile, partnerProfile, compatibility) {
  const rating = compatibility.rating;

  console.log(`\n${printLine()}`);
  console.log(`【${myProfile.name}】 vs 【${partnerProfile.name}】 搭档分析`);
  console.log(`综合评分: ${compatibility.totalScore}/100 (${rating.grade}级 - ${rating.label})`);
  console.log('-'.repeat(60));

  console.log('\n分项评分:');
  for (const item of compatibility.breakdown) {
    const bar = '█'.repeat(Math.round(item.score / 10)) + '░'.repeat(10 - Math.round(item.score / 10));
    console.log(`  ${item.name}: ${bar} ${item.score} (权重:${(item.weight * 100).toFixed(0)}%)`);
  }

  console.log('\n分析理由:');
  compatibility.reasons.forEach((reason, i) => {
    console.log(`  ${i + 1}. ${reason}`);
  });

  if (compatibility.suggestions.length > 0) {
    console.log('\n建议:');
    compatibility.suggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });
  }
}

/**
 * 主函数
 */
async function main() {
  const config = parseArgs();

  if (!config.city) {
    console.error('错误: 请指定城市 (--city)');
    printHelp();
    process.exit(1);
  }

  console.log('\n🏓 乒乓球双打队友分析器');
  console.log(`📍 城市: ${config.city} | 🔢 分析前${config.top}名用户 | 📊 积分上限: ${config.maxScore}\n`);

  printLine();
  console.log('正在获取用户排名数据...');

  try {
    // 1. 获取用户排行榜
    console.log(`查询条件: 全城模式, 年度积分, 积分范围 0-${config.maxScore}`);
    const users = await getPageUserRankList({
      token: config.token,
      city: config.city,
      tabIndex: 0,        // 全城
      age: 0,             // 全部年龄
      sex: 0,             // 全部性别
      background: 0,     // 全部背景
      type: 2,           // 年度积分
      minScore: 0,
      maxScore: config.maxScore
    }, 1);

    if (!users || users.length === 0) {
      console.error('未找到符合条件的用户');
      process.exit(1);
    }

    // 取前N名
    const topUsers = users.slice(0, config.top);
    console.log(`✅ 获取到 ${users.length} 名用户,分析前 ${topUsers.length} 名\n`);

    // 2. 分析每个用户的近期比赛数据
    const playerProfiles = [];
    let analyzed = 0;

    console.log('正在分析每位用户的近期比赛数据...');
    for (const user of topUsers) {
      analyzed++;
      process.stdout.write(`\r  进度: ${analyzed}/${topUsers.length}`);

      try {
        // 获取近期比赛（分页获取直到有足够数据）
        const games = await getAllGamesByUid(user.uid, config.token, config.events);

        // 获取涉及的赛事详情
        const eventids = [...new Set(games.map(g => String(g.eventid || '0')))];
        const eventDetails = await getBatchEventDetails(eventids, config.token);

        // 分析比赛数据（传入用户当前积分和分析赛事数）
        const analysis = analyzeRecentGames(games, user.uid, user.score, config.events);

        // 生成完整报告
        const profile = generatePlayerReport(user, analysis, games, eventDetails);
        profile.gamesData = games;
        profile.eventDetails = eventDetails;

        playerProfiles.push(profile);
      } catch (error) {
        // 单个用户获取失败不影响整体
        console.warn(`\n  ⚠️ 用户 ${user.realname || user.uid} 数据获取失败: ${error.message}`);
        playerProfiles.push({
          uid: user.uid,
          name: user.realname || '匿名',
          score: user.score || 0,
          analysis: { totalGames: 0, winRate: 0, doubleWinRate: 0, recentForm: [], consistency: 0 }
        });
      }

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n\n✅ 数据分析完成!\n');

    // 3. 按综合指标排序输出
    printLine();
    console.log('📊 用户排名分析结果 (按双打实力排序)');
    printLine();

    // 计算综合评分并排序
    const sortedProfiles = playerProfiles
      .filter(p => p.analysis.totalGames > 0)
      .map(p => {
        // 计算综合实力评分
        const winRateScore = parseFloat(p.analysis.winRate) || 0;
        const doubleWinRateScore = parseFloat(p.analysis.doubleWinRate) || 0;
        const consistencyScore = parseFloat(p.analysis.consistency) || 50;
        const doubleGamesScore = Math.min((p.analysis.doubleGames || 0) * 3, 30); // 双打场次加分,最多30分
        const activityScore = Math.min((p.analysis.totalGames || 0) * 1, 20); // 总场次加分,最多20分

        // 综合评分 = 双打胜率*40% + 总胜率*20% + 稳定性*20% + 双打场次*10% + 活跃度*10%
        const totalScore =
          doubleWinRateScore * 0.4 +
          winRateScore * 0.2 +
          consistencyScore * 0.2 +
          doubleGamesScore * 0.1 +
          activityScore * 0.1;

        return { ...p, totalScore };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    sortedProfiles.forEach((profile, index) => {
      printReport(profile, profile.analysis, profile.gamesData, index + 1, profile.eventDetails || {});
      if (index < sortedProfiles.length - 1) {
        console.log('');
      }
    });

    // 4. 如果指定了自己的UID,进行搭档适合度分析
    if (config.myUid) {
      const myProfile = playerProfiles.find(p => p.uid == config.myUid);
      if (myProfile) {
        console.log('\n\n');
        printLine();
        console.log(`🤝 搭档适合度分析 (以你: ${myProfile.name} 为基准)`);
        printLine();

        for (const partner of sortedProfiles.slice(0, 5)) {
          if (partner.uid == config.myUid) continue;

          const compatibility = calculatePartnerCompatibility(myProfile, partner);
          printCompatibilityReport(myProfile, partner, compatibility);
        }
      } else {
        console.warn(`\n⚠️ 未找到你的用户数据 (UID: ${config.myUid})`);
      }
    }

    // 5. 输出推荐搭档
    console.log('\n\n');
    printLine();
    console.log('🏆 推荐双打搭档 TOP 5');
    printLine();

    const top5 = sortedProfiles.slice(0, 5);
    top5.forEach((profile, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      console.log(`\n${medal} ${profile.nickname} (${profile.name}) | ${profile.sex} | ${profile.location || ''}`);
      console.log(`   📊 积分: 当前${profile.score} | 年度最高${profile.scores?.yearMax || '?'} | 历史最高${profile.scores?.max || '?'} | 综合评分: ${profile.totalScore?.toFixed(1) || 'N/A'}`);
      console.log(`   🏆 胜率: 总${profile.analysis.winRate}% | 单打${profile.analysis.singleWinRate}% | 双打${profile.analysis.doubleWinRate}% | 团体${profile.analysis.teamWinRate}%`);
      console.log(`   📊 场次: 单打${profile.analysis.detailedStats?.singles || 0} | 双打${profile.analysis.doubleGames} | 团体${profile.analysis.teamGames}`);
      console.log(`   📋 近期: ${profile.analysis.recentForm.join(' ')}`);
    });

    // 6. 导出HTML报告
    if (config.output) {
      exportHTML(sortedProfiles, config.output);
    }

    console.log('\n\n✅ 分析完成!\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.message.includes('API错误')) {
      console.error('请检查 token 是否有效,或尝试不提供 token 运行');
    }
    process.exit(1);
  }
}

// 运行
main();
