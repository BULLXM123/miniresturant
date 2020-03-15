// pages/waitpay/waitpay.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCount: {
      num: 0,
      money: 0
    },
    bottomFlag: false,
    // 提交的订单
    orders: true,
    items: [],
    userorders:[],
    orderTime:Math.round(new Date())
  },
  
  btx:function(e){
var that = this;
that.setData({
  btx:e.detail.value
})
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
    const items = app.globalData.db.collection('waitpay').where({
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
        that.setData({
          orderCount
        });
        that.setData({
          items: res.data
        })
      }
    })
  },
  pay: function() {
    let that = this;
  //   if (that.data.orderCount.num !== 0){
  //     app.globalData.db.collection('paying').add({
  //       data:{
  //         time: that.data.orderTime,
  //         pay:0,
  //         data:that.data.userorders
  //       }
  //   })
  // };
    let str = '选中' + that.data.orderCount.num + '件商品，共' + that.data.orderCount.money + '元，是否要支付？'
    wx.showModal({
      title: '提示',
      content: str,
      success: function (res) {
        // 至少选中一个商品才能支付
        if (that.data.orderCount.num !== 0){
          if (res.confirm) {
            // app.globalData.db.collection('paied').add({
            //   data:{
            //     time: that.data.orderTime,
            //     data:that.data.userorders
            //   }
            // })
            if (that.data.orderCount.num !== 0){
              app.globalData.db.collection('paied').add({
                data:{
                  time: parseInt(that.data.time),
                  pay:1,
                  data:that.data.userorders,
                  money:that.data.orderCount.money,
                  note:that.data.btx
                }
            })
            // app.globalData.db.collection('waitpay').where({
            //   _openid:that.data.useropenid ,
            //   time:that.data.time 
            // }).remove();
            console.log(that.data.useropenid);
            console.log(that.data.time)
            wx.cloud.callFunction({
              name: 'pay',
              data: {
                useropenid:that.data.useropenid ,
                time:parseInt(that.data.time) 
              },
              success: res => {
                console.log('订单支付成功')
              },
              fail: res =>{
                console.log('订单支付失败')
              }
            });
           

          };
          
            wx.reLaunch({
              url: '../pay/pay'
            });
          } else if (res.cancel) {
            console.log('支付失败');
          wx.reLaunch({
            url: '../waitpay/waitpay?useropenid='+app.globalData.userOpenid+'&time='+ that.data.time
          });
            // app.globalData.db.collection('waitpay').add({
            //   data:{
            //     time: Math.round(new Date() / 1000),
            //     data:that.data.userorders
            //   }
            // })
          }
        } else {
          wx.showToast({
            title: '您未选中任何商品',
            icon: 'none',
            duration: 2000
          })
        }
      }
      
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