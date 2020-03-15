// pages/backend/backend.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    thetop: 'unset',
    tabIndex: 0,
    orders: true,
    items: [],
    menus:[],
    menuid:1
  },
  tabMenu: function(event) {
    const that = this;
    let index = event.target.dataset.index;
    let id = event.target.dataset.id;
    that.setData({
      menuid:id
    })
    const items = app.globalData.db.collection('orders').where({
      menuid: id,
      _openid:app.globalData.userOpenid 
    });
    items.get({
      success(res) {
        console.log(res.data)
        that.setData({
          items: res.data,
          tabIndex: index
        })
      }
    })
   
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
    await this.foodNum()

  },
  onLoad: function() {
     this.inits();
  },
  onShow:function(){
    this.inits()
  },
  menu:function(e){
    var that = this;
    wx.showActionSheet({
      itemList: ['增加','修改', '删除'],
      success(res){
        if (res.tapIndex === 0){
          wx.navigateTo({
            url: '../add/add?menuid='+that.data.menuid
          })
         
        }else if (res.tapIndex === 1){
          wx.navigateTo({
            url: '../alter/alter?menuid='+that.data.menuid
          })
          
        }
        else{
          let that = this;
          wx.showModal({
           title:'警告',
           content:'您将删除该菜式及其下所有菜品',
            success:function(res){
             
              if(res.confirm){
                console.log(e.target.dataset.id)
                wx.cloud.callFunction({
                  name:'deleteMenu',
                  data:{
                    menuid:e.target.dataset.id
                  },
                  success:res=>{
                    wx.showToast({
                      title: '删除成功',
                      icon: 'success'
                    })
                    that.inits();
                  },
                  fail:res=>{
                    wx.showToast({
                      title: '删除失败',
                      icon: 'fail'
                    })
                  }

                })
                that.inits()
              }
            }
          })
        }
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
  food:function(e){
    var that = this;
    if(e.currentTarget.dataset.id!=undefined){
      that.setData({
        shopid:e.currentTarget.dataset.id
      })
    }
    else{
      that.setData({
        shopid:that.data.foodNum+1
      })
    }
    wx.showActionSheet({
      itemList: ['增加','修改', '删除'],
      success(res){
        if (res.tapIndex === 0){
          wx.navigateTo({
            url: '../add/add?shopid='+that.data.shopid
            +'&menuid='+that.data.menuid
          })
       
        }else if (res.tapIndex === 1){
          wx.navigateTo({
            url: '../alter/alter?shopid='+that.data.shopid
            +'&menuid='+that.data.menuid
          })
        }
        else{
          wx.showModal({
            title:'警告',
            content:'您将删除该菜品',
            success:function(res){
              if(res.confirm){
                console.log(e.currentTarget.dataset.id)
                wx.cloud.callFunction({
                  name:'deleteFood',
                  data:{
                    menuid:e.currentTarget.dataset.menuid,
                    shopid:e.currentTarget.dataset.id
                  },
                  success:res=>{
                    wx.showToast({
                      title: '删除成功',
                      icon: 'success'
                    })
                    that.inits();
                  },
                  fail:res=>{
                    wx.showToast({
                      title: '删除失败',
                      icon: 'fail'
                    })
                  }

                })
                that.inits()
              }
            }
           })
        }
      }
    })
  }

})