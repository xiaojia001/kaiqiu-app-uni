import axios from 'axios';

const BASE_URL = 'https://kaiqiuwang.cc/xcx/public/index.php/api';

// 创建 axios 实例
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// 城市映射
const CITY_MAP = {
  '全城': 1,
  '全省': 2,
  '全球': 3
};

// 年龄段映射
const AGE_MAP = {
  '全部': 0,
  '10岁以下': 1,
  '11~16岁': 2,
  '17~29岁': 3,
  '30~39岁': 4,
  '40~49岁': 5,
  '50~59岁': 6,
  '60~69岁': 7,
  '70~79岁': 8,
  '80岁以上': 9
};

// 性别映射
const SEX_MAP = {
  '全部': 0,
  '男': 1,
  '女': 2
};

// 背景映射
const BACKGROUND_MAP = {
  '全部': 0,
  '业余': 1,
  '专业': 2
};

// 积分段映射
const SCORE_MAP = {
  '全部': 0,
  'U1500': 1,
  'U1700': 2,
  'U1900': 3,
  'U2100': 4,
  'U2300': 5,
  'U2500': 6
};

// 类型映射 (当前积分/年度积分)
const TYPE_MAP = {
  '全部': 0,
  '当前积分': 1,
  '年度积分': 2
};

/**
 * 生成筛选索引字符串
 * @param {Object} filters 筛选条件
 * @returns {string} 索引字符串
 */
function generateIndexStr(filters) {
  const { tabIndex = 0, age = 0, sex = 0, background = 0, type = 2, minScore = 0, maxScore = 5000 } = filters;

  // 计算类型索引 (年度积分 = 2)
  const typeIndex = TYPE_MAP[Object.keys(TYPE_MAP).find(k => TYPE_MAP[k] === type)] || 2;

  // 生成索引字符串: (tabIndex+1)*10 + (age+1)(sex+1)(background+1)(type+1)
  const first = (tabIndex + 1) * 10 + (age + 1);
  const second = (sex + 1).toString() + (background + 1).toString() + (typeIndex + 1).toString();

  return first + second;
}

/**
 * 获取用户排行榜列表
 * @param {Object} params 查询参数
 * @param {string} params.token 用户token
 * @param {string} params.city 城市名
 * @param {string} params.year 年度 (如 '2024')
 * @param {number} params.tabIndex 范围索引 (0:全城, 1:全省, 2:全球)
 * @param {number} params.age 年龄段索引
 * @param {number} params.sex 性别索引
 * @param {number} params.background 背景索引
 * @param {number} params.type 类型索引 (0:全部, 1:当前积分, 2:年度积分)
 * @param {number} params.minScore 最低积分
 * @param {number} params.maxScore 最高积分
 * @param {number} page 页码
 * @returns {Promise<Object>}
 */
async function getPageUserRankList(params, page = 1) {
  const { token, city, tabIndex = 0, age = 0, sex = 0, background = 0, type = 2, minScore = 0, maxScore = 5000 } = params;

  const indexStr = generateIndexStr({ tabIndex, age, sex, background, type });

  const scoreRangeLabel = minScore > 0 || maxScore < 5000 ? `${minScore}-${maxScore}` : '';

  try {
    const response = await http.post('/user/lists', null, {
      params: {
        city: `-${tabIndex + 1}`,
        now: city,
        sort: '2',
        page,
        index: indexStr,
        minScore,
        maxScore,
        scoreRange: scoreRangeLabel
      },
      headers: token ? { token } : {}
    });

    if (response.data.code === 1) {
      const data = response.data.data;
      // 处理不同的数据格式
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.rows)) {
        return data.rows;
      } else if (data && typeof data === 'object') {
        // 可能是 { data: [...] } 或其他格式
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
      }
      return [];
    } else {
      throw new Error(response.data.msg || '获取用户列表失败');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`API错误: ${error.response.status} - ${error.response.data?.msg || error.message}`);
    }
    throw error;
  }
}

/**
 * 获取用户近期比赛 - 分页
 * @param {string} uid 用户ID
 * @param {string} token 用户token
 * @param {number} page 页码
 * @returns {Promise<Object>}
 */
async function getPageGamesByUid(uid, token, page = 1) {
  try {
    const response = await http.get('/User/getGames', {
      params: { uid, page },
      headers: token ? { token } : {}
    });

    if (response.data.code === 1) {
      const data = response.data.data;
      // 处理不同的数据格式
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.rows)) {
        return data.rows;
      } else if (data && typeof data === 'object') {
        // 可能是 { data: [...] } 或其他格式
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
      }
      return [];
    } else {
      throw new Error(response.data.msg || '获取比赛数据失败');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`API错误: ${error.response.status} - ${error.response.data?.msg || error.message}`);
    }
    throw error;
  }
}

/**
 * 获取用户的所有比赛（分页获取直到收集完前N个赛事的完整数据）
 * @param {string} uid 用户ID
 * @param {string} token 用户token
 * @param {number} minEvents 至少需要的前N个赛事
 * @returns {Promise<Array>}
 */
