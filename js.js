// 存储选手数据
let players = JSON.parse(localStorage.getItem('danceCubePlayers')) || [];
let currentRound = localStorage.getItem('danceCubeCurrentRound') || 'signup';

// 保存数据到本地存储
function saveData() {
    localStorage.setItem('danceCubePlayers', JSON.stringify(players));
    localStorage.setItem('danceCubeCurrentRound', currentRound);
}

// 在页面加载时恢复数据
document.addEventListener('DOMContentLoaded', function() {
    // 恢复当前标签页
    if (currentRound && currentRound !== 'signup') {
        switchTab(currentRound);
    }

    // 恢复签到表
    updateSignupTable();

    // 根据当前轮次恢复相应的表格
    if (players.length > 0) {
        switch(currentRound) {
            case 'round1':
                initRound1Table();
                // 恢复已有的分数和排名显示
                players.forEach((player, index) => {
                    updateTotalScore(index, 'round1');
                });
                updateRankDisplay('round1');
                break;
            case 'round2':
                const top8 = players.filter(player => player.round1.rank <= 8);
                if (top8.length > 0) {
                    initRound2Table(top8);
                    // 恢复已有的分数和排名显示
                    top8.forEach(player => {
                        const playerIndex = players.findIndex(p => p.id === player.id);
                        if (playerIndex !== -1) {
                            updateTotalScore(playerIndex, 'round2');
                        }
                    });
                    updateRankDisplay('round2');
                }
                break;
            case 'round3':
                const top4Round3 = players.filter(player => player.round2.rank <= 4);
                if (top4Round3.length > 0) {
                    initRound3Table(top4Round3);
                    // 恢复已有的分数和排名显示
                    top4Round3.forEach(player => {
                        const playerIndex = players.findIndex(p => p.id === player.id);
                        if (playerIndex !== -1) {
                            updateTotalScore(playerIndex, 'round3');
                        }
                    });
                    updateRankDisplay('round3');
                }
                break;
            case 'final':
                const top4Final = players.filter(player => player.round2.rank <= 4);
                if (top4Final.length > 0) {
                    initFinalTable(top4Final);
                    // 恢复已有的分数和排名显示
                    top4Final.forEach(player => {
                        const playerIndex = players.findIndex(p => p.id === player.id);
                        if (playerIndex !== -1) {
                            updateTotalScore(playerIndex, 'final');
                        }
                    });
                    updateRankDisplay('final');
                }
                break;
        }
    }
});

// 验证数字输入
function validateNumberInput(input) {
    const errorElement = document.getElementById('id-error');
    if (!/^\d*$/.test(input.value)) {
        errorElement.textContent = 'ID只能包含数字';
        input.value = input.value.replace(/[^\d]/g, '');
    } else {
        errorElement.textContent = '';
    }
}

// 切换标签页
function switchTab(tabId) {
    // 隐藏所有内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 取消所有标签的活动状态
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // 显示选中的内容
    document.getElementById(tabId).classList.add('active');

    // 设置选中标签的活动状态
    document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add('active');

    currentRound = tabId;
    saveData();
}

// 选手签到
function signupPlayer() {
    const id = document.getElementById('player-id').value.trim();
    const name = document.getElementById('player-name').value.trim();

    if (!id) {
        alert('请输入舞立方ID');
        return;
    }

    if (!name) {
        alert('请输入昵称');
        return;
    }

    // 检查是否已存在相同ID
    if (players.some(player => player.id === id)) {
        alert('该ID已签到，请勿重复签到');
        return;
    }

    const player = {
        id: id,
        name: name,
        round1: {
            song1: null,
            song2: null,
            total: null,
            rank: null
        },
        round2: {
            song1: null,
            song2: null,
            song3: null,
            total: null,
            rank: null
        },
        round3: {
            song: null,
            perfect: null,
            total: null,
            rank: null
        },
        final: {
            song1: null,
            song2: null,
            total: null,
            rank: null
        }
    };

    players.push(player);

    // 更新签到表
    updateSignupTable();

    // 清空输入框
    document.getElementById('player-id').value = '';
    document.getElementById('player-name').value = '';

    saveData();
}

