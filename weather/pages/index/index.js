//index.js

var util = require('../../utils/util.js')

Page({
  data: {
    weather: {}
  },
  onLoad: function () {
    var that = this;
    util.loadWeatherData(function(data){
      console.log(data)
      that.setData({
        weather: data
      })
    })

  }
 })
