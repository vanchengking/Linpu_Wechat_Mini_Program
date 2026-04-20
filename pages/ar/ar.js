// pages/ar/ar.js
// 林浦古村 AR 体验游戏 —— 完整六章剧情数据 + 对话引擎

// ============================================
// 完整剧情数据（按《林浦古村·故事线（调整版）》文档构建）
// 对话类型：'npc' 主NPC对话 | 'bubble' 辅助小字气泡 | 'narrator' 旁白 | 'ar_scene' AR场景描述
// ============================================

const STORY_LEVELS = [
  // ==================== 第一章：双帝入闽 ====================
  {
    id: 1,
    title: '双帝入闽',
    subtitle: '海上→林浦村口',
    desc: '幼帝流亡、兄弟相依、初抵林浦',
    npc: ['宋端宗赵昰', '宋末帝赵昺'],
    node: '海上→林浦村口（AR场景过渡）',
    special: '双人同时出场，赵昰为主对话框，赵昺为辅助气泡',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 序章·游客入村 =====
      { id: 'p0', type: 'ar_scene',
        text: '闽江之畔，有一座名叫林浦的古村。青石板路穿村而过，榕荫如盖，江风裹着墨香——你背着行囊，踏上了这条寻访之路。' },
      { id: 'p1', type: 'narrator', speaker: '你的独白',
        text: '你是远道而来的游客。旅途中听闻此村有"三代五尚书"的科举传奇，更有南宋两位小皇帝在此驻跸的传说，便决意来此一探究竟。',
        narratorStyle: 'warm' },
      { id: 'p2', type: 'ar_scene',
        text: '村口的老榕树下，石板路蜿蜒伸入古村深处。远处的牌坊、书院、家庙……每一块砖瓦似乎都在低声诉说着什么。' },
      { id: 'p3', type: 'narrator', speaker: '你的独白',
        text: '你走近尚书里石牌坊，指尖无意间触碰了冰凉的石柱——',
        narratorStyle: 'warm' },
      { id: 'p4', type: 'ar_scene',
        text: '刹那间，光影晃动。耳边传来了孩子的哭声和海浪的呼啸——眼前的林浦村开始褪色，取而代之的是一片烟波浩渺的大海……' },
      { id: 'p5', type: 'narrator', speaker: '你的独白',
        text: '石柱触手的刹那，你仿佛穿越了八百年的光阴——两道幼小的身影浮现在眼前。他们是谁？为何在这惊涛骇浪之中？……故事，就这样在你眼前展开。',
        narratorStyle: 'distant' },
      // 第1轮·海上漂泊
      {
        id: 0, type: 'ar_scene',
        text: '烟波浩渺的海面，一叶扁舟在风浪中颠簸。稍高的孩童身着暗黄龙袍（赵昰），稍矮的紧拽兄长衣角（赵昺）。远处元军追兵旌旗若隐若现。'
      },
      {
        id: 1, type: 'npc', speaker: '赵昰',
        npcImage: '', // 预留 NPC 立绘图片路径
        text: '昺儿，别怕。前面就是福州了。再坚持一下。'
      },
      {
        id: 2, type: 'bubble', speaker: '赵昺',
        text: '皇兄……我们还要走多久？'
      },
      {
        id: 3, type: 'npc', speaker: '赵昰',
        text: '等到上岸的那一天，我们就能歇脚了。陆先生说……福州有个叫林浦的地方，那里的人会接纳我们。',
        options: [
          { text: '陆先生是谁？', nextId: 4 },
          { text: '你们从哪里来？', nextId: 6 }
        ]
      },
      // 第2轮A（选"陆先生是谁"）
      {
        id: 4, type: 'npc', speaker: '赵昰',
        text: '陆秀夫陆先生。他一直护着我和弟弟。临安陷落的时候，是陆先生和张世杰将军带着我们从海上逃出来的。……朕……不，我有时候想，如果没有他们，我和弟弟早就不在了。'
      },
      {
        id: 5, type: 'bubble', speaker: '赵昺',
        text: '陆先生对我很好，他把自己的衣服给我穿。',
        options: [
          { text: '听起来很不容易', nextId: 8 },
          { text: '后来你们到了林浦吗？', nextId: 8 }
        ]
      },
      // 第2轮B（选"你们从哪里来"）
      {
        id: 6, type: 'npc', speaker: '赵昰',
        text: '从临安……从我们的家。元兵攻陷临安的时候，我才八岁，弟弟才六岁。父皇把我们交给了陆先生，然后就……我们就再也见不到父皇了。',
        side: 'look_far'
      },
      {
        id: 7, type: 'npc', speaker: '赵昰',
        text: '别怕，皇兄在这里。',
        after: { type: 'bubble', speaker: '赵昺', text: '我想母后……' },
        options: [
          { text: '你们真是受苦了', nextId: 8 },
          { text: '快靠岸了吗？', nextId: 8 }
        ]
      },
      // 第3轮·初到林浦
      {
        id: 8, type: 'ar_scene',
        text: '海浪推动小船靠岸，画面渐变——古代林浦村的轮廓从薄雾中浮现，村民夹道跪迎，两幼帝在臣僚簇拥下步入村落。'
      },
      {
        id: 9, type: 'narrator', speaker: '旁白',
        text: '公元1277年冬，两位年幼的皇帝踏入了这座名叫"林浦"的小村庄。',
        narratorStyle: 'warm'
      },
      {
        id: 10, type: 'npc', speaker: '赵昰',
        text: '此处山水相依，倒是个安身之所。'
      },
      {
        id: 11, type: 'bubble', speaker: '赵昺',
        text: '皇兄你看！那边的房子好大！还有那座桥！'
      },
      {
        id: 12, type: 'npc', speaker: '赵昰',
        text: '那是濂江书院。待局势安稳了，便送你去念书。'
      },
      {
        id: 13, type: 'npc', speaker: '赵昺',
        text: '真的吗？我要读书！我要像……像那些大人一样厉害！',
        isMain: false
      },
      {
        id: 14, type: 'npc', speaker: '赵昰',
        text: '好。那我们就在这里住下吧。——这里的老百姓，看起来很善良。'
      },
      {
        id: 15, type: 'narrator', speaker: '旁白',
        text: '他们不会想到，这一驻跸，便是这片土地八百年传奇的开始。',
        narratorStyle: 'warm'
      },
      {
        id: 16, type: 'narrator', speaker: '你的独白',
        text: '海上的画面渐渐模糊，你又回到了现实中的林浦村口。方才的景象恍如一梦——可手心残留的石柱冰凉触感，却如此真实。',
        narratorStyle: 'warm'
      },
      {
        id: 17, type: 'narrator', speaker: '你的独白',
        text: '你隐约觉得，这座古村的每一处角落，都可能藏着通往那段历史的窗口。不如继续走走看……',
        narratorStyle: 'warm'
      },
      {
        id: 18, type: 'npc', speaker: '赵昰',
        text: '',
        options: [
          { text: '去前面牌坊看看', nextId: -1, action: 'unlock_next', actionText: '解锁第二章，跳转尚书里石牌坊（古村长迎接）' },
          { text: '记下方才的所见', nextId: -1, action: 'unlock_next_bonus', actionText: '解锁第二章，同时获得「帝踪寻觅者」碎片①' }
        ],
        isFinal: true
      }
    ]
  },

  // ==================== 第二章：初识林浦 ====================
  {
    id: 2,
    title: '初识林浦',
    subtitle: '尚书里石牌坊',
    desc: '千年林浦、牌坊来历、分米活动',
    npc: ['古村长'],
    node: '尚书里石牌坊',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 章节过渡 =====
      { id: 't0', type: 'narrator', speaker: '你的独白',
        text: '海上的幻影散去，你回到了现实中的林浦村口。阳光洒在石牌坊上，一位老人正笑眯眯地向你走来——方才所见如梦似幻，但眼前这座古村分明是真实的。',
        narratorStyle: 'warm' },
      {
        id: 0, type: 'npc', speaker: '古村长',
        npcImage: '', // 预留 NPC 立绘图片路径
        text: '哎呀，稀客稀客！欢迎来到林浦村！老朽是这里的村长，你叫我古村长就好。刚刚……你有没有听到什么声音？像是小孩子在说话……算了，可能是老头子耳朵花了。（摇摇头）你看这"尚书里"牌坊，可是我们林浦的骄傲啊。',
        options: [
          { text: '这里为什么叫尚书里？', nextId: 1 },
          { text: '林浦还有哪些值得看的地方？', nextId: 3 },
          { text: '林氏是怎么做到的？', nextId: 5 },
          { text: '南宋皇帝来过这里？', nextId: 7 },
          { text: '什么是安南伬？', nextId: 9 }
        ]
      },
      // 第2轮A
      {
        id: 1, type: 'npc', speaker: '古村长',
        text: '这牌坊是明隆庆年间皇帝赐修的。上面刻着林氏"三代五尚书"的名字——林瀚、林庭㭿、林庭机、林燫、林烃。一门三代，五尚书，七科八进士！《明史》都夸赞说"明代三世五尚书，并得谥文，林氏一家而已"。',
        options: [
          { text: '第一次听说，太神奇了！', nextId: 11 },
          { text: '林氏是怎么做到的？', nextId: 5 }
        ]
      },
      // 第2轮B
      {
        id: 3, type: 'npc', speaker: '古村长',
        text: '多着呢！濂江书院有朱老夫子讲学，家庙里有林氏祖训，泰山宫是南宋皇帝住过的行宫。还有进士木牌坊、安南伬演奏、踩街游神……你顺着这条路慢慢走，每一块石板都有故事。对了，（压低声音）听说以前有两位小皇帝在这儿住过呢……',
        options: [
          { text: '南宋皇帝来过这里？', nextId: 7 },
          { text: '什么是安南伬？', nextId: 9 }
        ]
      },
      // 第2轮C（选"林氏是怎么做到的"）
      {
        id: 5, type: 'npc', speaker: '古村长',
        text: '靠的是家风。林氏有"四正文化"——养正心、崇正道、务正学、亲正人。做官先做人，清廉是本。后来林瀚还写了"四知堂"，取自杨震"天知地知你知我知"。',
        options: [
          { text: '原来如此！', nextId: 11 },
          { text: '下一站去哪里？', nextId: 11 }
        ]
      },
      // 第2轮D（选"南宋皇帝来过这里"）
      {
        id: 7, type: 'npc', speaker: '古村长',
        text: '来过！1276年，元兵攻陷临安，陆秀夫、张世杰护着两个小皇帝从海上逃到林浦，就在泰山宫住下了。后来就在这里拥立端宗皇帝，改元景炎。可惜……后来崖山一战，全军覆没。唉，两位小皇帝啊……一个病死，一个……跳海了。才几岁的孩子……',
        options: [
          { text: '后来怎么样了？', nextId: 11 },
          { text: '崖山在哪里？', nextId: 11 }
        ]
      },
      // 第2轮E（选"什么是安南伬"）
      {
        id: 9, type: 'npc', speaker: '古村长',
        text: '那是咱们林浦的宝贝！从安南国传来的鼓乐，南宋皇帝带来的乐师教给咱们的。你听那鼓点——咚咚咚，像不像战鼓？每逢节庆，整条街都震起来！还有踩街游神，抬着泰山神像巡游，可热闹了！',
        options: [
          { text: '听起来真热闹！', nextId: 11 },
          { text: '我能参加吗？', nextId: 11 }
        ]
      },
      // 第3轮（最终引导）
      {
        id: 11, type: 'npc', speaker: '古村长',
        text: '去走走看吧，这林浦的旅程，就从这牌坊开始。对了，你知道吗？林浦元宵还有"分米"的习俗。当年陈宜中丞相把军粮分给百姓，百姓感念他的恩德，每年都分米纪念。你来得巧，还能赶上！前面就是濂江书院了，朱老夫子可能还在那儿讲课呢。',
        options: [
          { text: '好的，我这就去', nextId: -1, action: 'unlock_next', actionText: '解锁第三章，跳转濂江书院' },
          { text: '再聊一会儿', nextId: 0 }
        ],
        isFinal: true
      }
    ]
  },

  // ==================== 第三章：书院论道 ====================
  {
    id: 3,
    title: '书院论道',
    subtitle: '濂江书院',
    desc: '朱熹讲学、格物致知、文脉传承',
    npc: ['朱熹'],
    node: '濂江书院',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 章节过渡 =====
      { id: 't0', type: 'narrator', speaker: '你的独白',
        text: '告别古村长，你沿着石板路向山上走去。一座古朴的书院映入眼帘——濂江书院，福州唯一保存至今的古书院。不知为何，越往村中走，那穿越时空的感应越发强烈。',
        narratorStyle: 'warm' },
      {
        id: 0, type: 'npc', speaker: '朱熹',
        text: '老夫朱熹。当年游历至此，见此地山水清秀，学子勤勉，便在此讲学数载。这濂江书院，是福州唯一保存至今的古书院。——嗯？方才似乎有两个孩童的身影从门口经过……莫非是错觉？（抚须沉思）',
        options: [
          { text: '朱子在这里讲了什么？', nextId: 1 },
          { text: '林氏子弟也在这里读书吗？', nextId: 3 }
        ]
      },
      // 第2轮A
      {
        id: 1, type: 'npc', speaker: '朱熹',
        text: '老夫教他们"格物致知"——探究万物，获得真知。你看那照壁上"文光射斗"四字，便是老夫对学子们的期许。还有那石臼，是师生洗笔之处，旁刻"知鱼乐"，出自庄子——读书要用心体会。',
        options: [
          { text: '先生说得真好', nextId: 5 },
          { text: '下一站去哪里？', nextId: 5 }
        ]
      },
      // 第2轮B
      {
        id: 3, type: 'npc', speaker: '朱熹',
        text: '正是。林氏子弟多在此求学。勤勉、踏实，后来的三代五尚书，皆受此风熏陶。老夫常说"读书使人明理"，林氏做到了。先有学风，后有科举荣光。——听闻后来有两位年幼的客人在此驻留过，可惜老夫那时已不在了。',
        options: [
          { text: '原来林氏的文脉从这里开始', nextId: 5 },
          { text: '下一站去哪里？', nextId: 5 }
        ]
      },
      // 第3轮
      {
        id: 5, type: 'npc', speaker: '朱熹',
        text: '去世公保尚书家庙吧。那里是林氏家族的根，有"四正文化"传家。尚书伯林瀚会告诉你更多关于林氏家训的故事。',
        options: [
          { text: '多谢先生指引', nextId: -1, action: 'unlock_next', actionText: '解锁第四章，跳转家庙' },
          { text: '再请教一个问题', nextId: 0 }
        ],
        isFinal: true
      }
    ]
  },

  // ==================== 第四章：家庙荣光 ====================
  {
    id: 4,
    title: '家庙荣光',
    subtitle: '世公保尚书家庙',
    desc: '三代五尚书、四正文化、家族荣耀',
    npc: ['尚书伯（林瀚）'],
    node: '世公保尚书家庙',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 章节过渡 =====
      { id: 't0', type: 'narrator', speaker: '你的独白',
        text: '朱老夫子的话还回荡在耳边。你转身走下山坡，一座庄严肃穆的家庙矗立在眼前——世公保尚书家庙。在这里，你再次隐约瞥见两个孩童的影子掠过门廊。',
        narratorStyle: 'warm' },
      {
        id: 0, type: 'npc', speaker: '尚书伯',
        text: '老夫尚书伯，林瀚。此处是我林氏家庙。按明制，三品以上官员方可建家庙。我官至南京兵部尚书，正二品，故有此规制。——客人从何处来？可曾去过前面的书院？朱老夫子的学问，老夫也是敬佩得很。',
        options: [
          { text: '三代五尚书是哪五位？', nextId: 1 },
          { text: '什么是"四正文化"？', nextId: 3 }
        ]
      },
      // 第2轮A
      {
        id: 1, type: 'npc', speaker: '尚书伯',
        text: '我父林元美（赠尚书），我林瀚，长子庭㭿，次子庭机，孙林燫。一门三代，五尚书，七科八进士。你看这门前"乌纱池"，形如官帽，寓意官运亨通。不过嘛……终究要靠真才实学。',
        options: [
          { text: '尚书伯教诲的是', nextId: 5 },
          { text: '下一站去哪里？', nextId: 5 }
        ]
      },
      // 第2轮B
      {
        id: 3, type: 'npc', speaker: '尚书伯',
        text: '养正心、崇正道、务正学、亲正人。此四正，是我林氏家训之本。我以此教育子孙，做官先做人，清廉是本。你看这"四知堂"，取自杨震"天知地知你知我知"，一生自勉。',
        options: [
          { text: '受益匪浅', nextId: 5 },
          { text: '下一站去哪里？', nextId: 5 }
        ]
      },
      // 第3轮
      {
        id: 5, type: 'npc', speaker: '尚书伯',
        text: '去街巷里走走吧。那里有老艺人在敲安南伬，还有踩街游神。咱们林浦的民俗，不比京城差。对了，听说进士木牌坊那里有时会有……一位故人出现。一位小小的故人。',
        options: [
          { text: '好的，我这就去', nextId: -1, action: 'unlock_next', actionText: '解锁第五章，跳转街巷' },
          { text: '再请教一个家训', nextId: 0 }
        ],
        isFinal: true
      }
    ]
  },

  // ==================== 第五章：非遗传承 ====================
  {
    id: 5,
    title: '非遗传承',
    subtitle: '林浦街巷',
    desc: '安南伬、踩街游神、分米活动',
    npc: ['老艺人（更夫）'],
    node: '林浦街巷 / 游神路线',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 章节过渡 =====
      { id: 't0', type: 'narrator', speaker: '你的独白',
        text: '尚书伯的谆谆教诲让你肃然起敬。走出家庙，街巷里忽然传来了咚咚的鼓声——热闹非凡！你仿佛又听见两位小皇帝在这街巷中嬉笑的回声。',
        narratorStyle: 'warm' },
      {
        id: 0, type: 'npc', speaker: '老艺人',
        text: '小伙子来得巧！再过几天就是元宵，咱们林浦的"迎泰山"游神可热闹了！还有安南伬，那鼓点一响，整条街都震起来！我是这里的更夫，也是敲鼓的，你叫我老艺人就行。',
        options: [
          { text: '什么是安南伬？', nextId: 1 },
          { text: '踩街游神是什么？', nextId: 3 },
          { text: '分米活动是怎么回事？', nextId: 5 }
        ]
      },
      // 第2轮A
      {
        id: 1, type: 'npc', speaker: '老艺人',
        text: '那是从安南国传来的鼓乐！南宋皇帝逃到林浦的时候，随行的乐师把这音乐教给了咱们。你听——（模仿鼓点）咚咚咚，咚咚咚！像不像战鼓？每逢节庆，我们就在街上敲起来，整条街都跟着跳！',
        options: [
          { text: '这鼓声真带劲！', nextId: 7 },
          { text: '还有其他乐器吗？', nextId: 2 }
        ]
      },
      {
        id: 2, type: 'npc', speaker: '老艺人',
        text: '有！战鼓、唢呐、椰胡、大锣小锣……十几样呢！我们有一首老曲子叫《一枝花》，从宋朝传下来的。你听那唢呐一响，眼泪都要掉下来。',
        options: [
          { text: '真想去听听！', nextId: 7 },
          { text: '下一站去哪里？', nextId: 7 }
        ]
      },
      // 第2轮B
      {
        id: 3, type: 'npc', speaker: '老艺人',
        text: '抬着泰山神像巡游！全村人都出来，敲锣打鼓，放鞭炮。神像经过的时候，大家都要鞠躬祈福。还有人在前面跳"塔骨"，那神将可高了，有三米多！你看了准忘不了！',
        options: [
          { text: '泰山神像是什么？', nextId: 4 },
          { text: '塔骨是什么？', nextId: 6 }
        ]
      },
      {
        id: 4, type: 'npc', speaker: '老艺人',
        text: '泰山神像其实就是宋高宗赵构！当年元兵追查宋室遗孤，乡人不敢明祭，就借"泰山"之名，以神像代君臣。正殿里那尊大佛，其实是宋高宗，两边童子就是端宗和少帝。——所以咱们每次游神，其实也是在祭拜那两位小皇帝。',
        options: [
          { text: '原来是这样！', nextId: 7 },
          { text: '下一站去哪里？', nextId: 7 }
        ]
      },
      {
        id: 6, type: 'npc', speaker: '老艺人',
        text: '塔骨就是神将的骨架，用竹篾扎的，外面糊纸，画上神像。人钻进去，扛着走。那神将可高了，走起来一晃一晃的，小孩子看了又怕又爱看！',
        options: [
          { text: '真有意思！', nextId: 7 },
          { text: '下一站去哪里？', nextId: 7 }
        ]
      },
      // 第2轮C
      {
        id: 5, type: 'npc', speaker: '老艺人',
        text: '那可是咱们林浦的老传统！当年陈宜中丞相把军粮分给百姓，百姓感念他的恩德，每年元宵都分米纪念。你来得巧，到时候领一袋米，保你一年平安！',
        options: [
          { text: '陈宜中是谁？', nextId: 6 },
          { text: '我到时候一定来！', nextId: 7 }
        ]
      },
      {
        id: 6, type: 'npc', speaker: '老艺人',
        text: '陈宜中，南宋丞相。当年他跟着小皇帝逃到林浦，临走前把军粮分给百姓。后来传说他跳海殉国了。林浦人感念他，给他建了祠堂，每年分米纪念。乡亲们都说——"义重山丘陈宜中"！',
        options: [
          { text: '真是忠臣！', nextId: 7 },
          { text: '他的祠堂在哪里？', nextId: 7 }
        ]
      },
      // 第3轮（引导至终章）
      {
        id: 7, type: 'npc', speaker: '老艺人',
        text: '好了，我得去敲鼓了。你去进士木牌坊看看吧。听说那里有时会有……一个小故人出现。七岁的那种。（神秘地笑了笑）你去了就知道。——哦对了，有人说在那边不光能看到那位小的，说不定还能遇到……另一位。去吧，最后的路，得你自己走了。',
        options: [
          { text: '好的，我这就去', nextId: -1, action: 'unlock_next', actionText: '解锁第六章「帝魂重逢」，跳转进士木牌坊→泰山宫' },
          { text: '再讲一个民俗', nextId: 0 }
        ],
        isFinal: true
      }
    ]
  },

  // ==================== 第六章：帝魂重逢 ====================
  {
    id: 6,
    title: '帝魂重逢',
    subtitle: '进士木牌坊→泰山宫',
    desc: '兄弟重逢、崖山遗恨、托付后人',
    npc: ['赵昺', '赵昰'],
    node: '进士木牌坊 → 泰山宫（平山堂）',
    special: '赵昺半透明灵魂形态先行出场，赵昰随后在泰山宫现身，最终双帝短暂同框',
    bgImage: 'https://bl.meishipay.com/images/background/background.png',
    dialogues: [
      // ===== 章节过渡 =====
      { id: 't0', type: 'narrator', speaker: '你的独白',
        text: '鼓声渐远，暮色降临。你沿着老街走向村尾的进士木牌坊——老艺人的话在你心里萦绕：那里会有一位"小小的故人"等你。此刻，你已不再怀疑这座古村与八百年前的血脉相连。',
        narratorStyle: 'warm' },
      // 第1轮·牌坊寻影
      {
        id: 0, type: 'ar_scene',
        text: '进士木牌坊下，黄昏光影。一个半透明的小孩身影站在牌坊柱旁，边缘泛着淡淡的金色微光。'
      },
      {
        id: 1, type: 'npc', speaker: '赵昺',
        npcImage: '', // 预留 NPC 立绘图片路径
        text: '朕……好冷。这里是……进士牌坊吗？朕好像来过这里……又好像没有。朕记得……那天船翻了，好多叔叔掉进水里。陆先生抱着朕，说"陛下别怕"。可是朕好怕……',
        ghostMode: true,
        options: [
          { text: '你是谁？', nextId: 2 },
          { text: '不要怕，这里很安全', nextId: 6 }
        ]
      },
      // 第2轮A
      {
        id: 2, type: 'npc', speaker: '赵昺',
        text: '朕是赵昺……宋少帝赵昺。那年朕才七岁。元兵的船好大，我们的船好小。朕听到好多人在哭……陆先生背着朕跳海的时候，水好冷。朕看到岸上的人都在哭…',
        ghostMode: true
      },
      {
        id: 3, type: 'npc', speaker: '赵昺',
        text: '等等……这个气息……（颤抖）皇兄？！皇兄是你吗？！皇兄——！！',
        ghostMode: true,
        side: 'excited'
      },
      {
        id: 4, type: 'ar_scene',
        text: '牌坊上方金光微闪，一个稍高的身影缓缓凝聚。'
      },
      {
        id: 5, type: 'npc', speaker: '赵昰',
        text: '昺儿……是你吗？',
        ghostMode: true,
        newNpcAppear: true
      },
      {
        id: 10, type: 'npc', speaker: '赵昺',
        text: '皇兄！！朕找你好久！朕好想你！',
        ghostMode: true,
        options: [
          { text: '（静静看着两兄弟重逢）', nextId: 12 },
          { text: '崖山那天发生了什么？', nextId: 12 }
        ]
      },
      // 第2轮B（选"不要怕，这里很安全"）
      {
        id: 6, type: 'npc', speaker: '赵昺',
        text: '真的吗？朕好想再看一眼太阳……林浦的百姓对朕很好，送大米给朕吃。朕想谢谢他们。可是朕找不到哥哥了。哥哥在哪里？朕好想哥哥……',
        ghostMode: true
      },
      {
        id: 7, type: 'ar_scene',
        text: '此时天空微微一亮。'
      },
      {
        id: 8, type: 'npc', speaker: '赵昰',
        text: '昺儿……朕在这里。',
        ghostMode: true,
        side: 'distant'
      },
      {
        id: 9, type: 'npc', speaker: '赵昺',
        text: '皇兄——？！',
        ghostMode: true,
        side: 'excited'
      },
      {
        id: 11, type: 'ar_scene',
        text: '赵昰的身影从光芒中走出，兄弟相望。',
        options: [
          { text: '（静静看着两兄弟重逢）', nextId: 12 },
          { text: '你是赵昰皇帝吗？', nextId: 12 }
        ]
      },
      // 第3轮·兄弟叙旧（双帝同台）
      {
        id: 12, type: 'ar_scene',
        text: '两人并肩站立，赵昺矮半个头，紧紧抓着赵昰的袖子。'
      },
      {
        id: 13, type: 'npc', speaker: '赵昰',
        text: '昺儿，朕……皇兄一直在平山堂等你。皇兄知道你会回来的。林浦的百姓也一直在等。',
        ghostMode: true
      },
      {
        id: 14, type: 'npc', speaker: '赵昺',
        text: '皇兄，陆先生……陆先生他……',
        ghostMode: true
      },
      {
        id: 15, type: 'npc', speaker: '赵昰',
        text: '皇兄知道。陆先生是忠臣。他背负着你跳海的时候，皇兄在天上看着。皇兄不怪他。',
        ghostMode: true
      },
      {
        id: 16, type: 'npc', speaker: '赵昺',
        text: '可是皇兄你……你才九岁就……你在碙洲一个人……一定很害怕……',
        ghostMode: true
      },
      {
        id: 17, type: 'npc', speaker: '赵昰',
        text: '怕。当然怕。但皇兄更怕的是……保护不了你。',
        ghostMode: true
      },
      {
        id: 18, type: 'ar_scene',
        text: '两人沉默片刻。'
      },
      {
        id: 19, type: 'npc', speaker: '赵昺',
        text: '你……你是林浦的百姓吗？还是……从很远的地方来的？',
        ghostMode: true,
        options: [
          { text: '我是来这里游览的', nextId: 20 },
          { text: '我替林浦的百姓来看你们', nextId: 22 }
        ]
      },
      // 第4轮A1
      {
        id: 20, type: 'npc', speaker: '赵昰',
        text: '那就好好看看这里吧。每一块砖，每一片瓦，都有故事。',
        ghostMode: true
      },
      {
        id: 21, type: 'npc', speaker: '赵昺',
        text: '对！皇兄带我看过濂江书院！那里的书好大本！还有……还有那个敲鼓的老爷爷，他的鼓声可好听了！',
        ghostMode: true,
        isMain: false
      },
      {
        id: 25, type: 'npc', speaker: '赵昰',
        text: '这些，都是林浦留给我们的记忆。现在，交给你们了。',
        ghostMode: true,
        options: [
          { text: '我们会记住的', nextId: 26 },
          { text: '你们还有什么心愿？', nextId: 26 }
        ]
      },
      // 第4轮B1
      {
        id: 22, type: 'npc', speaker: '赵昰',
        text: '替朕……替我们谢过林浦的乡亲。八百年了，他们还记得。每年元宵分米，每年游神巡境……他们用这种方式，一直记着我们。',
        ghostMode: true
      },
      {
        id: 23, type: 'npc', speaker: '赵昺',
        text: '嗯！那个老村长说，"皇帝住过的地方，就要守好"！林浦的人真好！',
        ghostMode: true,
        isMain: false
      },
      {
        id: 24, type: 'npc', speaker: '赵昰',
        text: '那么，能否请帮我们一件事？',
        ghostMode: true,
        options: [
          { text: '当然，请说', nextId: 26 },
          { text: '什么事？', nextId: 26 }
        ]
      },
      // 第5轮·托付与告别
      {
        id: 26, type: 'npc', speaker: '赵昰',
        text: '告诉林浦的孩子们——好好读书，勇敢做人。不要忘记历史，也不要被历史困住。这片土地的未来，在他们手里。',
        ghostMode: true
      },
      {
        id: 27, type: 'npc', speaker: '赵昺',
        text: '还有还有！告诉他们……要开心！就像……就像我们在林浦的那些日子一样。虽然很短，但是……很开心。',
        ghostMode: true,
        isMain: false
      },
      {
        id: 28, type: 'npc', speaker: '赵昰',
        text: '该走了，昺儿。',
        ghostMode: true
      },
      {
        id: 29, type: 'npc', speaker: '赵昺',
        text: '再见……林浦。再见……',
        ghostMode: true,
        isMain: false
      },
      {
        id: 30, type: 'ar_scene',
        text: '两人的身影开始缓缓消散，朝泰山宫方向飘去。与此同时，他们的轮廓与现代林浦村的画面叠加——村民们走过石板路，孩子在广场上玩耍，老人坐在榕树下聊天。',
        isClimax: true
      },
      {
        id: 31, type: 'narrator', speaker: '旁白',
        text: '帝踪已远。可故事没有结束——因为每一个来到林浦的人，都在续写着它。',
        narratorStyle: 'warm'
      },
      {
        id: 32, type: 'narrator', speaker: '赵昰',
        text: '会回来的。也许不是我们……但一定会有人回来，记住这里的一切。',
        narratorStyle: 'distant'
      },
      // 终幕·成就揭示
      {
        id: 33, type: 'ending',
        text: '帝踪已远 · 故事由你续写',
        subtitle: '濂水绕林浦 · 故事传千年'
      }
    ]
  }
];