// 更新签到表
function updateSignupTable() {
    const table = document.querySelector('#signup-table tbody');
    table.innerHTML = '';

    players.forEach((player, index) => {
        const row = table.insertRow();
        row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td><button class="btn btn-danger" onclick="removePlayer(${index})"><i class="fas fa-trash"></i> 删除</button></td>
                    `;
    });
}

// 移除选手
function removePlayer(index) {
    players.splice(index, 1);
    updateSignupTable();
    saveData();
}

// 重置签到表
function resetSignup() {
    if (confirm('确定要重置所有签到数据吗？这将清空所有选手信息！')) {
        players = [];
        updateSignupTable();
        saveData();
    }
}

// 重置所有数据
function resetAllData() {
    if (confirm('确定要重置所有比赛数据吗？这将清空所有选手信息和比赛记录！')) {
        players = [];
        updateSignupTable();

        // 重置所有表格
        document.querySelectorAll('.tab-content table tbody').forEach(tbody => {
            tbody.innerHTML = '';
        });

        // 切换到签到页面
        switchTab('signup');
        localStorage.removeItem('danceCubePlayers');
        localStorage.removeItem('danceCubeCurrentRound');
        alert('所有数据已重置');
    }
}

// 开始比赛
function startCompetition() {
    if (players.length < 8) {
        alert('至少需要8名选手才能开始比赛');
        return;
    }

    // 初始化20晋8表格
    initRound1Table();

    // 切换到20晋8页面
    switchTab('round1');
}

// 初始化20晋8表格
function initRound1Table() {
    const table = document.querySelector('#round1-table tbody');
    table.innerHTML = '';

    players.forEach((player, index) => {
        const row = table.insertRow();
        row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${index}, 'round1', 'song1', this)" value="${player.round1.song1 || ''}"></td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${index}, 'round1', 'song2', this)" value="${player.round1.song2 || ''}"></td>
                        <td class="total">${player.round1.total || 0}</td>
                        <td class="rank">${player.round1.rank || '-'}</td>
                    `;
    });
}

// 更新选手分数
function updatePlayerScore(playerIndex, round, field, input) {
    const value = parseFloat(input.value) || null;
    players[playerIndex][round][field] = value;

    // 更新总分
    updateTotalScore(playerIndex, round);
    saveData();
}

// 更新Perfect数
function updatePlayerPerfect(playerIndex, input) {
    const value = parseInt(input.value) || null;
    players[playerIndex].round3.perfect = value;
    saveData();
}

// 更新总分
function updateTotalScore(playerIndex, round) {
    const player = players[playerIndex];
    const roundData = player[round];

    // 计算总分
    let total = 0;
    let count = 0;

    Object.keys(roundData).forEach(key => {
        if (key.startsWith('song') && roundData[key] !== null) {
            total += roundData[key];
            count++;
        }
    });

    roundData.total = count > 0 ? total : null;

    // 更新所有相关表格的显示
    updateAllTableDisplays(round, player.id);
}

// 更新所有表格显示
function updateAllTableDisplays(round, playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // 更新当前轮次的表格
    const currentTableRows = document.querySelectorAll(`#${round}-table tbody tr`);
    currentTableRows.forEach(row => {
        if (row.cells[1].textContent === playerId) {
            const totalCell = row.querySelector('.total');
            if (totalCell) {
                totalCell.textContent = player[round].total !== null ? player[round].total.toFixed(2) : '0';
            }
        }
    });
}

// 计算20晋8排名
function calculateRound1() {
    // 检查所有选手是否都有分数
    for (let i = 0; i < players.length; i++) {
        if (players[i].round1.song1 === null || players[i].round1.song2 === null) {
            alert(`选手 ${players[i].name} 的分数不完整，无法计算排名`);
            return;
        }
    }

    // 计算排名
    const sortedPlayers = [...players].sort((a, b) => b.round1.total - a.round1.total);

    sortedPlayers.forEach((player, index) => {
        player.round1.rank = index + 1;
    });

    // 更新表格
    updateRankDisplay('round1');
    saveData();
    alert('排名计算完成！');
}

