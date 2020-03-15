//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {},
    thetop: 'unset',
    tabIndex: 0,
    // 统计商品数量和价格
    orderCount: {
      num: 0,
      money: 0
    },
    bottomFlag: false,
    showNum:false,
    // 提交的订单
    orders: true,
    items: [],
    menus:[],
    subOrders:[],
    userorders:[]
  },
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideModal: false,
      thetop: 0
    })
    var animation = wx.createAnimation({
      duration: 600,//动画的持续时间 默认600ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();//调用显示动画
    }, 200)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    that.setData({
      // thetop: ' unset !important'
    })
    var animation = wx.createAnimation({
      duration: 800,//动画的持续时间 默认800ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画   
    setTimeout(function () {
      that.setData({
        hideModal: true,
        thetop: ' unset !important'
      })
    }, 500)//先执行下滑动画，再隐藏模块

  },
clear:function(){
  
    wx.cloud.callFunction({
      name: 'clearorders',
      complete: res => {
        console.log('清空成功')
      }
    });
    this.hideModal();
    this.init();
  }
,
  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    setTimeout(()=>{
      wx.showToast({
        title: '成功加载数据',
        icon: 'success',
        duration: 500
      });
      // wx.stopPullDownRefresh()
    }, 500);
  },
  tabMenu: function(event) {
    const that = this;
    let index = event.target.dataset.index;
    const items = app.globalData.db.collection('orders').where({
      menuid: index+1,
      _openid:app.globalData.userOpenid 
    });
    items.get({
      success(res) {
        // console.log(res.data)
        that.setData({
          items: res.data,
          tabIndex: index
        })
      }
    })
   
  },
  // 点击去购物车结账
  card: function() {
    let that = this;
    // 判断是否有选中商品
    if (that.data.orderCount.num !== 0) {
      // 跳转到购物车订单也
      wx.navigateTo({
        url: '../order/order'
      });
    } else {
      wx.showToast({
        title: '您未选中任何商品',
        icon: 'none',
        duration: 2000
      })
    }
  },
 
updateOrder(shopid,num){
    return new Promise((resolve,reject)=>{
       wx.cloud.callFunction({
      name:'updateOrder',
      data:{
        shopid:shopid,
        num:num
      },
      success:function(res){
        console.log(res)
        resolve(res)
      },
      fail:function(res){
        console.error(res)
        reject(res)
      }
    })
    })
   
  },
