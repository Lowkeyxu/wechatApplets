var app = getApp();
var QQMapWX = require('../../plugin/qqmap-wx-jssdk.js');
var qqmapsdk;
var myAudio; //播放音频
var recorderManager; // 录音功能
// map.js
Page({
  data: {
    longitude: null,
    latitude: null,
    province: '',
    city: "",
    district: "",
    address: "",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isPlay: false,
    isRecorder: false,
    tempFilePath: ''
  },

  onShow: function() {


  },

  //用户信息
  userDetail: function() {
    var user = app.globalData.userInfo
    var conten = "地区：" + user.country + " " + user.province + " " + user.city + " \n"
    var sex = "未知"
    if (user.gender != 0 && user.gender == 1) {
      sex = "男"
    } else if ((user.gender != 0 && user.gender == 2)) {
      sex = "女"
    }
    conten += "性别：" + sex

    wx.showModal({
      title: '我的信息',
      content: conten,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  //播放音频
  play: function() {
    var that = this.data
    if (!that.isPlay) {
      //播放
      myAudio.play();
    } else {
      //暂停
      myAudio.pause();
    }
  },
  //录音
  start: function() {
    var that = this.data
    var options = {
      duration: 10000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    if (that.isRecorder) {
      recorderManager.pause(options)
    } else {
      recorderManager.start(options);
    }
  },



  onLoad: function() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'ZQABZ-34WOD-VFZ42-P7E4T-TZWC7-4LFXO'
    });

    // 页面渲染后 执行  
    var globa = app.globalData
    if (globa.longitude && globa.longitude != '') {
      this.initLocation(globa);
    } else {
      app.locationCallback = location => {
        if (location != '' && location != null) {
          this.initLocation(location);
        }
      }
    }
    //获取用户信息
    if (globa.userInfo) {
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
        lang: 'zh_CN',
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    //初始化音频
    myAudio = wx.createInnerAudioContext();
    myAudio.src = 'http://sc1.111ttt.cn/2016/1/11/28/204281919253.mp3';
    myAudio.obeyMuteSwitch = false;

    myAudio.onPlay(() => {
      console.log('点击播放');
      this.setData({
        isPlay: true
      });
    });
    myAudio.onPause(() => {
      console.log('点击暂停');
      this.setData({
        isPlay: false
      });
    });

    myAudio.onEnded(() => {
      console.log('播放结束');
      this.setData({
        isPlay: false
      });
    });

    myAudio.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    });

    //录音
    recorderManager = wx.getRecorderManager();

    recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({
        isRecorder: true
      });
    })
    recorderManager.onPause(() => {
      console.log('录音暂停')
      this.setData({
        isRecorder: false
      });
    })
    recorderManager.onStop((res) => {
      console.log('录音停止', res)
      this.setData({
        tempFilePath: res.tempFilePath,
        isRecorder: false
      });

      //初始化音频
      var myRecorder = wx.createInnerAudioContext();
      myRecorder.src = res.tempFilePath;
      myRecorder.obeyMuteSwitch = false;

      myRecorder.play();

      myRecorder.onPlay(() => {
        console.log('点击播放录音');
      });

    })
    recorderManager.onFrameRecorded((res) => {
      var frameBuffer = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
  },
  onUnload: function() {
    myAudio.destroy();
    recorderManager.destroy();
  },

  //初始化坐标
  initLocation: function(data) {
    this.setData({
      longitude: data.longitude, // 经度
      latitude: data.latitude // 纬度
    })
    this.getLocal(data.latitude, data.longitude);
  },

  //获取坐标详细信息
  getLocal: function(latitude, longitude) {
    var that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        // console.log(JSON.stringify(res));
        let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        let district = res.result.ad_info.district
        let address = res.result.address
        that.setData({
          province: province,
          city: city,
          district: district,
          address: address
        })

      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        // console.log(res);
      }
    });

  }

})