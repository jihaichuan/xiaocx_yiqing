// pages/index/health_code.js
let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        img: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        if (options.img) {
            that.data.img = decodeURIComponent(options.img);
        }
        if (!that.data.img) {
            app.basic_dialog('系统错误', '获取登记二维码图片地址失败', '返回', function(){
                wx.navigateBack({
                    delta: 1
                })
            })
        }
        that.setData({
            img: that.data.img
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
        return app.share_path
    },

    saveImg: function () {
        var that = this;
        if (that.data.loading) {
            return false;
        }

        that.show_loading();
        // 判断用户是否授权
        wx.getSetting({
            success: function (res) {
                if (res.authSetting["scope.writePhotosAlbum"] == false) {
                    that.basic_dialog('授权提醒', '您还未授权保存相册，请授权', '去授权', function (res) {
                        if (res.confirm == true) {
                            wx.openSetting({
                                success: function (res) {
                                    if (res.authSetting["scope.writePhotosAlbum"] == true) {
                                        // 保存相册
                                        that.close_loading();
                                        that.saveImg();
                                    } else {
                                        that.close_loading();
                                        that.toast_none('授权失败');
                                    }
                                }
                            });
                        }
                    })
                } else {
                    // 下载这个图片
                    wx.downloadFile({
                        url: that.data.img,
                        success: function (res) {
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: function (response) {
                                    that.close_loading();
                                    if (response.errMsg == "saveImageToPhotosAlbum:ok") {
                                        that.toast_ok('下载成功');
                                    }
                                },
                                fail: function(res) {
                                    that.close_loading();
                                }
                            });
                        },
                        fail: function () {
                            that.close_loading();
                            that.toast_none('下载资源失败');
                        }
                    });
                }
            }
        });
    },

    /**
     * 显示加载中
     */
    show_loading: function() {
        var that = this;
        that.data.loading = true;
        that.setData({
            loading: that.data.loading
        });
    },

    /**
     * 关闭加载中
     */
    close_loading: function() {
        var that = this;
        that.data.loading = false;
        that.setData({
            loading: that.data.loading
        });
    },


    /**
     * 基础弹窗
     */
    basic_dialog: function (title, content, confirmText, fn) {
        wx.showModal({
            title: String(title),
            content: content,
            showCancel: false,
            confirmText: confirmText ? confirmText:'确认',
            success: fn
        })
    },

    /**
     * 成功吐司
     */
    toast_ok: function(title, fn) {
        wx.showToast({
            icon: 'success',
            title: title,
            success: function() {
                if (fn) {
                    fn();
                }
            }
        })
    },

    /**
     * 错误-弹窗吐司
     */
    toast_fail: function (title) {
        wx.showToast({
            image: '/img/close.png',
            title: title
        })
    },


    /**
     * 吐司弹窗
     * @param string  title
     * @param function fn (可写)
     * @timer integral timer  毫秒（ps:多少秒执行fn方法）
     * jihaichaun
     */
    toast_none: function (title, fn, timer) {
        timer = timer ? timer : 1000;
        wx.showToast({
            title: title,
            icon: 'none',
            success: function () {
                setTimeout(function () {
                    if (fn) {
                        (fn)();
                    }
                    // 隐藏toast
                    wx.hideToast();
                }, timer);
            }
        })
    },
})