Page({
  data: {
    currentView: 'levels', // 'levels' | 'playing' | 'ending'
    isARMode: false,
    showSuccessModal: false,
    showEndingView: false,
    currentLevelIndex: 0,
    currentDialogueId: 0,
    currentDialogue: null,
    levels: [],
    completedCount: 0,
    currentPreviewIndex: 0,
    // 统计数据
    stats: {
      landmarksVisited: 0,
      intangibleHeritage: 0,
      dialogueCount: 0,
      totalPoints: 0
    },
    // 终幕数据
    endingData: null
  },

  onLoad() {
    this.initLevels();
    this.updateCompletedCount();
  },

  onShow() {
    this.loadProgress();
    this.updateCompletedCount();
  },

  onUnload() {
    this.stopAR();
  },

  // ========== 初始化 ==========

  initLevels() {
    const saved = wx.getStorageSync('ar_game_progress_v3');
    if (saved) {
      this.setData({ levels: saved });
    } else {
      const levels = STORY_LEVELS.map(lv => ({
        id: lv.id,
        title: lv.title,
        subtitle: lv.subtitle,
        desc: lv.desc,
        npc: lv.npc,
        node: lv.node,
        special: lv.special || '',
        bgImage: lv.bgImage,
        unlocked: lv.id === 1,
        completed: false,
        dialogues: lv.dialogues
      }));
      this.setData({ levels: levels });
    }
  },

  loadProgress() {
    const progress = wx.getStorageSync('ar_game_progress_v3');
    if (progress) {
      // 保留 unlocked/completed 状态，dialogues 用完整数据
      const merged = STORY_LEVELS.map((template, i) => {
        const saved = progress.find(l => l.id === template.id);
        return {
          id: template.id,
          title: template.title,
          subtitle: template.subtitle,
          desc: template.desc,
          npc: template.npc,
          node: template.node,
          special: template.special || '',
          bgImage: template.bgImage,
          unlocked: saved ? saved.unlocked : template.id === 1,
          completed: saved ? saved.completed : false,
          dialogues: template.dialogues
        };
      });
      this.setData({ levels: merged });
    }
    this.loadStats();
  },

  loadStats() {
    const stats = wx.getStorageSync('ar_game_stats') || {
      landmarksVisited: 0,
      intangibleHeritage: 0,
      dialogueCount: 0,
      totalPoints: 0
    };
    this.setData({ stats });
  },

  saveProgress() {
    const saveData = this.data.levels.map(lv => ({
      id: lv.id,
      title: lv.title,
      subtitle: lv.subtitle,
      desc: lv.desc,
      npc: lv.npc,
      node: lv.node,
      special: lv.special,
      bgImage: lv.bgImage,
      unlocked: lv.unlocked,
      completed: lv.completed
    }));
    wx.setStorageSync('ar_game_progress_v3', saveData);
  },

  saveStats() {
    wx.setStorageSync('ar_game_stats', this.data.stats);
  },

  updateCompletedCount() {
    const count = this.data.levels.filter(l => l.completed).length;
    this.setData({ completedCount: count });
  },

  // ========== 导航 ==========

  startLevel(e) {
    const levelId = e.currentTarget.dataset.id;
    const index = this.data.levels.findIndex(l => l.id === levelId);
    if (index === -1 || !this.data.levels[index].unlocked) return;

    const level = this.data.levels[index];
    const firstDialogue = level.dialogues[0];

    this.setData({
      currentView: 'playing',
      currentLevelIndex: index,
      currentDialogueId: firstDialogue.id,
      currentDialogue: firstDialogue
    });

    // 更新对话计数
    this.addDialogueCount();
  },

  previewLevel(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== undefined) {
      this.setData({ currentPreviewIndex: index });
    }
    wx.showToast({ title: '完成前置章节后解锁', icon: 'none', duration: 1200 });
  },

  backToLevels() {
    this.setData({
      currentView: 'levels',
      showSuccessModal: false,
      showEndingView: false,
      currentDialogue: null
    });
    this.stopAR();
  },

  exitGame() {
    wx.showModal({
      title: '退出章节',
      content: '当前进度已自动保存，确认退出？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ currentView: 'levels', currentDialogue: null });
          this.stopAR();
        }
      }
    });
  },

  // ========== 对话引擎 ==========

  nextDialogue() {
    const { currentLevelIndex, currentDialogueId, levels, currentDialogue } = this.data;

    // 有选项时必须选择
    if (currentDialogue && currentDialogue.options && currentDialogue.options.length > 0) {
      return;
    }

    // 终幕特殊处理
    if (currentDialogue && currentDialogue.type === 'ending') {
      this.showEnding();
      return;
    }

    const level = levels[currentLevelIndex];
    const dialogues = level.dialogues;
    const currentIdx = dialogues.findIndex(d => d.id === currentDialogueId);

    if (currentIdx === -1 || currentIdx + 1 >= dialogues.length) {
      // 章节结束
      this.completeLevel();
      return;
    }

    const nextDialogue = dialogues[currentIdx + 1];

    // 处理 after 附加气泡
    if (nextDialogue.after) {
      this.setData({
        currentDialogueId: nextDialogue.id,
        currentDialogue: {
          ...nextDialogue,
          afterBubble: nextDialogue.after
        }
      });
    } else {
      this.setData({
        currentDialogueId: nextDialogue.id,
        currentDialogue: nextDialogue
      });
    }

    this.addDialogueCount();
  },

  selectOption(e) {
    const option = e.currentTarget.dataset.option;
    const { currentLevelIndex, levels } = this.data;
    const level = levels[currentLevelIndex];

    // 选项动作处理
    if (option.action) {
      this.handleOptionAction(option, currentLevelIndex);
      return;
    }

    // 跳转到指定对话
    if (option.nextId !== undefined && option.nextId !== -1) {
      const targetDialogue = level.dialogues.find(d => d.id === option.nextId);
      if (targetDialogue) {
        // 处理 after 附加气泡
        if (targetDialogue.after) {
          this.setData({
            currentDialogueId: targetDialogue.id,
            currentDialogue: {
              ...targetDialogue,
              afterBubble: targetDialogue.after
            }
          });
        } else {
          this.setData({
            currentDialogueId: targetDialogue.id,
            currentDialogue: targetDialogue
          });
        }
        this.addDialogueCount();
      }
    }
  },

  dismissAfterBubble() {
    this.setData({
      'currentDialogue.afterBubble': null
    });
  },

  handleOptionAction(option, currentLevelIndex) {
    if (option.action === 'unlock_next') {
      this.completeAndUnlock(currentLevelIndex);
    } else if (option.action === 'unlock_next_bonus') {
      this.completeAndUnlockBonus(currentLevelIndex);
    }
  },

  // ========== 章节完成 ==========

  completeLevel() {
    this.setData({ showSuccessModal: true });
  },

  completeAndUnlock(levelIndex) {
    const newLevels = [...this.data.levels];
    newLevels[levelIndex].completed = true;
    if (levelIndex + 1 < newLevels.length) {
      newLevels[levelIndex + 1].unlocked = true;
    }
    this.setData({
      levels: newLevels,
      showSuccessModal: true
    });
    this.updateCompletedCount();
    this.saveProgress();
    this.recordLevelComplete(levelIndex);
  },

  completeAndUnlockBonus(levelIndex) {
    const newLevels = [...this.data.levels];
    newLevels[levelIndex].completed = true;
    if (levelIndex + 1 < newLevels.length) {
      newLevels[levelIndex + 1].unlocked = true;
    }
    this.setData({
      levels: newLevels,
      showSuccessModal: true
    });
    this.updateCompletedCount();
    this.saveProgress();
    this.recordLevelComplete(levelIndex);
    // 额外奖励：帝踪寻觅者碎片
    try {
      let userData = wx.getStorageSync('linpu_user_data') || { totalExp: 0 };
      userData.emperorFragment1 = true;
      userData.totalExp = (userData.totalExp || 0) + 50;
      wx.setStorageSync('linpu_user_data', userData);
    } catch (e) {
      console.log('记录碎片失败:', e);
    }
  },

  recordLevelComplete(levelIndex) {
    try {
      let userData = wx.getStorageSync('linpu_user_data') || { totalExp: 0 };
      userData.totalExp = (userData.totalExp || 0) + 30;
      userData.arScanned = (userData.arScanned || 0) + 1;

      let progressCache = wx.getStorageSync('linpu_progress_cache') || {};
      progressCache.arScanned = userData.arScanned;
      wx.setStorageSync('linpu_progress_cache', progressCache);
      wx.setStorageSync('linpu_user_data', userData);

      // 积分发放（每章只一次）
      const arPointsKey = `ar_points_level_${levelIndex}`;
      if (!wx.getStorageSync(arPointsKey)) {
        getApp().addPoints && getApp().addPoints(100, `完成AR游戏章节：${this.data.levels[levelIndex].title}`);
        wx.setStorageSync(arPointsKey, true);
      }
    } catch (e) {
      console.log('记录完成失败:', e);
    }
  },

  // ========== 终幕 ==========

  showEnding() {
    // 标记第六章（终章）为已完成
    const newLevels = [...this.data.levels];
    const lastIdx = newLevels.length - 1;
    if (!newLevels[lastIdx].completed) {
      newLevels[lastIdx].completed = true;
      this.setData({ levels: newLevels });
      this.updateCompletedCount();
      this.saveProgress();
      this.recordLevelComplete(lastIdx);
    }

    const stats = {
      ...this.data.stats,
      landmarksVisited: this.data.levels.filter(l => l.completed).length
    };

    this.setData({
      currentView: 'ending',
      showEndingView: true,
      endingData: {
        motto: '帝踪已远 · 故事由你续写',
        footer: '濂水绕林浦 · 故事传千年',
        stats: stats,
        achievements: this.getAchievements(stats)
      }
    });

    // 全章节完成奖励
    const allCompleted = this.data.levels.every(l => l.completed);
    if (allCompleted) {
      try {
        let userData = wx.getStorageSync('linpu_user_data') || { totalExp: 0 };
        userData.linpuGuardian = true;
        userData.emperorFragmentComplete = true;
        userData.doubleEmperorGuide = true;
        userData.totalExp = (userData.totalExp || 0) + 200;
        wx.setStorageSync('linpu_user_data', userData);
      } catch (e) { /* ignore */ }
    }
  },

  getAchievements(stats) {
    const badges = [];
    if (stats.landmarksVisited >= 1) badges.push({ name: '初入林浦', iconText: '初' });
    if (stats.landmarksVisited >= 3) badges.push({ name: '文化探索者', iconText: '文' });
    if (stats.landmarksVisited >= 6) {
      badges.push({ name: '林浦守护者', iconText: '守' });
      badges.push({ name: '帝踪寻觅者', iconText: '帝' });
      badges.push({ name: '双帝引路人', iconText: '引' });
    }
    return badges;
  },

  // ========== 统计 ==========

  addDialogueCount() {
    const stats = { ...this.data.stats };
    stats.dialogueCount = (stats.dialogueCount || 0) + 1;
    this.setData({ stats });
    this.saveStats();
  },

  // ========== 模式切换 ==========

  toggleMode() {
    if (!this.data.isARMode) {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.camera'] === false) {
            wx.showModal({
              title: '需要相机权限',
              content: '请在设置中开启相机权限以体验实拍模式',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting();
                }
              }
            });
          } else if (res.authSetting['scope.camera'] === true) {
            this.enableARMode();
          } else {
            wx.authorize({
              scope: 'scope.camera',
              success: () => {
                this.enableARMode();
              },
              fail: () => {
                wx.showModal({
                  title: '需要相机权限',
                  content: '请在设置中开启相机权限以体验实拍模式',
                  confirmText: '去设置',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              }
            });
          }
        }
      });
    } else {
      this.disableARMode();
    }
  },

  enableARMode() {
    this.setData({
      isARMode: true
    }, () => {
      this.initAR();
    });
  },

  disableARMode() {
    this.setData({
      isARMode: false
    }, () => {
      this.stopAR();
    });
  },

  // ========== AR 相关 ==========

  initAR() {
    const query = wx.createSelectorQuery();
    query.select('#arCanvas')
      .node()
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        this.canvas = canvas;
        const gl = canvas.getContext('webgl');
        if (gl) {
          this.renderLoop(gl, canvas);
        }
      });
  },

  renderLoop(gl, canvas) {
    gl.clearColor(0, 0, 0, 0);
    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.aniId = canvas.requestAnimationFrame(render);
    };
    render();
  },

  stopAR() {
    if (this.canvas && this.aniId) {
      this.canvas.cancelAnimationFrame(this.aniId);
      this.aniId = null;
    }
  },

  error(e) {
    console.error('相机启动失败:', e.detail);
    this.setData({ isARMode: false });
    wx.showToast({
      title: '相机启动失败，已切回背景模式',
      icon: 'none'
    });
  },

  // ========== 重置进度 ==========

  resetProgress() {
    wx.showModal({
      title: '重置进度',
      content: '确定要重置所有章节进度吗？成就将保留。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('ar_game_progress_v3');
          wx.removeStorageSync('ar_game_stats');
          this.initLevels();
          this.loadStats();
          wx.showToast({ title: '进度已重置', icon: 'success' });
        }
      }
    });
  }
});
