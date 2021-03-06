// getLocation 获取当前位置坐标
function getLocation(callback) {
  wx.getLocation({
    type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
    success: function(res){
      callback(true, res.latitude, res.longitude)
    },
    fail: function() {
      callback(false)
    }
    
  })
}


// getWeatherByLocation 获取指定位置的天气信息
function getWeatherByLocation(latitude, longitude, callback) {
  var apiKey = "448785d5fefefbded78b54c5e3d0aef0",
      apiURL = "https://api.darksky.net/forecast/" + apiKey + "/" + latitude + "," + longitude + "?lang=zh&units=ca"

  wx.request({
    url: apiURL,
    method: 'GET',
    // header: {}, // 设置请求的 header
    success: function(res){
      var weatherData = parseWeatherData(res.data);
      getCityName(latitude, longitude, function(city){
        weatherData.city = city;
        callback(weatherData)
      })
    },
    fail: function() {
      // fail
    },
    complete: function() {
      // complete
    }
  })
}

// parseWeatherData 解析天气数据
function parseWeatherData(data) {

  var weather = {};
  weather["current"] = data.currently;
  weather["daily"] = data.daily;

  return weather;
}

// getCityName 根据经纬度获取城市名称
function getCityName(latitude, longitude, callback) {
  var apiURL = "http://api.map.baidu.com/geocoder/v2/?poiss=1&output=json&location=" + latitude + "," + longitude + "&ak=MW2tGUSaW3lhWkPwv0mC09MY3zh2mNEY";

  wx.request({
    url: apiURL,
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function(res){
      callback(res.data["result"]["addressComponent"]["city"]);
    }
  })
}

// formatDate格式化时间戳为日期
function formatDate(timestamp) {

  var date = new Date(timestamp * 1000);
  
  return date.getMonth() + 1 + "月" + date.getDate() + "日" + formatWeekday(timestamp);
}

// formatWeekday 将时间戳格式化为星期
function formatWeekday(timestamp) {

  var date = new Date(timestamp * 1000),
      weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      index = date.getDay();

  return weekday[index];
}

// formatTime 将时间戳格式化为时间
function formatTime(timestamp) {
  var date = new Date(timestamp)
  
  return date.getHours() + ":" + date.getMinutes();
}

// requestWeatherData加载天气数据
function requestWeatherData(cb) {

  getLocation(function(success, latitude, longitude){
    
    // 如果GPS信息获取不成功， 设置一个默认坐标
    if (success == false) {

      latitude = 39.90403;
      longitude = 116.407526;
    }

    // 请求天气数据 API
    getWeatherByLocation(latitude, longitude, function(weatherData){
      console.log("=====weatherData==== :", weatherData)
      cb(weatherData);

    })
  })
}

// loadWeatherData
function loadWeatherData(callback) {

  requestWeatherData(function(data){

    // 对原始数据做一些修整， 然后输出给前端
    var weatherData = {};
    weatherData = data;
    weatherData.current.formattedData = formatDate(data.current.time);
    weatherData.current.formattedTime = formatTime(data.current.time);
    weatherData.current.temperature = parseInt(weatherData.current.temperature);

    var wantedDaily = [];
    for(var i = 1; i < weatherData.daily.data.length; i++) {

      var wantedDailyItem = weatherData.daily.data[i],
          time = weatherData.daily.data[i].time;
          wantedDailyItem["weekday"] = formatWeekday(time);
          wantedDailyItem["temperatureMin"] = parseInt(weatherData.daily.data[i]["temperatureMin"])
          wantedDailyItem["temperatureMax"] = parseInt(weatherData.daily.data[i]["temperatureMax"])
      
      wantedDaily.push(wantedDailyItem);
    }

    weatherData.daily.data = wantedDaily;
    callback(weatherData);
  })
}

module.exports = {
  loadWeatherData: loadWeatherData
}