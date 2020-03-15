//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // 统计商品数量和价格
    orderCount: {
      num: 0,
      money: 0
    },
    bottomFlag: false,
    // 提交的订单
    orders: true,
    items: [],
    userorders:[],
    // orderTime:Math.round(new Date() / 1000 )
    orderTime:Math.round(new Date())
  },
  btx:function(e){
var that = this;
that.setData({
  btx:e.detail.value
})
  },
  // 点击结账按钮
  pay: function() {
    let that = this;
    let str = '选中' + that.data.orderCount.num + '件商品，共' + that.data.orderCount.money + '元，是否要支付？'
    wx.showModal({
      title: '提示',
      content: str,
      success: function (res) {
        // 至少选中一个商品才能支付
        if (that.data.orderCount.num !== 0){
          if (res.confirm) {
            if (that.data.orderCount.num !== 0){
              app.globalData.db.collection('paied').add({
                data:{
                  time: that.data.orderTime,
                  pay:1,
                  data:that.data.userorders,
                  money:that.data.orderCount.money,
                  note:that.data.btx
                }
            })
          };
            wx.cloud.callFunction({
              name:'paying',
              data:{
                time:that.data.orderTime
              },
              success:function(res){
                console.log('支付成功')
              },
              fail:function(err){
                console.log(err)
              }
            })
            wx.reLaunch({
              url: '../pay/pay'
            });
          } else if (res.cancel) {
            console.log('支付失败');
            if (that.data.orderCount.num !== 0){
              app.globalData.db.collection('waitpay').add({
                data:{
                  time: that.data.orderTime,
                  pay:0,
                  data:that.data.userorders,
                  money:that.data.orderCount.money
                }
            })
          };
          wx.reLaunch({
            url: '../waitpay/waitpay?useropenid='+app.globalData.userOpenid+'&time='+ that.data.orderTime
          });
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
  onLoad: function() {
    let that = this;
    const items = app.globalData.db.collection('orders').where({
      _openid: app.globalData.userOpenid,
      num: app.globalData.db.command.gt(0)
    });
    items.get({
      success(res) {
        that.setData({
          userorders:res.data
        })
        console.log(res.data)
        let money = 0;
        let num = 0;
        res.data.forEach(item => {
          money += (item.price*item.num); // 总价格求和
          num += item.num
        });
        let orderCount = {
          num,
          money
        }
        // 设置显示对应的总数和全部价钱
        that.setData({
          orderCount,
          items: res.data,
          orderTime:Math.round(new Date())
        });
        
      }
    })
  },
  onHide:function(){
  
  }
})