// 更新排名显示
function updateRankDisplay(round) {
    const tableRows = document.querySelectorAll(`#${round}-table tbody tr`);

    tableRows.forEach(row => {
        const id = row.cells[1].textContent;
        const player = players.find(p => p.id === id);

        if (player) {
            const totalCell = row.querySelector('.total');
            const rankCell = row.querySelector('.rank');

            if (totalCell) {
                totalCell.textContent = player[round].total !== null ? player[round].total.toFixed(2) : '0';
            }

            if (rankCell) {
                rankCell.textContent = player[round].rank || '-';
                if (player[round].rank <= (round === 'round1' ? 8 : round === 'round2' ? 4 : 4)) {
                    rankCell.classList.add('highlight');
                } else {
                    rankCell.classList.remove('highlight');
                }
            }
        }
    });
}

// 进入晋级赛
function proceedToRound2() {
    // 检查是否已计算排名
    const hasRanking = players.some(player => player.round1.rank !== null);
    if (!hasRanking) {
        alert('请先计算20晋8排名');
        return;
    }

    // 筛选前8名
    const top8 = players.filter(player => player.round1.rank <= 8);

    if (top8.length < 8) {
        alert('晋级赛需要8名选手，目前只有' + top8.length + '名选手晋级');
        return;
    }

    // 初始化晋级赛表格
    initRound2Table(top8);

    // 切换到晋级赛页面
    switchTab('round2');
}

// 初始化晋级赛表格 - 按上一轮排名排序
function initRound2Table(top8Players) {
    const table = document.querySelector('#round2-table tbody');
    table.innerHTML = '';

    // 按20晋8排名排序
    const sortedPlayers = [...top8Players].sort((a, b) => a.round1.rank - b.round1.rank);

    sortedPlayers.forEach((player, index) => {
        const row = table.insertRow();
        // 使用选手ID来查找对应的玩家索引
        const playerIndex = players.findIndex(p => p.id === player.id);
        row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'round2', 'song1', this)" value="${player.round2.song1 || ''}"></td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'round2', 'song2', this)" value="${player.round2.song2 || ''}"></td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'round2', 'song3', this)" value="${player.round2.song3 || ''}"></td>
                        <td class="total">${player.round2.total || 0}</td>
                        <td class="rank">${player.round2.rank || '-'}</td>
                    `;
    });
}

// 计算晋级赛排名
function calculateRound2() {
    // 检查所有选手是否都有分数
    const round2Players = players.filter(player => player.round1.rank <= 8);

    for (let i = 0; i < round2Players.length; i++) {
        const player = round2Players[i];
        if (player.round2.song1 === null || player.round2.song2 === null || player.round2.song3 === null) {
            alert(`选手 ${player.name} 的分数不完整，无法计算排名`);
            return;
        }
    }

    // 计算排名
    const sortedPlayers = round2Players.sort((a, b) => b.round2.total - a.round2.total);

    sortedPlayers.forEach((player, index) => {
        player.round2.rank = index + 1;
    });

    // 更新表格
    updateRankDisplay('round2');
    saveData();
    alert('晋级赛排名计算完成！');
}

// 进入排位赛
function proceedToRound3() {
    // 检查是否已计算排名
    const hasRanking = players.some(player => player.round2.rank !== null);
    if (!hasRanking) {
        alert('请先计算晋级赛排名');
        return;
    }

    // 筛选前4名
    const top4 = players.filter(player => player.round2.rank <= 4);

    if (top4.length < 4) {
        alert('排位赛需要4名选手，目前只有' + top4.length + '名选手晋级');
        return;
    }

    // 初始化排位赛表格
    initRound3Table(top4);

    // 切换到排位赛页面
    switchTab('round3');
}

// 初始化排位赛表格 - 按上一轮排名排序
function initRound3Table(top4Players) {
    const table = document.querySelector('#round3-table tbody');
    table.innerHTML = '';

    // 按晋级赛排名排序
    const sortedPlayers = [...top4Players].sort((a, b) => a.round2.rank - b.round2.rank);

    sortedPlayers.forEach((player, index) => {
        const row = table.insertRow();
        // 使用选手ID来查找对应的玩家索引
        const playerIndex = players.findIndex(p => p.id === player.id);
        row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'round3', 'song', this)" value="${player.round3.song || ''}"></td>
                        <td><input type="number" class="input-score" placeholder="Perfect数" min="0" max="1000" step="1"
                               oninput="updatePlayerPerfect(${playerIndex}, this)" value="${player.round3.perfect || ''}"></td>
                        <td class="total">${player.round3.total || 0}</td>
                        <td class="rank">${player.round3.rank || '-'}</td>
                    `;
    });
}

