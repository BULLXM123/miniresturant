// pages/searchOrder/searchOrder.js

const app = getApp()
let time = require('../../utils/utils.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabIndex:0,
    userorder:[],
    currtab: 0,
swipertab: [{ name: '全部', index: 0 }, { name: '已完成', index: 1 }, { name: '待付款', index: 2 }]
  },
  changeTab:function(e){
    var index = e.currentTarget.dataset.index
    this.setData({
      tabIndex: index,
    })
  },
  golist: function () {
    wx.navigateTo({
      url: '../list/list'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // const that = this;
    // const items = app.globalData.db.collection('paied').where({
    //   _openid: app.globalData.userOpenid
    // })
    // items.get({
    //   success(res) {
    //     that.setData({
    //       userorder: res.data
    //     })
    //     console.log(that.data.userorder)
     
    //   }
    // })
    this.All();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getDeviceInfo()
    this.orderShow()
  },
  getDeviceInfo: function () {
    let that = this
    wx.getSystemInfo({
    success: function (res) {
    that.setData({
    deviceW: res.windowWidth,
    deviceH: res.windowHeight
    })
    }
    })
    },
  tabSwitch: function (e) {
    var that = this
    if (this.data.currtab === e.target.dataset.current) {
    return false
    } else {
    that.setData({
    currtab: e.target.dataset.current
    })
    }
    },
     
    tabChange: function (e) {
    this.setData({ currtab: e.detail.current })
    this.orderShow()
    },
     
    orderShow: function () {
    let that = this
    switch (this.data.currtab) {
    case 0:
    that.All()
    break
    case 1:
    that.Paied()
    break
    case 2:
    that.Waitpay()
    break
    }
    },
    async showAll(){
     await this.Paied()
     await this.Waitpay()
     await this.concatpay()
    },
    All:function(){
      const that = this;
      this.showAll();
      console.log(that.data.allOrder)
    },
    Paied: function(){
      const that = this;
      const items = app.globalData.db.collection('paied').where({
        _openid: app.globalData.userOpenid
      })
      return new Promise((resolve,reject)=>{
        items.get({
          success(res) {
            const temp = res.data;
            for(let i in temp){
              temp[i].timeString =time.formatTimeTwo(temp[i].time,'Y-M-D h:m:s')
            }
            that.setData({
              paiedOrder: temp
            })
            resolve(console.log(that.data.paiedOrder))
          }
        })
      }
    
      )},
    Waitpay:function(){
      const that = this;
      const items = app.globalData.db.collection('waitpay').where({
        _openid: app.globalData.userOpenid
      })
      return new Promise((resolve,reject)=>{
        items.get({
          success(res) {
            const temp = res.data;
            for(let i in temp){
              temp[i].timeString =time.formatTimeTwo(temp[i].time,'Y-M-D h:m:s')
            }
            that.setData({
              waitPayOrder:temp
            })
            resolve(console.log(that.data.waitPayOrder))
         
          }
        })
      })
     
    // this.setData({
    // waitPayOrder: [{ name: "跃动体育运动俱乐部(圆明园店)", state: "待付款", time: "2018-10-14 14:00-16:00", status: "未开始", url: "../order/image/item-m.jpg", money: "186" }],
    // })
    },
    concatpay:function(){
      const that = this;
      return new Promise((resolve,reject)=>{
        const allOrder = that.data.waitPayOrder.concat(that.data.paiedOrder);
        that.setData({
          allOrder
        })
        resolve(console.log(that.data.allOrder))
      })
    },
    jumptoDetail:function(e){
      console.log(e.currentTarget.dataset.timestamp)
      console.log(e.currentTarget.dataset.pay)
      if(e.currentTarget.dataset.pay==0){
        wx.navigateTo({
          url: '../waitpay/waitpay?useropenid='+app.globalData.userOpenid+'&time='+ e.currentTarget.dataset.timestamp
        })
      }
      if(e.currentTarget.dataset.pay==1){
        wx.navigateTo({
          url: '../paied/paied?useropenid='+app.globalData.userOpenid+'&time='+ e.currentTarget.dataset.timestamp
        })
      }
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