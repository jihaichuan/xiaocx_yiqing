// pages/index/submit_data.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        enterprise_id: 0,       // 企业ID
        name: '',               // 名称
        data_type: 1,           // 1:企业，实体店 2:小区
        enterprise_type: 0,     // 类型：【1:出行】【2:进入】【0:默认】
        query: '',             // 获取请求

        info: {},               // 获取信息

        health_status: 0,       // 健康状态
        health_status_name: '请选择',   // 索引
        health_status_arr: [{
            id: 1,
            name: '健康'
        },{
            id: 2,
            name: '有发热、干咳、乏力等症状'
        }],

        psa: [],

        loading: false,         // 是否加载
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        // console.log(options);
        if (options.q) {
            that.handle_url(options.q);
        }
        
        // 判断是否登陆
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
     * 处理数据
     */
    handler_data: function() {
        var that = this;

        // 获取当前企业信息
        that.get_enterprise();
        // console.log(app.user_id);
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

    /**
     * 处理url 参数
     */
    handle_url: function(url) {
        var that = this;
        var url = decodeURIComponent(url);
        var urls = url.split('?');
        if (urls[0] == 'https://yiqing.xiaocx.org/') {
            if (urls[1]) {
                var param = urls[1].split('=');
                if (param[0] == 'id') {
                    var id_arr = param[1].split('_');
                    that.data.enterprise_id = id_arr[0];
                    that.data.enterprise_type = id_arr[1];
                } else {
                    that.url_err_dialog('URL参数获取失败');
                }
            } else {
                that.url_err_dialog('URL参数获取失败');
            }
        } else {
            that.url_err_dialog('扫码进入参数获取失败');
        }
    },

    /**
     * 扫码参数错误弹窗
     */
    url_err_dialog: function(msg) {
        app.basic_dialog('扫码失败', msg, '进入首页', function () {
            wx.reLaunch({
                url: 'index',
            })
        });
    },

    /**
     * 获取企业信息
     */
    get_enterprise: function () {
        var that = this;

        app.get_ajax('Api/Enterprise/index', {
            enterprise_id: that.data.enterprise_id,
            user_id: app.user_id
        }, function(res) {
            that.data.name = res.name;
            if (res.type == 2) {
                that.data.name = '欢迎光临'+res.name;
            } else if (res.type == 3) {
                that.data.name = res.name + '-出入信息登记【' + ((that.data.enterprise_type == 1) ? '出' : '进') + '】';
            }
            that.data.info = res;
            that.data.data_type = res.type;

            // 设置省/市/区
            if (res.province && res.city && res.area) {
                that.data.psa = [res.province, res.city, res.area];
            }

            // 设置数据
            that.setData({
                name: that.data.name,
                info: that.data.info,
                data_type: that.data.data_type,
                psa: that.data.psa
            })
        });
    },

    /**
     * 设置健康状态
     */
    set_health_status: function(e) {
        var that = this;
        that.data.health_status_indx = parseInt(e.detail.value);
        var hs = that.data.health_status_arr[that.data.health_status_indx];
        that.data.health_status_name = hs.name;
        that.data.health_status = hs.id;
        that.setData({
            health_status: that.data.health_status,
            health_status_name: that.data.health_status_name
        })
    },

    /**
     * 设置省/市/区
     */
    set_psa: function(e) {
        var that = this;
        that.data.psa = e.detail.value;
        that.setData({
            psa: that.data.psa
        })
    },

    /**
     * 提交成功
     */
    submit_data:function(e){
        var that = this;
        var form_data = e.detail.value;
        form_data.user_id = app.user_id;
        form_data.enterprise_id = that.data.enterprise_id;
        form_data.type = that.data.enterprise_type;
        form_data.health_status = that.data.health_status;

        // 判断
        if (form_data.real_name == '') {
            app.basic_dialog('未填写', '请填写真实姓名');
            return false;
        }
        if (form_data.card_no == '') {
            app.basic_dialog('未填写', '请填写身份证号码');
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
        if (that.data.data_type == 3) {
            if (form_data.floor_room == '') {
                app.basic_dialog('未填写', '请填写出入楼号');
                return false;
            }
        } else {
            if (that.data.psa[3] == '') {
                app.basic_dialog('未选择', '请选择您所在的省市区');
                return false; 
            }
            form_data.province = that.data.psa[0];
            form_data.city = that.data.psa[1];
            form_data.area = that.data.psa[2];

            if (form_data.address == '') {
                app.basic_dialog('未填写', '请填写您现在的居住地址');
                return false;
            }
        }
        if (form_data.health_status == 0) {
            app.basic_dialog('未选择', '请选择健康状态');
            return false;
        }

        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        app.show_nav_loading();
        that.data.loading = true;

        // 提交数据
        app.post_ajax('api/user/submit_data', form_data, function(res, status) {
            if (status == 200) {
                wx.redirectTo({
                    url: 'submit_success?id='+res,
                    success: function () {
                        app.close_nav_loading();
                        that.data.loading = false;
                    }
                })
            } else {
                app.basic_dialog('提交失败', res, '关闭', function() {
                    app.close_nav_loading();
                    that.data.loading = false;
                });
            }
        })
    },


})