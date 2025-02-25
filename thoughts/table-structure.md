# 1-主播相关

## 主播基础信息表(anchor)

tiktok爬虫爬取的基础信息

| 字段名             | 字段类型         | 必填 | 说明             |
| ------------------ | ---------------- | ---- | ---------------- |
| user_id            | BIGINT UNSIGNED  | 是   | 主播ID，主键     |
| display_id         | VARCHAR(24)      | 是   | 主播显示ID，唯一 |
| room_id            | BIGINT UNSIGNED  | 是   | 直播间ID         |
| region             | CHAR(2)          | 是   | 地区代码         |
| follower_count     | INT UNSIGNED     | 是   | 粉丝数           |
| audience_count     | INT UNSIGNED     | 否   | 当前观众数       |
| current_diamond    | INT UNSIGNED     | 是   | 当前钻石数       |
| last_diamond       | INT UNSIGNED     | 否   | 上次钻石数       |
| highest_diamond    | INT UNSIGNED     | 是   | 历史最高钻石数   |
| rank_league        | CHAR(2)          | 否   | 段位等级         |
| level              | TINYINT UNSIGNED | 否   | 等级             |
| has_commerce_goods | BOOLEAN          | 否   | 是否有商品       |
| tag                | VARCHAR(20)      | 否   | 标签             |
| created_at         | DATETIME         | 是   | 创建时间         |
| updated_at         | DATETIME         | 是   | 更新时间         |

索引:

- PRIMARY KEY (user_id)
- UNIQUE KEY (display_id)
- INDEX (region)
- INDEX (follower_count)
- INDEX (highest_diamond)
- INDEX (rank_league)

# 2-主播验证相关

## 主播验证用户密码表

用于在live_admin的验证是否可邀约

# 3-产品用户相关

## 机构表(organization)

| 字段名               | 字段类型     | 必填 | 说明                 |
| -------------------- | ------------ | ---- | -------------------- |
| id                   | BIGINT       | 是   | 主键                 |
| org_id               | VARCHAR(50)  | 是   | 机构编码，唯一       |
| name                 | VARCHAR(100) | 是   | 机构名称，唯一       |
| membership_expire_at | DATETIME     | 否   | 会员到期时间         |
| status               | TINYINT      | 是   | 状态：1-正常，0-禁用 |
| remark               | VARCHAR(500) | 否   | 备注                 |
| created_at           | DATETIME     | 是   | 创建时间             |
| updated_at           | DATETIME     | 是   | 更新时间             |

## 机构用户表(org_user)

| 字段名        | 字段类型     | 必填 | 说明                         |
| ------------- | ------------ | ---- | ---------------------------- |
| id            | BIGINT       | 是   | 主键                         |
| org_id        | BIGINT       | 是   | 关联机构ID                   |
| username      | VARCHAR(50)  | 是   | 登录名称，唯一               |
| display_name  | VARCHAR(50)  | 是   | 显示名称                     |
| password      | VARCHAR(128) | 是   | 密码（加密后的）             |
| email         | VARCHAR(50)  | 否   | 邮箱，唯一                   |
| mobile        | VARCHAR(20)  | 否   | 手机号码，唯一               |
| role_id       | BIGINT       | 是   | 角色ID: 1-管理员，2-普通用户 |
| status        | TINYINT      | 是   | 状态：1-正常，0-禁用         |
| last_login_at | DATETIME     | 否   | 最后登录时间                 |
| remark        | VARCHAR(500) | 否   | 备注                         |
| created_at    | DATETIME     | 是   | 创建时间                     |
| updated_at    | DATETIME     | 是   | 更新时间                     |

## 机构地区关联表(org_region_relation)

一个机构最多关联n个地区，n待定

| 字段名 | 字段类型   | 必填 | 说明   |
| ------ | ---------- | ---- | ------ |
| id     | BIGINT     | 是   | 主键   |
| org_id | BIGINT     | 是   | 机构ID |
| region | VARCHAR(2) | 是   | 地区   |
