export async function fetchAllPaginatedItems<T extends { id: string | number }>(
  service: (data: {
    skip: number;
    take: number;
  }) => Promise<{ list: T[]; total: number }>,
  pageSize: number,
  options?: {
    onProgress?: (progress: { loaded: number; total: number }) => void;
    concurrency?: number;
    maxRetries?: number;
    deduplicateById?: boolean; // 新增：是否根据ID去重
  },
) {
  const { onProgress, concurrency = 1, maxRetries = 3 } = options || {};

  // 使用Map存储唯一ID的项，确保不会有重复
  const itemsMap = new Map<string | number, T>();

  // 获取第一页数据和总数
  const firstPageResult = await fetchWithRetry(0);

  // 添加第一页数据到Map，确保唯一性
  firstPageResult.list.forEach(item => {
    itemsMap.set(item.id, item);
  });

  let total = firstPageResult.total;

  // 报告初始进度
  onProgress?.({ loaded: itemsMap.size, total });

  if (itemsMap.size >= total) {
    return Array.from(itemsMap.values());
  }

  let end = false;

  // 计算剩余页数
  let pages = Math.ceil(total / pageSize);

  // 并发获取
  for (let i = 1; i < pages; i += concurrency) {
    const results = await Promise.all(
      Array.from({ length: concurrency }, (_, j) =>
        fetchWithRetry((i + j) * pageSize),
      ),
    );

    // 合并结果并去重
    results.forEach(result => {
      result.list.forEach(item => {
        itemsMap.set(item.id, item);
      });
    });

    // 报告进度
    onProgress?.({ loaded: Math.min(itemsMap.size, total), total });

    // 如果已获取全部数据，提前结束
    if (end) {
      break;
    }
    pages = Math.ceil(total / pageSize);
  }

  // 返回去重后的数据数组
  return Array.from(itemsMap.values());

  // 内部函数：带重试的数据获取
  async function fetchWithRetry(
    skip: number,
    retries = 0,
  ): Promise<{ list: T[]; total: number }> {
    try {
      const resp = await service({ skip, take: pageSize });
      if (resp.list.length === 0) {
        end = true;
      }
      total = resp.total;
      return resp;
    } catch (error) {
      if (retries < maxRetries) {
        // 指数退避重试
        const delay = 2 ** retries * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(skip, retries + 1);
      }
      throw error;
    }
  }
}
