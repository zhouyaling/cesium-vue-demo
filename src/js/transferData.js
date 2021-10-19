/**
 * Created by zhouyaling on 2021/10/12
 * 经纬度转笛卡尔
 * @param {*} data 
 * @returns 
 */

const  degreeToCartesian3 = function (list) {
  if (!list || list.length <= 0) {
    list = [
      { lng: 106.48314, lat: 29.604911, height: 10 },
      { lng: 106.481552, lat: 29.611012, height: 10 },
      { lng: 106.484427, lat: 29.611907, height: 10 },
    ];
  }
  var newList = [];
  list.forEach((element) => {
    var item = Cesium.Cartesian3.fromDegrees(
      element.lng,
      element.lat,
      element.height
    );
    newList.push(item);
  });

  console.log("转换坐标：", newList);
  return newList;
}

const transferData = function (data) {
    const res = [];
    data.forEach((item) => {
      // item 依旧是数组
      // const pre = (i > 1 && data[i - 1]) || null;
      let date = item.date.split("/"); // "6/16/2020" => ["6", "16", "2020"]
      const dateTime = date[2] + "-" + date[0] + "-" + date[1] + " " + item.time; // "2020-6-16 14:05:39"
      // 针对经纬度完全相同的数据 (海拔高度不同)，仅保留最后一项
      // 这会导致无法正常得到起落架收起及放下的时间点 (这示例代码不需要考虑这个问题)
      // if (
      //   i > 1 &&
      //   Number(item.lat) === Number(pre[8]) &&
      //   Number(item.lng) === Number(pre[7])
      // ) {
      //   res.pop();
      // }
      res.push({
        longitude: Number(item.lng),
        latitude: Number(item.lat),
        altitude: Number(item.altitude),
        dateTime,
        heading: Number(item.heading),
        pitch: Number(item.pitch),
        roll: Number(item.roll)
      });
    });
    return res;
  }
  
  export {
    transferData,
    degreeToCartesian3
  }