import StorageMgr from './StorageMgr.js';

class AchievementMgr {
  static checkAndUnlock(chapter, gameData) {
    let unlocked = [];
    switch (chapter) {
      case 'ch1':
        if (gameData.hitReef === 0) {
          if (StorageMgr.addBadge('sea_guard')) {
            unlocked.push({ id: 'sea_guard', name: '海上护航', desc: '第一章通关无撞礁' });
          }
        }
        break;
      case 'ch2':
        if (gameData.riceKg > 80) {
          if (StorageMgr.addBadge('folklover')) {
            unlocked.push({ id: 'folklover', name: '民俗体验家', desc: '第二章分米>80斤' });
          }
        }
        break;
      case 'ch3':
        if (gameData.quizCorrect === 4) {
          if (StorageMgr.addBadge('scholar')) {
            unlocked.push({ id: 'scholar', name: '书院学子', desc: '第三章答题全对' });
          }
        }
        break;
      case 'ch4':
        if (gameData.linesCorrect === 5) {
          if (StorageMgr.addBadge('genealogy_friend')) {
            unlocked.push({ id: 'genealogy_friend', name: '家谱知己', desc: '第四章连线全对' });
          }
        }
        break;
      case 'ch5':
        if (gameData.maxCombo > 30) {
          if (StorageMgr.addBadge('inheritor')) {
            unlocked.push({ id: 'inheritor', name: '非遗传承人', desc: '第五章鼓韵combo>30' });
          }
        }
        break;
      case 'ch6':
        // 检查帝踪寻觅者 (全部玩过)
        const data = StorageMgr.getData();
        let allPlayed = true;
        for (let i = 1; i <= 6; i++) {
          if (!data.chapters[`ch${i}`].played) {
            allPlayed = false;
            break;
          }
        }
        if (allPlayed) {
          if (StorageMgr.addBadge('emperor_seeker')) {
            unlocked.push({ id: 'emperor_seeker', name: '帝踪寻觅者', desc: '全部6章游戏均参与' });
          }
        }
        
        // 检查林浦守护者
        if (data.global.totalPoints > 400) {
          if (StorageMgr.addBadge('guardian')) {
            unlocked.push({ id: 'guardian', name: '林浦守护者', desc: '总积分>400' });
          }
        }
        
        // 检查双帝引路人 (所有其他称号都有)
        const allBadges = ['emperor_seeker', 'guardian', 'inheritor', 'scholar', 'folklover', 'genealogy_friend', 'sea_guard'];
        let hasAll = true;
        for (let b of allBadges) {
          if (!data.global.badges.includes(b)) {
            hasAll = false;
            break;
          }
        }
        if (hasAll) {
          if (StorageMgr.addBadge('dual_guide')) {
            unlocked.push({ id: 'dual_guide', name: '双帝引路人', desc: '满贯终极称号' });
          }
        }
        break;
    }
    
    if (unlocked.length > 0) {
      this.showToast(unlocked[0]);
    }
    return unlocked;
  }

  static showToast(badge) {
    wx.showToast({
      title: `解锁称号：${badge.name}`,
      icon: 'success',
      duration: 3000
    });
  }
}

export default AchievementMgr;
