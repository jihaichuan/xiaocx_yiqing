// pages/index/user_info.js
import { app } from '../../utils/app.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        user: {},           // 用户详情
        psa: [],            // 省市区
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
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
     * 处理数据
     */
    handler_data: function () {
        var that = this;

        that.get_user();
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
     * 更新用户数据
     */
    get_user: function () {
        var that = this;
        app.get_ajax('api/user/index', {
            user_id: app.user_id
        }, function (res, status) {
            if (status == 200) {
                // 设置省/市/区
                if (res.province && res.city && res.area) {
                    that.data.psa = [res.province, res.city, res.area];
                }
                res.mobile = res.mobile || '';
                that.data.user = res;
                that.setData({
                    user: that.data.user,
                    psa: that.data.psa
                })
            }
        });
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
    submit_data: function (e) {
        var that = this;
        var form_data = e.detail.value;
        form_data.user_id = app.user_id;
        form_data.type = that.data.type;

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

        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        app.show_nav_loading();
        that.data.loading = true;

        // 提交数据
        app.post_ajax('api/User/set_info', form_data, function (id, status) {
            if (status == 200) {
                app.toast_ok('设置成功');
                app.close_nav_loading();
                that.data.loading = false;
            } else {
                app.basic_dialog('提交失败', res, '关闭', function () {
                    app.close_nav_loading();
                    that.data.loading = false;
                });
            }
        })
    },



})