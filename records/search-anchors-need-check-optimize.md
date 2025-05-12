## 旧

### 代码

const result = await mysqlClient.prismaClient.anchor.findMany({
orderBy: {
updated_at: 'desc',
},
select: {
user_id: true,
display_id: true,
region: true,
has_commerce_goods: true,
},
take: data.take ?? ANCHORS_CHECK_NUMBER,
where: {
region: {
in: regions,
},
has_commerce_goods: data.anchor_search_policies.ignore_commerce_anchor
? false
: undefined,
invite_checks: {
none: {
org_id: BigInt(data.org_id),
OR: [
{
contacted_by: {
// 已建联的不用再检查
not: null,
},
},
{
checked_at: {
gt: new Date(Date.now() - ANCHOR_CHECK_OUTDATE_TIME),
},
},
],
},
},
},
});

### 时间

[search-anchors-need-check] after db query { cost: 3107 }

[search-anchors-need-check] after db query { cost: 39205 }
[search-anchors-need-check] after db query { cost: 36046 }
[search-anchors-need-check] after db query { cost: 37173 }

## 新
