// pages/paied/paied.js

const app = getApp()
let time = require('../../utils/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCount: {
      num: 0,
      money: 0
    },
    userorders:[],
    cartList: [],
    sumMonney: 0,
    cutMonney: 0,
    cupNumber: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      useropenid : options.useropenid,
      time : options.time
    })
    const items = app.globalData.db.collection('paied').where({
      _openid: options.useropenid,
      time : parseInt(options.time)
    });
    items.get({
      success(res) {
        that.setData({
          userorders:res.data[0].data
        })
        console.log(res.data)
        let money = 0;
        let num = 0;
        res.data[0].data.forEach(item => {
          money += (item.price*item.num); // 总价格求和
          num += item.num
        });
        let orderCount = {
          num,
          money
        }
        // 设置显示对应的总数和全部价钱
        let items = res.data[0];
        items.timeString = time.formatTimeTwo(items.time,'Y-M-D h:m:s')
        that.setData({
          orderCount,
          items
        });
        
      }
    })
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})