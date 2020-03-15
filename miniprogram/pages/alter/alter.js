// pages/alter/alter.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newfood:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(options.shopid!=undefined){
      that.setData({
        menuid:options.menuid,
        shopid:options.shopid
      })
    }
    else{
      that.setData({
        menuid:options.menuid
      })
    }
    // console.log(options)
    const menu = app.globalData.db.collection('menus').where({
      menuid:parseInt(options.menuid)
    })
    menu.get({
      success(res) {
        console.log(res)
        that.setData({
          orginalmenu: res.data[0].menuname
        })
      }
    })
    const item = app.globalData.db.collection('items').where({
      shopid:parseInt(options.shopid)
    })
    item.get({
      success(res) {
        console.log(res)
        that.setData({
          orginalfood: res.data[0],
          newfood:res.data[0]
        })
      }
    })
  },
  updatemenu:function(){
    let that = this;
    wx.cloud.callFunction({
      name:'updateMenu',
      data:{
        menuid:parseInt(that.data.menuid),
        menuname:that.data.newmenuname
      },
      success:res=>{
        wx.showToast({
          title: '更改成功',
          icon: 'success'
        })
      },
      fail:res=>{
        wx.showToast({
          title: '更改失败',
          icon: 'success'
        })
      }
    })
  },
  updatefood:function(){
    let that = this;
    wx.cloud.callFunction({
      name:'updateFood',
      data:{
        shopid:parseInt(that.data.newfood.shopid),
        title:that.data.newfood.title,
        price:parseInt(that.data.newfood.price),
        imgsrc:that.data.newfood.imgsrc
      },
      success:res=>{
        wx.showToast({
          title: '更改成功',
          icon: 'success'
        })
      },
      fail:res=>{
        wx.showToast({
          title: '更改失败',
          icon: 'success'
        })
      }
    })
  },
  newmenuname:function(e){
    var that = this;
    that.setData({
      newmenuname:e.detail.value
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
    const cloudPath = that.data.orginalfood.title+res.tempFilePaths[0].match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      filePath:filePath[0],
      cloudPath:cloudPath,
      success:res=>{
        console.log('[上传文件] 成功:',cloudPath, res)
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        })
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