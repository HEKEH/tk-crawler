# 数据库表结构

## 1-主播相关

### 主播基础信息表(anchor)

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

## 2-主播验证相关

用于在live admin的验证主播是否可邀约

### Live Admin用户表(live_admin_user)

| 字段名             | 字段类型         | 必填 | 说明                                                       |
| ------------------ | ---------------- | ---- | ---------------------------------------------------------- |
| id                 | BIGINT UNSIGNED  | 是   | 主键                                                       |
| username           | VARCHAR(24)      | 是   | 用户名，唯一                                               |
| password           | VARCHAR(128)     | 是   | 密码。前端加密传输，后端进一步加密后入库，后端可解密为原文 |
| org_id             | BIGINT UNSIGNED  | 是   | 所属机构ID，关联organization表的id                         |
| status             | TINYINT UNSIGNED | 是   | 状态：1-正常，0-禁用                                       |
| max_query_per_hour | INT UNSIGNED     | 否   | 每小时最大查询次数, 默认50次。当前查询次数通过redis记录    |
| max_query_per_day  | INT UNSIGNED     | 否   | 每天最大查询次数，默认280次。当前查询次数通过redis记录     |
| cookie             | TEXT             | 否   | 爬虫的cookie，用于接口查询                                 |
| is_cookie_valid    | BOOLEAN          | 否   | 是否有效，用于判断cookie是否有效                           |
| created_at         | DATETIME         | 是   | 创建时间                                                   |
| updated_at         | DATETIME         | 是   | 更新时间                                                   |

索引:

- INDEX (org_id)

### Live Admin用户地区关联表(live_admin_user_region_relation)

| 字段名  | 字段类型        | 必填 | 说明                      |
| ------- | --------------- | ---- | ------------------------- |
| id      | BIGINT UNSIGNED | 是   | 主键                      |
| user_id | BIGINT UNSIGNED | 是   | 关联live_admin_user表的id |
| region  | VARCHAR(2)      | 是   | 地区                      |

索引:

- INDEX (user_id)
- INDEX (region)

约束:

- (user_id, region) 作为唯一约束

### live admin 邀约验证数据表(anchor_invite_check)

| 字段名         | 字段类型         | 必填 | 说明                                                           |
| -------------- | ---------------- | ---- | -------------------------------------------------------------- |
| id             | BIGINT UNSIGNED  | 是   | 主键                                                           |
| org_id         | BIGINT UNSIGNED  | 是   | 机构ID, 关联organization表的id                                 |
| anchor_id      | BIGINT UNSIGNED  | 是   | 主播ID, 唯一，关联anchor表的user_id                            |
| checked_at     | DATETIME         | 是   | 验证时间                                                       |
| checked_by     | BIGINT UNSIGNED  | 是   | 验证人ID, 关联live_admin_user表的id                            |
| checked_result | TINYINT UNSIGNED | 是   | 验证结果：1-可邀约，0-不可邀约                                 |
| invite_type    | INT              | 是   | 邀约方式，编码和tiktok一致：3-普通邀约，4-金票邀约，0-不可邀约 |
| created_at     | DATETIME         | 是   | 创建时间                                                       |
| updated_at     | DATETIME         | 是   | 更新时间                                                       |
| region         | VARCHAR(2)       | 是   | 地区，主播所属的地区。这个字段是为了加快查询速度而加的冗余字段 |

分区:

- 按org_id分区

索引:

- INDEX (org_id)
- INDEX (checked_by)
- INDEX (checked_result)
- INDEX (region)

## 3-产品用户相关

### 机构表(organization)

| 字段名               | 字段类型         | 必填 | 说明                 |
| -------------------- | ---------------- | ---- | -------------------- |
| id                   | BIGINT UNSIGNED  | 是   | 主键，机构id         |
| name                 | VARCHAR(100)     | 是   | 机构名称，唯一       |
| membership_expire_at | DATETIME         | 否   | 会员到期时间         |
| status               | TINYINT UNSIGNED | 是   | 状态：1-正常，0-禁用 |
| remark               | VARCHAR(200)     | 否   | 备注                 |
| created_at           | DATETIME         | 是   | 创建时间             |
| updated_at           | DATETIME         | 是   | 更新时间             |

### 机构用户表(org_user)

| 字段名       | 字段类型         | 必填 | 说明                         |
| ------------ | ---------------- | ---- | ---------------------------- |
| id           | BIGINT UNSIGNED  | 是   | 主键                         |
| org_id       | BIGINT UNSIGNED  | 是   | 关联机构ID                   |
| username     | VARCHAR(50)      | 是   | 登录名称，唯一               |
| display_name | VARCHAR(50)      | 是   | 显示名称                     |
| password     | VARCHAR(128)     | 是   | 密码（加密后的）             |
| email        | VARCHAR(50)      | 否   | 邮箱，唯一                   |
| mobile       | VARCHAR(20)      | 否   | 手机号码，唯一               |
| role_id      | INT UNSIGNED     | 是   | 角色ID: 1-管理员，2-普通用户 |
| status       | TINYINT UNSIGNED | 是   | 状态：1-正常，0-禁用         |
| remark       | VARCHAR(200)     | 否   | 备注                         |
| created_at   | DATETIME         | 是   | 创建时间                     |
| updated_at   | DATETIME         | 是   | 更新时间                     |

索引:

- INDEX (org_id)

### 机构地区关联表(org_region_relation)

一个机构最多关联n个地区，n待定

| 字段名 | 字段类型        | 必填 | 说明   |
| ------ | --------------- | ---- | ------ |
| id     | BIGINT UNSIGNED | 是   | 主键   |
| org_id | BIGINT UNSIGNED | 是   | 机构ID |
| region | VARCHAR(2)      | 是   | 地区   |

索引:

- INDEX (org_id)
- INDEX (region)

约束:

- (org_id, region) 作为唯一约束

### 任务分配表(task_assign)

| 字段名      | 字段类型        | 必填 | 说明                                       |
| ----------- | --------------- | ---- | ------------------------------------------ |
| id          | BIGINT UNSIGNED | 是   | 主键                                       |
| org_id      | BIGINT UNSIGNED | 是   | 机构ID, 关联organization表的id             |
| anchor_id   | BIGINT UNSIGNED | 是   | 主播ID, 关联anchor表的user_id              |
| org_user_id | BIGINT UNSIGNED | 是   | 被分配任务的机构用户ID，关联org_user表的id |
| created_at  | DATETIME        | 是   | 创建时间                                   |
| updated_at  | DATETIME        | 是   | 更新时间                                   |

分区:

- 按org_id分区

约束:

- (org_id, anchor_id) 作为唯一约束

索引:

- INDEX (org_id)
- INDEX (org_user_id)

### 已建联状态表(anchor_connect)

表中的每一行代表一个在该机构已建联的用户

| 字段名     | 字段类型        | 必填 | 说明     |
| ---------- | --------------- | ---- | -------- |
| id         | BIGINT UNSIGNED | 是   | 主键     |
| org_id     | BIGINT UNSIGNED | 是   | 机构ID   |
| anchor_id  | BIGINT UNSIGNED | 是   | 主播ID   |
| created_at | DATETIME        | 是   | 创建时间 |
| updated_at | DATETIME        | 是   | 更新时间 |

分区:

- 按org_id分区

索引:

- INDEX (org_id)
- INDEX (anchor_id)

## TODO: 数据分配

将查询到的数据分配给机构，根据机构的地区和上传的Live Admin User数量来分配
