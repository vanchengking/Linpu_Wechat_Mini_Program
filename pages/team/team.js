// pages/team/team.js
Page({
  data: {
    members: [
      {
        name: '项目负责人',
        role: '统筹规划',
        initial: '负',
        color: 'brown',
        desc: '负责项目整体规划、需求分析与进度管理，统筹各模块协作开发。'
      },
      {
        name: '技术负责人',
        role: '架构设计',
        initial: '技',
        color: 'blue',
        desc: '负责小程序架构设计、AR功能开发与后端接口对接。'
      },
      {
        name: 'UI/UX设计师',
        role: '视觉设计',
        initial: 'U',
        color: 'purple',
        desc: '负责整体视觉风格定义、交互设计与界面组件规范。'
      },
      {
        name: '内容策划',
        role: '文案撰写',
        initial: '策',
        color: 'green',
        desc: '负责林浦文化内容挖掘、历史资料整理与叙事脚本编写。'
      }
    ],
    techStack: [
      { icon: '🟢', name: '微信小程序', desc: 'WXML/WXSS/JS' },
      { icon: '📱', name: 'AR增强现实', desc: '场景交互体验' },
      { icon: '🗺️', name: '地图定位', desc: '地标打卡导航' },
      { icon: '🤖', name: 'AI对话', desc: 'NPC互动系统' },
      { icon: '🎨', name: 'UI组件', desc: '自定义组件库' },
      { icon: '☁️', name: '云开发', desc: '数据存储同步' }
    ]
  }
});
