#!/usr/bin/env node
import axios from 'axios';

// 配置
const BASE_URL = 'https://kaiqiuwang.cc/xcx/public/index.php/api';
const CONFIG = {
  // 成都龙马国球馆
  shopid: '8485',
  // 去年2025年全年
  startTimestamp: 1735689600, // 2025-01-01
  endTimestamp: 1767225599,   // 2025-12-31
};

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://kaiqiuwang.cc/',
  }
});

function parseNote(note = '') {
  // 尝试从备注中提取报名费金额
  const patterns = [
    /报名费[：:]\s*(\d+)/i,
    /(\d+)\s*元/,
    /交费[：:]\s*(\d+)/i,
    /费用[：:]\s*(\d+)/i,
    /(\d+)\s*\/人/,
  ];
  for (const pattern of patterns) {
    const match = note.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return null;
}

async function getMatchList(page = 1, startTs, endTs, searchTitle = '') {
  try {
    const res = await http.get('/match/lists', {
      params: {
        lng: '104.06951914030779',
        lat: '30.510385734377817',
        search: '1',
        eventTitle: searchTitle,
        page: page,
        city: '成都市',
        startMatchTimestamp: startTs,
        endMatchTimestamp: endTs,
        shopid: CONFIG.shopid,
      }
    });
    return res.data;
  } catch (e) {
    throw e;
  }
}

async function getEventDetail(eventId) {
  try {
    const res = await http.get('/enter/detail', {
      params: {
        id: eventId,
        lng: '104.06951914030779',
        lat: '30.510385734377817',
      }
    });
    return res.data;
  } catch (e) {
    return null;
  }
}

async function getAllMatchesWithDetails(startTs, endTs, searchTitle = '', shopName) {
  const allMatches = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await getMatchList(page, startTs, endTs, searchTitle);
      const matches = res?.data?.data || [];
      
      if (matches.length === 0) {
        hasMore = false;
      } else {
        // 过滤只保留目标球馆的比赛
        const filtered = matches.filter(m => 
          m.arena_name === shopName
        );
        allMatches.push(...filtered);
        page++;
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      console.error(`获取第${page}页失败:`, e.message);
      break;
    }
  }
  
  // 获取每场赛事的详细报名费信息
  const total = allMatches.length;
  console.log(`\n📥 正在获取 ${total} 场赛事的报名费详情...\n`);
  
  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i];
    try {
      const detail = await getEventDetail(match.eventid);
      if (detail?.data?.items?.length > 0) {
        const item = detail.data.items[0];
        match.cost = parseFloat(item.cost) || 0;
        match.currCount = parseInt(item.curr_count) || 0;
        match.revenue = match.cost * match.currCount;
        match.subEventName = item.name;
      }
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      // 忽略
    }
    
    // 进度条可视化
    const progress = Math.round(((i + 1) / total) * 100);
    const filled = Math.round(progress / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r   [${bar}] ${progress}% (${i + 1}/${total})`);
  }
  console.log('\n');
  
  return allMatches;
}

function analyzeMatches(matches, shopName) {
  const stats = {
    total: matches.length,
    byStatus: {},
    byMonth: {},  // 按月统计
    totalParticipants: 0,
    totalRevenue: 0,
    revenueDetails: [],
    titles: [],
  };

  for (const match of matches) {
    const status = match.status || '未知';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    const starttime = match.starttime || '';
    const monthKey = starttime.substring(0, 7);
    stats.byMonth[monthKey] = stats.byMonth[monthKey] || { count: 0, revenue: 0, participants: 0 };
    stats.byMonth[monthKey].count++;

    const participants = parseInt(match.currCount) || 0;
    const revenue = match.revenue || 0;
    stats.totalParticipants += participants;
    stats.totalRevenue += revenue;
    stats.byMonth[monthKey].participants += participants;
    stats.byMonth[monthKey].revenue += revenue;

    if (revenue > 0) {
      stats.revenueDetails.push({
        title: match.title,
        month: monthKey,
        subEvent: match.subEventName || '',
        cost: match.cost || 0,
        participants,
        revenue,
        starttime: match.starttime,
      });
    }

    stats.titles.push({
      title: match.title,
      starttime: match.starttime,
      status: match.status,
      participants,
      revenue,
    });
  }

  return stats;
}

function formatReport(stats, shopName, startTs, endTs) {
  const startDate = new Date(startTs * 1000).toLocaleDateString('zh-CN');
  const endDate = new Date(endTs * 1000).toLocaleDateString('zh-CN');

  let report = `
╔══════════════════════════════════════════════════════════════════╗
║              🏓 球馆赛事分析报告                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  球馆: ${shopName.padEnd(54)}║
║  时间: ${startDate} - ${endDate.padEnd(46)}║
╠══════════════════════════════════════════════════════════════════╣
║  📊 赛事统计                                                     ║
║     总赛事数: ${stats.total.toString().padEnd(45)}║
`;

  for (const [status, count] of Object.entries(stats.byStatus)) {
    report += `║     ${status}: ${count.toString().padEnd(48)}║\n`;
  }

  report += `║                                                                  ║
║  📅 月度分布 & 收入                                               ║`;
  for (const [month, data] of Object.entries(stats.byMonth).sort()) {
    const revenue = `¥${data.revenue.toLocaleString()}`.padEnd(10);
    report += `\n║     ${month}: ${data.count}场 | ${data.participants}人 | ${revenue}${' '.repeat(Math.max(0, 47 - month.length - revenue.length - data.count.toString().length - data.participants.toString().length))}║`;
  }

  report += `
║                                                                  ║
║  👥 参赛人次: ${stats.totalParticipants.toString().padEnd(47)}║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  💰 收入估算                                                     ║
║                                                                  ║
║     总收入: ¥${stats.totalRevenue.toLocaleString()}${''.padEnd(47 - stats.totalRevenue.toLocaleString().length)}║
║     有收入赛事: ${stats.revenueDetails.length}场${' '.repeat(47 - stats.revenueDetails.length.toString().length)}║
╚══════════════════════════════════════════════════════════════════╝
`;

  if (stats.revenueDetails.length > 0) {
    report += '\n📋 收入明细:\n';
    report += '─'.repeat(90) + '\n';
    report += '  日期        | 项目           | 单价 | 队数 | 收入   | 赛事名称\n';
    report += '─'.repeat(90) + '\n';
    for (const item of stats.revenueDetails.sort((a, b) => b.revenue - a.revenue)) {
      const date = item.starttime.substring(5, 10);
      const subEvent = (item.subEvent || '单打').substring(0, 10).padEnd(10);
      const cost = `¥${item.cost}`.padEnd(5);
      const count = item.participants.toString().padEnd(3);
      const revenue = `¥${item.revenue}`.padEnd(6);
      const title = item.title.substring(0, 30);
      report += `  ${date} | ${subEvent} | ${cost} | ${count} | ${revenue} | ${title}\n`;
    }
    report += '─'.repeat(90) + '\n';
    report += `  合计: ¥${stats.totalRevenue.toLocaleString()}\n`;
  }

  return report;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    shopid: CONFIG.shopid,
    shopName: '成都龙马国球馆',
    startTs: CONFIG.startTimestamp,
    endTs: CONFIG.endTimestamp,
    searchTitle: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--shopid' && args[i + 1]) {
      config.shopid = args[++i];
    } else if (arg === '--shopname' && args[i + 1]) {
      config.shopName = args[++i];
    } else if (arg === '--start' && args[i + 1]) {
      config.startTs = Math.floor(new Date(args[++i]).getTime() / 1000);
    } else if (arg === '--end' && args[i + 1]) {
      config.endTs = Math.floor(new Date(args[++i]).getTime() / 1000);
    } else if (arg === '--title' && args[i + 1]) {
      config.searchTitle = args[++i];
    }
  }

  return config;
}

async function main() {
  const config = parseArgs();
  CONFIG.shopid = config.shopid;

  console.log(`🔍 正在查询 ${config.shopName} 的赛事数据...`);
  console.log(`📅 时间范围: ${new Date(config.startTs * 1000).toLocaleDateString('zh-CN')} - ${new Date(config.endTs * 1000).toLocaleDateString('zh-CN')}`);
  if (config.searchTitle) {
    console.log(`🔎 关键词: ${config.searchTitle}`);
  }
  console.log('');

  const matches = await getAllMatchesWithDetails(config.startTs, config.endTs, config.searchTitle, config.shopName);
  
  if (matches.length === 0) {
    console.log('❌ 未找到任何赛事');
    return;
  }

  console.log(`✅ 找到 ${matches.length} 场赛事\n`);
  
  const stats = analyzeMatches(matches, config.shopName);
  const report = formatReport(stats, config.shopName, config.startTs, config.endTs);
  console.log(report);
}

main().catch(console.error);
