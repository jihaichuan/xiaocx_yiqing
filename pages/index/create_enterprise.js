// pages/index/create_enterprise.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        code: "发送验证码",
        disabled: false,
        time:60,
        is_select:false,

        type: 1,            // 企业类型【1:企业】【2:实体店】【3:小区】
        type_name: '',      // 类型名称

        name: '',
        psa: [],            // 省/市/区
        address: '',        // 地址
        real_name: '',      // 真实姓名
        mobile: 0,          // 手机号码

        price: '100元',          // 支付金额

        loading: false,         // 加载
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        if (options.type) {
            that.data.type = parseInt(options.type);
        }
        
        // 设置type名称
        switch (that.data.type) {
            case 1:
                that.data.type_name = '企业';
                break;
            case 2:
                that.data.type_name = '实体店';
                break;
            case 3:
                that.data.type_name = '小区';
                break;
            default:
                that.data.type_name = '企业';
                break;
        }

        // 设置标题    
        wx.setNavigationBarTitle({
            title: '创建' + that.data.type_name
        });

        that.setData({
            type_name: that.data.type_name
        });
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
            app.call_back_fn = function () {
                that.handler_data();
            }
            app.login();
        }
    },


    /**
     * 处理数据
     */
    handler_data: function () {
        var that = this;

        // 获取用户信息
        that.get_user();

        // 获取最后创建的信息
        that.get_last_enterprise();

        // 获取支付金额
        that.get_price();
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

    /**
     * 隐私协议
     */
    go_privacy:function(){
        wx.navigateTo({
            url: 'privacy_protocol',
        })
    },

    /**
     * 获取手机号码
     */
    get_mobile: function(e) {
        // 判断授权，没有授权
        var that = this;
        if (that.data.loading) {
            return false;
        }

        // 显示加载
        that.show_loading();

        // 判断当前用户手机的版本
        if (wx.canIUse('button.open-type.getPhoneNumber')) {
            if (e.detail.errMsg == "getPhoneNumber:ok") {
                wx.login({
                    success: function (res) {
                        var encrypt_data = encodeURIComponent(e.detail.encryptedData);
                        var iv = encodeURIComponent(e.detail.iv);
                        app.post_ajax('api/user/get_wechat_phone', {
                            code: res.code,
                            encrypt_data: encrypt_data,
                            iv: iv,
                            user_id: app.user_id
                        }, function(mobile, status){
                            if (status == 200) {
                                that.data.mobile = mobile;
                                that.setData({
                                    mobile: that.data.mobile
                                })
                                that.close_loading();
                            } else {
                                that.close_loading();
                                app.toast_none('获取失败！');
                            }
                        })
                    },
                });
            } else {
                that.close_loading();
            }
        } else {
            // 显示加载
            that.close_loading();
            app.toast_none('版本过低,请升级微信版本')
        }
    },


    /**
     * 更新用户数据
     */
    get_user: function () {
        var that = this;
        app.get_ajax('api/user/index', {
            user_id: app.user_id
        }, function (res, status) {
            if (status == 200) {


                that.set_data(res);
            }
        });
    },

    /**
     * 设置数据
     */
    set_data: function(res) {
        var that = this;
        if (res.name) {
            that.data.name = res.name;
        }
        if (res.province && res.city && res.area) {
            that.data.psa = [res.province, res.city, res.area];
        }
        if (res.address) {
            that.data.address = res.address;
        }
        if (res.real_name) {
            that.data.real_name = res.real_name;
        }
        if (res.mobile) {
            that.data.mobile = res.mobile;
        }
        that.setData({
            name: that.data.name,
            psa: that.data.psa,
            address: that.data.address,
            real_name: that.data.real_name,
            mobile: that.data.mobile,
        })
    },

    /**
     * 设置省/市/区
     */
    set_psa: function (e) {
        var that = this;
        that.data.psa = e.detail.value;
        that.setData({
            psa: that.data.psa
        })
    },


    /**
     * 提交成功
     */
    submit_data: function (e) {
        var that = this;
        var form_data = e.detail.value;
        form_data.user_id = app.user_id;
        form_data.type = that.data.type;

        // 判断
        if (form_data.name == '') {
            app.basic_dialog('未填写', '请填写'+that.data.type_name+'名称');
            return false;
        }
        if (that.data.psa.length == 0) {
            app.basic_dialog('未选择', '请选择您所在的省市区');
            return false;
        }
        form_data.province = that.data.psa[0];
        form_data.city = that.data.psa[1];
        form_data.area = that.data.psa[2];

        if (form_data.address == '') {
            app.basic_dialog('未填写', '请填写详细地址');
            return false;
        }

        if (form_data.real_name == '') {
            app.basic_dialog('未填写', '请填写负责人姓名');
            return false;
        }
        if (form_data.mobile == '') {
            app.basic_dialog('未填写', '请填写手机号码');
            return false;
        }
        if (form_data.mobile.length != 11) {
            app.basic_dialog('填写错误', '手机号码长度不正确');
            return false;
        }
        
        if (that.data.is_select == false) {
            app.basic_dialog('未选择', '请勾选隐私协议');
            return false;
        }

        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        
        that.show_loading();

        // 提交数据
        app.post_ajax('api/Enterprise/add_v1', form_data, function (res, status) {
            if (status == 200) {
                // 发起微信支付
                if (res.is_pay == 1) {
                    that.open_success(res.id);
                } else {
                    that.send_pay(res.id);
                }
            } else {
                app.basic_dialog('提交失败', res, '关闭', function () {
                    that.close_loading();
                    that.data.loading = false;
                });
            }
        })
    },

    /**
     * 发起微信支付
     */
    send_pay: function (id) {
        var that = this;
        app.post_ajax('Api/Wx_Pay/index', {
            user_id: app.user_id,
            id: id
        }, function (res) {
            wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.package,
                signType: res.signType,
                paySign: res.paySign,
                success: function (pay) {
                    if (pay.errMsg == "requestPayment:ok") {
                        that.open_success(id);
                    } else {
                        that.close_loading();
                        that.data.loading = false;
                    }
                },
                fail: function(res) {
                    that.close_loading();
                    app.toast_none('支付失败');
                }
            });
        });
    },

    /**
     * 开通企业成功
     */
    open_success: function(id) {
        var that = this;
        app.toast_ok('开通成功', function () {
            that.close_loading();

            // 生成企业二维码
            that.set_qrcode(id);

            // 进入企业详情
            that.go_company(id);
        });
    },

    /**
     * 进入企业管理页面
     */
    go_company: function(id) {
        var that = this;
        var url = '';
        switch (that.data.type) {
            case 1:
                url = 'enterprise_manage?id=' + id;
                break;
            case 2:
                url = 'physical_store?id=' + id;
                break;
            case 3:
                url = 'residential_quarters?id=' + id;
                break;
            default:
                url = 'enterprise_manage?id=' + id;
                break;
        }
        wx.redirectTo({
            url: url
        })
    },

    /**
     * 获取最后创建的信息
     */
    get_last_enterprise: function() {
        var that = this;
        app.post_ajax('Api/Enterprise/get_last_info', {
            user_id: app.user_id,
            type: that.data.type
        }, function (res) {
            if (res) {
                that.set_data(res);
            }
        });
    },

    /**
     * 获取支付金额
     */
    get_price: function () {
        var that = this;
        app.post_ajax('Api/App/get_price', {
            user_id: app.user_id
        }, function (res) {
            if (res) {
                that.data.price = res;
                that.setData({
                    price: that.data.price
                })
            }
        });
    },

    /**
     * 选择隐私协议
     */
    check_select:function(){
        var that = this;
        that.setData({
            is_select: !that.data.is_select
        })
    },

    /**
     * 支付成功，生成企业二维码
     */
    set_qrcode: function (id) {
        var that = this;
        app.get_ajax('Api/Enterprise/set_qrcode', {
            user_id: app.user_id,
            enterprise_id: id
        });
    },

    /**
     * 发送验证码
     */
    send_code: function() {
        var that = this;
        that.setData({
            code: '60秒',
            disabled: true
        }, function() {

            // 倒计时
            var currentTime = that.data.time;
            var t = setInterval(function() {
                currentTime--;
                that.setData({
                    code: currentTime + '秒',
                    disabled: true
                })
                if (currentTime <= 0) {
                    clearInterval(t);
                    that.setData({
                        code: '重新发送',
                        time: 60,
                        disabled: false
                    })
                }
            }, 1000)
        })
    },


    /**
     * 显示加载中
     */
    show_loading: function () {
        var that = this;
        that.data.loading = true;
        app.show_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },

    /**
     * 关闭加载中
     */
    close_loading: function () {
        var that = this;
        that.data.loading = false;
        app.close_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },

})