let url = $request.url;

let hasUid = (url) => url.includes("uid");
let getUid = (url) => (hasUid(url) ? url.match(/uid=(\d+)/)[1] : undefined);

if (url.includes("remind/unread_count")) {
  // 把 uid 存下来
  $persistentStore.write(getUid(url), "uid");
  $done({});
} else if (url.includes("statuses/user_timeline")) {
  // 获取 uid
  let uid = getUid(url) || $persistentStore.read("uid");

  // 替换成 profile/statuses_timefilter
  url = url
    .replace("statuses/user_timeline", "profile/statuses_timefilter")
    .replace("max_id", "since_id");

  // 拼接 containerid（带月份筛选）
  url = url + `&containerid=107603${uid}_-_WEIBO_SECOND_PROFILE_WEIBO_MONTH`;

  // 默认加 lang 参数
  if (!url.includes("lang=")) {
    url = url + "&lang=en_US";
  }

  $done({ url });
} else if (url.includes("profile/statuses_timefilter")) {
  // 处理返回数据，统一成 Vvebo 习惯的格式
  let data = JSON.parse($response.body);

  // profile/statuses_timefilter 直接返回 statuses
  let statuses = data.statuses || [];

  // 补充置顶标记
  statuses = statuses.map((status) =>
    status.isTop ? { ...status, label: "置顶" } : status
  );

  let sinceId = data.since_id || "";
  $done({ body: JSON.stringify({ statuses, since_id: sinceId, total_number: 100 }) });
} else {
  $done({});
}