let app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title_height: '', // 标题高度
        title_line_height: '', // 标题行号
        is_share: false,         // 显示分享海报

        company_id: 0, // 企业ID
        store_id: 0, // 实体店ID
        house_id: 0, // 小区ID

        is_nav:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    title_height: res.statusBarHeight + 48,
                    title_line_height: (res.statusBarHeight * 0.85) + res.statusBarHeight + 48
                })
            }
        });
    },

    /**
     * 处理数据
     */
    handler_data: function() {
        var that = this;

        that.get_user();

        // 显示分享海报
        that.show_share_poster();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
        
        if (app.check_login()) {
            that.handler_data();
        } else {
            app.call_back_fn = function() {
                that.handler_data();
            }
            app.login();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return app.share_path
    },

    onPageScroll: function(ev) {　　
        var that = this;
        if (parseInt(ev.scrollTop) >= 60){
            // console.log(ev.scrollTop)
            that.setData({
                is_nav:true
            })
        }else{
            that.setData({
                is_nav: false
            })
        }
    },

    /**
     * 更新用户数据
     */
    get_user: function() {
        var that = this;
        app.get_ajax('api/user/index', {
            user_id: app.user_id
        }, function(res, status) {
            if (status == 200) {
                that.data.company_id = res.company_id;
                that.data.store_id = res.store_id;
                that.data.house_id = res.house_id;
                that.setData({
                    company_id: that.data.company_id,
                    store_id: that.data.store_id,
                    house_id: that.data.house_id,
                })
            }
        });
    },

    /**
     * 进入企业
     */
    to_company: function(e) {
        var that = this;
        var type = parseInt(e.currentTarget.dataset.type);
        var url = '';
        switch (type) {
            case 1:
                if (that.data.company_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'enterprise_manage?id=' + that.data.company_id
                }
                break;
            case 2:
                if (that.data.store_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'physical_store?id=' + that.data.store_id
                }
                break;
            case 3:
                if (that.data.house_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'residential_quarters?id=' + that.data.house_id
                }
                break;
            default:
                if (that.data.company_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'enterprise_manage?id=' + that.data.company_id
                }
                break;
        }

        // 跳转
        wx.navigateTo({
            url: url,
        })
    },


    /**
     * 登记
     */
    go_register: function() {
        var that = this;
        wx.scanCode({
            onlyFromCamera: true,
            scanType: 'qrCode',
            success: function(res) {
                if (res.errMsg == "scanCode:ok") {
                    var url = decodeURIComponent(res.result);
                    var urls = url.split('?');
                    if (urls[0] == 'https://yiqing.xiaocx.org/') {
                        if (urls[1]) {
                            var param = urls[1].split('=');
                            if (param[0] == 'id') {
                                var id_arr = param[1].split('_');
                                if (id_arr[0]) {
                                    res.result = encodeURIComponent(url);
                                    wx.navigateTo({
                                        url: 'submit_data?q=' + res.result,
                                    });
                                } else {
                                    app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                                }
                            } else {
                                app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                            }
                        } else {
                            app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                        }
                    } else {
                        app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                    }
                } else {
                    app.basic_dialog('扫码失败', '只能识别普通二维码', '关闭');
                }
            }
        })
    },

    /**
     * 个人信息
     */
    go_user: function() {
        var that = this;
        wx.navigateTo({
            url: 'user_info',
        })
    },

    /**
     * 分享
     */
    share: function() {
        var that = this;
        that.setData({
            is_share: true
        })
    },

    /**
     * 关闭弹窗
     */
    close_share: function() {
        var that = this;
        var dd = app.current_date();
        that.data.is_share = false;
        that.setData({
            is_share: that.data.is_share
        }, function() {
            wx.setStorageSync('show_date_share', dd.date);
        })
    },

    /**
     * 每天显示一下，分享海报
     */
    show_share_poster: function() {
        var that = this;
        var show_date_share = wx.getStorageSync('show_date_share') || '';
        if (show_date_share) {
            // 获取当前日期
            var c_d = app.current_date();
            that.data.is_share = (c_d.date == show_date_share) ? false : true;
        } else {
            that.data.is_share = true;
        }
        that.setData({
            is_share: that.data.is_share
        })
    },

    
    /**
     * 测试支付
     */
    pay: function() {
        var that = this;
        app.post_ajax('Api/Wx_Pay/index', {
            user_id: app.user_id,
            id: 1
        }, function(res) {
            wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.package,
                signType: res.signType,
                paySign: res.paySign,
                success: function(pay) {
                    if (pay.errMsg == "requestPayment:ok") {
                        app.toast_ok('支付成功');
                    }
                }
            });
            // console.log(res);
        });
    },

    /**
     * 跳转小程序
     */
    go_xiaocx: function() {
        wx.navigateToMiniProgram({
            appId: "wxbd84b137d77acee3"
        })
    }
})