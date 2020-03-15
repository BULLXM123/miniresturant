// pages/mine/mine.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: "",
    avatarUrl: ""
  },
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        that.setData({
          openid:res.result.openId
        })
        
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid();
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        console.log(userInfo)
        that.setData({
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        })
      }
    })
  },
  bitphone: function () {
    wx.makePhoneCall({
      phoneNumber: '1340000'
    })
  },
  gobackend:function(){
    wx.navigateTo({
      url: '../backend/backend'
    })
  }



})