// 计算排位赛排名
function calculateRound3() {
    // 检查所有选手是否都有分数
    const round3Players = players.filter(player => player.round2.rank <= 4);

    for (let i = 0; i < round3Players.length; i++) {
        const player = round3Players[i];
        if (player.round3.song === null || player.round3.perfect === null) {
            alert(`选手 ${player.name} 的分数不完整，无法计算排名`);
            return;
        }
    }

    // 计算排名 - 先按Perfect数，再按总分
    const sortedPlayers = round3Players.sort((a, b) => {
        if (b.round3.perfect !== a.round3.perfect) {
            return b.round3.perfect - a.round3.perfect;
        }
        return b.round3.total - a.round3.total;
    });

    sortedPlayers.forEach((player, index) => {
        player.round3.rank = index + 1;
    });

    // 更新表格
    updateRankDisplay('round3');
    saveData();
    alert('排位赛排名计算完成！');
}

// 进入决赛
function proceedToFinal() {
    // 检查是否已计算排名
    const hasRanking = players.some(player => player.round3.rank !== null);
    if (!hasRanking) {
        alert('请先计算排位赛排名');
        return;
    }

    // 筛选前4名
    const top4 = players.filter(player => player.round2.rank <= 4);

    if (top4.length < 4) {
        alert('决赛需要4名选手，目前只有' + top4.length + '名选手晋级');
        return;
    }

    // 初始化决赛表格
    initFinalTable(top4);

    // 切换到决赛页面
    switchTab('final');
}

