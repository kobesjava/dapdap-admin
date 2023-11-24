export async function* streamAPI<TSource extends Record<string, any> = any, TResponse = any>(url: string, {
  method = 'get',
  params,
  controller,
}: {
  method?: 'get' | 'post'
  params?: TSource
  controller?: AbortController
}) {
  const query = new URLSearchParams({ wg_sse: 'true' })
  const config: RequestInit = {
    signal: controller?.signal,
  }
  if (method.toLowerCase() === 'get') {
    if (params)
      Object.keys(params).forEach(key => query.append(key, params[key]))
  }
  else {
    if (params)
      config.body = JSON.stringify(params)
  }

  const resp = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/operations${url}?${query.toString()}`, config)
  if (resp.ok) {
    // 使用yield以流的方式读取
    const reader = resp.body!.getReader()

    while (true) {
      const { value, done } = await reader!.read()
      if (done)
        break
      const lines = new TextDecoder().decode(value).split('\n').map(line => line.substring(6)).filter(Boolean)
      for (const line of lines) {
        try {
          yield JSON.parse(line) as TResponse
        }
        catch (error) {
          // eslint-disable-next-line no-console
          console.log(line)
        }
      }
    }
  }
  else { throw new Error(resp.statusText) }
}

export function reverseTime(updatedAt) {
  const date = new Date(updatedAt);
  // 使用 Date 对象的方法获取各个时间部分
  const year = date.getFullYear(); // 年份
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份
  const day = String(date.getDate()).padStart(2, '0'); // 日
  const hours = String(date.getHours()).padStart(2, '0'); // 小时
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 分钟
  const seconds = String(date.getSeconds()).padStart(2, '0'); // 秒
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  // 拼接成字符串格式的时间
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  return formattedTime;
}