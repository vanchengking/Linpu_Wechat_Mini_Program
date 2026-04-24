# 个人主页云端化接入说明

## 目标

把个人主页从本地缓存展示改成数据库真实数据，当前这版已经补了：

- 微信 `wx.login` 登录换取小程序用户身份
- MySQL 用户表和会话表
- 个人资料查询接口
- 昵称保存接口
- 头像上传接口
- 微信手机号绑定接口
- 积分 / 经验 / 统计汇总同步接口

## 宝塔数据库配置

1. 在宝塔创建一个 MySQL 数据库，比如 `linpu_wechat`
2. 导入 [sql/linpu_profile_schema.sql](/C:/Users/12110/Desktop/Linpu_Wechat_Mini_Program/sql/linpu_profile_schema.sql)
3. 把后端环境变量按 [.env.example](/C:/Users/12110/Desktop/Linpu_Wechat_Mini_Program/.env.example) 填好

最低必填项：

- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `SERVER_PUBLIC_BASE`

## 后端启动

```bash
pip install -r requirements.txt
python Server.py
```

## 微信后台配置

你需要在微信小程序后台把后端域名加入：

- `request` 合法域名
- `uploadFile` 合法域名
- `downloadFile` 合法域名

如果头像上传和资料查询都走同一个域名，只配同一个 HTTPS 域名即可。

## 当前实现边界

这次改造已经把个人主页资料切到云端，并且会把本地积分 / 经验 / 统计同步到数据库。

还没有完全去本地化的部分：

- 各业务页面内部仍保留本地缓存，当前作为离线暂存和兼容层
- `record` 页面里的明细列表还是演示数据，尚未改成数据库行为日志
- `achievement` 页面的徽章规则还没有拆成数据库表

如果你要继续往下做，下一步建议是：

1. 增加 `user_activity_logs`
2. 地标 / 体验 / AR 完成事件直接写后端
3. `record` 页面完全读取数据库
4. `achievement` 规则和奖励结算后移到服务端