// 初始化决赛表格 - 按排位赛排名排序
function initFinalTable(top4Players) {
    const table = document.querySelector('#final-table tbody');
    table.innerHTML = '';

    // 按排位赛排名排序
    const sortedPlayers = [...top4Players].sort((a, b) => a.round3.rank - b.round3.rank);

    sortedPlayers.forEach((player, index) => {
        const row = table.insertRow();
        // 使用选手ID来查找对应的玩家索引
        const playerIndex = players.findIndex(p => p.id === player.id);
        row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player.id}</td>
                        <td>${player.name}</td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'final', 'song1', this)" value="${player.final.song1 || ''}"></td>
                        <td><input type="number" class="input-score" placeholder="分数" min="0" max="100" step="0.01"
                               oninput="updatePlayerScore(${playerIndex}, 'final', 'song2', this)" value="${player.final.song2 || ''}"></td>
                        <td class="total">${player.final.total || 0}</td>
                        <td class="rank">${player.final.rank || '-'}</td>
                    `;
    });
}

// 计算决赛排名
function calculateFinal() {
    // 检查所有选手是否都有分数
    const finalPlayers = players.filter(player => player.round2.rank <= 4);

    for (let i = 0; i < finalPlayers.length; i++) {
        const player = finalPlayers[i];
        if (player.final.song1 === null || player.final.song2 === null) {
            alert(`选手 ${player.name} 的分数不完整，无法计算排名`);
            return;
        }
    }

    // 计算排名
    const sortedPlayers = finalPlayers.sort((a, b) => b.final.total - a.final.total);

    sortedPlayers.forEach((player, index) => {
        player.final.rank = index + 1;
    });

    // 更新表格
    updateRankDisplay('final');
    saveData();
    alert('决赛排名计算完成！');
}

// 重置各轮比赛
function resetRound1() {
    if (confirm('确定要重置20晋8比赛数据吗？')) {
        players.forEach(player => {
            player.round1 = {
                song1: null,
                song2: null,
                total: null,
                rank: null
            };
        });
        initRound1Table();
        saveData();
        alert('20晋8比赛数据已重置');
    }
}

function resetRound2() {
    if (confirm('确定要重置晋级赛比赛数据吗？')) {
        players.forEach(player => {
            player.round2 = {
                song1: null,
                song2: null,
                song3: null,
                total: null,
                rank: null
            };
        });
        const top8 = players.filter(player => player.round1.rank <= 8);
        initRound2Table(top8);
        saveData();
        alert('晋级赛比赛数据已重置');
    }
}

function resetRound3() {
    if (confirm('确定要重置排位赛比赛数据吗？')) {
        players.forEach(player => {
            player.round3 = {
                song: null,
                perfect: null,
                total: null,
                rank: null
            };
        });
        const top4 = players.filter(player => player.round2.rank <= 4);
        initRound3Table(top4);
        saveData();
        alert('排位赛比赛数据已重置');
    }
}

function resetFinal() {
    if (confirm('确定要重置决赛比赛数据吗？')) {
        players.forEach(player => {
            player.final = {
                song1: null,
                song2: null,
                total: null,
                rank: null
            };
        });
        const top4 = players.filter(player => player.round2.rank <= 4);
        initFinalTable(top4);
        saveData();
        alert('决赛比赛数据已重置');
    }
}

// 导出比赛结果
function exportResults() {
    if (players.length === 0) {
        alert('没有选手数据可以导出');
        return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建选手信息表
    const playerData = players.map((player, index) => ({
        '序号': index + 1,
        '选手ID': player.id,
        '选手昵称': player.name,
        '20晋8-第一首': player.round1.song1 || '未录入',
        '20晋8-第二首': player.round1.song2 || '未录入',
        '20晋8-总分': player.round1.total || '未计算',
        '20晋8-排名': player.round1.rank || '未计算',
        '晋级赛-第一首': player.round2.song1 || '未录入',
        '晋级赛-第二首': player.round2.song2 || '未录入',
        '晋级赛-第三首': player.round2.song3 || '未录入',
        '晋级赛-总分': player.round2.total || '未计算',
        '晋级赛-排名': player.round2.rank || '未计算',
        '排位赛-歌曲': player.round3.song || '未录入',
        '排位赛-Perfect数': player.round3.perfect || '未录入',
        '排位赛-总分': player.round3.total || '未计算',
        '排位赛-排名': player.round3.rank || '未计算',
        '决赛-第一首': player.final.song1 || '未录入',
        '决赛-第二首': player.final.song2 || '未录入',
        '决赛-总分': player.final.total || '未计算',
        '决赛-排名': player.final.rank || '未计算'
    }));

    const playerWs = XLSX.utils.json_to_sheet(playerData);
    XLSX.utils.book_append_sheet(wb, playerWs, '选手成绩表');

    // 创建冠亚季军表
    const finalPlayers = players.filter(player => player.round2.rank <= 4);
    const sortedFinalPlayers = [...finalPlayers].sort((a, b) => {
        // 如果决赛有排名，按决赛排名；否则按晋级赛排名
        if (a.final.rank !== null && b.final.rank !== null) {
            return a.final.rank - b.final.rank;
        } else if (a.round3.rank !== null && b.round3.rank !== null) {
            return a.round3.rank - b.round3.rank;
        } else {
            return a.round2.rank - b.round2.rank;
        }
    });

    const podiumData = [
        { '名次': '冠军', '选手ID': sortedFinalPlayers[0]?.id || '未确定', '选手昵称': sortedFinalPlayers[0]?.name || '未确定' },
        { '名次': '亚军', '选手ID': sortedFinalPlayers[1]?.id || '未确定', '选手昵称': sortedFinalPlayers[1]?.name || '未确定' },
        { '名次': '季军', '选手ID': sortedFinalPlayers[2]?.id || '未确定', '选手昵称': sortedFinalPlayers[2]?.name || '未确定' }
    ];

    const podiumWs = XLSX.utils.json_to_sheet(podiumData);
    XLSX.utils.book_append_sheet(wb, podiumWs, '冠亚季军');

    // 生成文件名
    const date = new Date();
    const fileName = `舞立方比赛结果_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
    alert('比赛结果已成功导出为Excel文件！');
}