order(){
  var that = this;
  return new Promise((resolve,reject)=>{
    wx.cloud.callFunction({
    name:'order',
    data:{
      openid:app.globalData.openid
    },
    success:function(res){
      this.userorders=res.result.data;
      that.setData({
        userorders:res.result.data
      })
      // console.log(this.userorders)
      resolve(this.userorders)
    },
    fail:function(res){
      // console.error(res)
      reject(res)
    }
  })
  })
  
},
calcOrder(userorders){
return new Promise((resolve,reject)=>{
  console.log(userorders)
  var that = this;
  let money = 0;
  let num = 0;
  userorders.forEach(item => {
    money += item.price * item.num;
    num += item.num;
  });
  let orderCount = {
    num,
    money
  };
  that.setData({
    orderCount
  });
  resolve(orderCount)
})
},
async  adds (shopid,num) {
  await this.updateOrder(shopid,num)
  const userOrders = await this.order()
  await this.calcOrder(userOrders)
},
async  dels (shopid,num) {
  await this.updateOrder(shopid,num)
  const userOrders = await this.order()
  await this.calcOrder(userOrders)
},
  // 点击对应菜单添加按钮
  add: function (event) {
    let that = this;
    let id = event.target.dataset.id;
    let index = event.target.dataset.index;
    let param = that.data.items[index];
    param.num++; // 每点一次增加1
    that.data.subOrders.push(param);
    this.adds(param.shopid,param.num)
    // 改变添加按钮的状态
    this.data.items.splice(index, 1, param);
    that.setData({
      items: this.data.items
    });
    // 判断底部提交菜单显示隐藏
    if (that.data.userorders.length === 0) {
      that.setData({
        bottomFlag: false,
        showNum:false
      });
    } else {
      that.setData({
        bottomFlag: true,
        showNum:true
      });
    }
   
  },
  del: function (event) {
    let that = this;
    let id = event.target.dataset.id;
    let index = event.target.dataset.index;
    let param = that.data.items[index];
    let dataindex = that.data.subOrders.indexOf(param);
    console.log(dataindex);
    if (param.num > 0) {
      param.num--; // 每点一次减少1
      this.dels(param.shopid,param.num)
    } else {
      param.num = 0; // 最低为0
    }
    // 改变添加按钮的状态
    this.data.items.splice(index, 1, param);
    that.setData({
      items: this.data.items
    });
    // let money = 0;
    // let num = 0;
    // 将已经确定总价格和数量求和
  //   this.data.userorders.forEach(item => {
  //     money += item.price * item.num;
  //     num += item.num;
  //   });
  // if(param.num>=0){
  //   this.dels(param.shopid,param.num)
  // }
  //   let orderCount = {
  //     num,
  //     money
  //   }
    // 设置显示对应的总数和全部价钱
    // this.setData({
    //   orderCount
    // });
    // orderCount.num > 0 ? param.active = true : param.active = false;
    if (that.data.userorders.length < 2) {
      that.setData({
        bottomFlag: false
      });
    } else {
      that.setData({
        bottomFlag: true
      });
    }
  },
  add2:function(event){
    let that = this;
    let num;
    let shopid = event.target.dataset.shopid;
    const additem = app.globalData.db.collection('orders').where({
          shopid: shopid,
          _openid: app.globalData.userOpenid
        });
    additem.get({
      success(res){
       this.num=res.data[0].num;
       this.shopid=res.data[0].shopid;
       console.log(this.shopid)
       console.log(this.num)
       that.adds(this.shopid,this.num+1)
      },
      fail(err){
        console.log(err)
      },
      
    })
 
  
  },
  del2:function(event){
    let that = this;
    let num;
    let shopid = event.target.dataset.shopid;
    const delitem = app.globalData.db.collection('orders').where({
          shopid: shopid,
          _openid: app.globalData.userOpenid
        });
      delitem.get({
      success(res){
       this.num=res.data[0].num;
       this.shopid=res.data[0].shopid;
       console.log(this.shopid)
       console.log(this.num)
       if(this.num>0){
         that.dels(this.shopid,this.num-1)
       }
       
      },
      fail(err){
        console.log(err)
      },
      
    })
 
  
  },
  addOrder: function(event) {
    let that = this;
    let id = event.target.dataset.id;
    let index = event.target.dataset.index;
    let param = this.data.items[index];
    // let subOrders = []; 
    param.active ? param.active = false : param.active = true;
    // 改变添加按钮的状态
    this.data.items.splice(index, 1, param);
    that.setData({
      items: this.data.items
    });
    // 判断底部提交菜单显示隐藏
    if (that.data.subOrders.length === 0) {
      that.setData({
        bottomFlag: false
      });
    } else {
      that.setData({
        bottomFlag: true
      });
    }
    let money = 0;
    let num = that.data.subOrders.length;
    that.data.subOrders.forEach(item => {
      money += item.price; // 总价格求和
    });
    let orderCount = {
      num,
      money
    }
    // 设置显示对应的总数和全部价钱
    this.setData({
      orderCount
    });
    // 将选中的商品存储在本地
    // wx.setStorage({
    //   key: "orders",
    //   data: subOrders
    // });
  },
   init:function(){
    const that = this;
    return new Promise((resolve,reject)=>{
      const items = app.globalData.db.collection('items').where({
        menuid:1
      })
      const menus = app.globalData.db.collection('menus')
      items.get({
        success(res) {
          // console.log(res.data)
          that.setData({
            items: res.data
          })
          // wx.showToast({
          //   title: '菜单加载成功！',
          // })
        }
      })
      menus.get({
        success(res) {
          // console.log(res.data)
          that.setData({
            menus: res.data
          })
        }
      })
     that.setData({
      tabIndex: 0,
      orderCount: {
        num: 0,
        money: 0
      },
      bottomFlag: false,
      subOrders:[],
      userorders:[]
     })
     resolve()
    })
    
  },
  showPic:function(fildId){
    wx.cloud.downloadFile({
      fileID: fildId, // 文件 ID
      success: res => {
        return res.tempFilePath
      },
      fail: console.error
    })
  },
  showPics:function(items){
    return new Promise((resolve,reject)=>{
      for(let i in items){
        items[i].imgsrc = showPic(items[i].imgsrc)
      }
      resolve()
    })
  },
  async inits(){
    await this.init()
    await this.showPics()

  },
  onLoad: function() {
     this.inits();
  }

})