async function getAllGamesByUid(uid, token, minEvents = 3) {
  const allGames = [];
  const eventMap = {};  // eventid -> { games: [], latestDate: '' }
  let page = 1;
  const maxPages = 20;
  let targetEventIds = new Set(); // 前N个赛事的eventid集合

  while (page <= maxPages) {
    const games = await getPageGamesByUid(uid, token, page);

    if (!games || games.length === 0) break;

    // 收集eventid并记录最新日期
    for (const game of games) {
      const eventid = String(game.eventid || '0');
      if (!eventMap[eventid]) {
        eventMap[eventid] = { games: [], latestDate: '' };
      }
      eventMap[eventid].games.push(game);

      // 更新最新日期
      const gameDate = game.dateline || '';
      if (gameDate > eventMap[eventid].latestDate) {
        eventMap[eventid].latestDate = gameDate;
      }
    }

    allGames.push(...games);

    // 更新前N个赛事目标
    const sortedEvents = Object.entries(eventMap)
      .sort((a, b) => (b[1].latestDate || '').localeCompare(a[1].latestDate || ''))
      .map(([eventid]) => eventid);
    targetEventIds = new Set(sortedEvents.slice(0, minEvents));

    // 检查当前页是否包含目标赛事的数据
    const hasTargetGames = games.some(g => targetEventIds.has(String(g.eventid || '0')));

    // 如果当前页没有目标赛事的数据，停止
    if (!hasTargetGames) {
      break;
    }

    // 如果已经有足够多的赛事，且当前页全部是目标赛事的，继续获取确保完整
    const allFromTargets = games.every(g => targetEventIds.has(String(g.eventid || '0')));
    if (sortedEvents.length >= minEvents && !allFromTargets) {
      // 当前页混合了目标赛事和其他赛事，说明目标赛事已经取完，停止
      break;
    }

    page++;
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allGames;
}

// 赛事详情缓存
const eventDetailCache = {};

/**
 * 获取赛事详情（带缓存）
 * @param {string} eventid 赛事ID
 * @param {string} token 用户token
 * @returns {Promise<Object>}
 */
async function getEventDetail(eventid, token) {
  if (eventDetailCache[eventid]) {
    return eventDetailCache[eventid];
  }

  try {
    // 使用固定的成都坐标作为默认值
    const response = await http.get('/enter/detail', {
      params: {
        id: eventid,
        lng: 104.06,  // 成都经度
        lat: 30.67    // 成都纬度
      },
      headers: token ? { token } : {}
    });

    if (response.data.code === 1) {
      const detail = response.data.data?.detail || {};
      eventDetailCache[eventid] = {
        name: detail.name || detail.title || `赛事${eventid}`,
        isTeam: detail.is_team_event || detail.type?.includes('team') || false
      };
      return eventDetailCache[eventid];
    }
  } catch (error) {
    // 忽略错误，返回默认值
  }

  eventDetailCache[eventid] = {
    name: `赛事${eventid}`,
    isTeam: false
  };
  return eventDetailCache[eventid];
}

/**
 * 批量获取赛事详情
 * @param {Array} eventids 赛事ID列表
 * @param {string} token 用户token
 * @returns {Promise<Object>} { eventid: { name, isTeam } }
 */
async function getBatchEventDetails(eventids, token) {
  const results = {};

  // 去重
  const uniqueIds = [...new Set(eventids)];

  // 并发获取（最多同时5个）
  const batchSize = 5;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const promises = batch.map(id => getEventDetail(id, token));
    const batchResults = await Promise.all(promises);

    batch.forEach((id, index) => {
      results[id] = batchResults[index];
    });

    // 避免请求过快
    if (i + batchSize < uniqueIds.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * 获取用户积分信息
 * @param {string} uid 用户ID
 * @param {string} token 用户token
 * @returns {Promise<Object>}
 */
async function getUserScores(uid, token) {
  try {
    const response = await http.get('/User/getUserScores', {
      params: { uid },
      headers: token ? { token } : {}
    });

    if (response.data.code === 1) {
      return response.data.data || {};
    } else {
      throw new Error(response.data.msg || '获取积分信息失败');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`API错误: ${error.response.status} - ${error.response.data?.msg || error.message}`);
    }
    throw error;
  }
}

/**
 * 获取用户信用信息
 * @param {string} uid 用户ID
 * @param {string} token 用户token
 * @returns {Promise<Object>}
 */
async function getUserCredit(uid, token) {
  try {
    const response = await http.get('/User/getCredit', {
      params: { uid },
      headers: token ? { token } : {}
    });

    if (response.data.code === 1) {
      return response.data.data || {};
    } else {
      throw new Error(response.data.msg || '获取信用信息失败');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`API错误: ${error.response.status} - ${error.response.data?.msg || error.message}`);
    }
    throw error;
  }
}

export {
  getPageUserRankList,
  getPageGamesByUid,
  getAllGamesByUid,
  getEventDetail,
  getBatchEventDetails,
  getUserScores,
  getUserCredit,
  CITY_MAP,
  AGE_MAP,
  SEX_MAP,
  BACKGROUND_MAP,
  SCORE_MAP,
  TYPE_MAP
};
