// pages/beforeindex/beforeindex.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemId:'',
    motto: '欢迎光临小店',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        app.globalData.userOpenid = res.result.openId;
        console.log(app.globalData.userOpenid)
      }
    })
  },
  getItems() {
    let that = this;
    return new Promise((resolve,reject)=>{
      const items = app.globalData.db.collection('items');
      items.get({
        success(res) {
          app.globalData.orders = res.data
        }
      })
      resolve()
    })
  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.getOpenid();
    this.getItems();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
         
        }
      })
    }
  },
getUserInfo:function(e){
      console.log(e)
      app.globalData.userInfo=e.detail.userInfo
      this.setData({
        userInfo:e.detail.userInfo,
        hasUserInfo:true
      })
     
    },
    gotoMenu:function(e){
      // console.log(e)
      wx.navigateTo({
        url: '../list/list'
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
del:function(){
  return new Promise((resolve,reject)=>{
    wx.cloud.callFunction({
      name: 'deleteData',
      data: {
        userOpenid: app.globalData.userOpenid
      },
      complete: res => {
        console.log('菜单加载成功')
        resolve(res.data)
      }
    });
    
  })
 
},
showMenu:function(){
    let that = this;
    for (let i = 0; i < app.globalData.orders.length; i++) {
      app.globalData.db.collection('orders').add({
        data: {
          imgsrc: app.globalData.orders[i].imgsrc,
          menuid: app.globalData.orders[i].menuid,
          menuname: app.globalData.orders[i].menuname,
          num: app.globalData.orders[i].num,
          price: app.globalData.orders[i].price,
          title: app.globalData.orders[i].title,
          shopid:app.globalData.orders[i].shopid,
          // time: Math.round(new Date() / 1000)
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          this.setData({
            itemId: res._id
          })
          // wx.showToast({
          //   title: '菜单加载成功！',
          // })
          // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          // wx.showToast({
          //   icon: 'none',
          //   title: '菜单加载失败'
          // })
          // console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
}
,
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    that.getItems().then(()=>{
      that.del().then((data)=>{
        that.showMenu()
        })
    })
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