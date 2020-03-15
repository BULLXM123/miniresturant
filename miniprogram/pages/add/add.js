// pages/add/add.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menunum:0,
    newfood:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      menuid:options.menuid,
      shopid:options.shopid
    })
  },
  newmenuname:function(e){
    var that = this;
    that.setData({
      newmenuname:e.detail.value
    })
  },
  menuNum(){
  let that = this
return new Promise((resolve,reject)=>{
  app.globalData.db.collection('menus').where({
    _openid:app.globalData.userOpenid
  }).count({
    success:function(res){
      that.setData({
        menunum:res.total
      })
      resolve(res.total)
    }
  })
})
  },
  addMenucloud(){
    let that = this
return new Promise((resolve,reject)=>{
  wx.cloud.callFunction({
    name:'addMenu',
    data:{
      openid:app.globalData.userOpenid,
      menuname:that.data.newmenuname,
      menuid:that.data.menunum+1
    },
    success:res=>{
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      resolve()
    },
    fail:res=>{
      wx.showToast({
        title: '添加失败',
        icon: 'success'
      })
      reject()
    }
  })
})
  },
  addmenu:function(){
    let that = this;
   that.menuNum().then(()=>{
    that.addMenucloud()
   })
   
    
  },
  newfoodname:function(e){
    var that = this;
    that.data.newfood.title=e.detail.value
  },
  newfoodprice:function(e){
    var that = this;
    that.data.newfood.price=e.detail.value
  },
  doUpload:function(){
var that = this;
wx.chooseImage({
  count:1,
  sizeType:['compressed'],
  sourceType:['album','camera'],
  success:function(res){
    wx.showLoading({
      title:'上传中'
    })
    const filePath = res.tempFilePaths;
    const cloudPath = that.data.newfood.title+res.tempFilePaths[0].match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      filePath:filePath[0],
      cloudPath:cloudPath,
      success:res=>{
        console.log('[上传文件] 成功:',cloudPath, res)
        that.data.newfood.imgsrc=res.fileID
        console.log(that.data.newfood)
      },
      fail: e=> {
        console.error('[上传文件] 失败:',e)
      },
      complete: ()=>{
        wx.hideLoading()
      }
    })
  }
})
  },
  foodNum(){
    let that = this
  return new Promise((resolve,reject)=>{
    app.globalData.db.collection('items').where({
      _openid:app.globalData.userOpenid
    }).count({
      success:function(res){
        that.setData({
          foodNum:res.total
        })
        resolve(res.total)
      }
    })
  })
    },
   addfoodcloud(){
    let that = this
    return new Promise((resolve,reject)=>{
  wx.cloud.callFunction({
    name:'addFood',
    data:{
      openid:app.globalData.userOpenid,
      imgsrc: that.data.newfood.imgsrc,
      menuid:parseInt(that.data.menuid),
      price: parseInt(that.data.newfood.price),
      shopid:that.data.foodNum+1,
      title:that.data.newfood.title
    },
    success:res=>{
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      resolve()
    },
    fail:res=>{
      wx.showToast({
        title: '添加失败',
        icon: 'success'
      })
      reject()
    }
  })
})
  },
  addfood:function(e){
    let that = this;
    console.log(that.data)
   that.foodNum().then(()=>{
    that.addfoodcloud()
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