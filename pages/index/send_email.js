// pages/index/send_email.js
import { app } from '../../utils/app.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        date: 0,
        create_date: 0,
        count: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        if (options.id) {
            that.data.id = options.id;
        }
        if (options.date) {
            that.data.date = decodeURIComponent(options.date);
        }
        if (options.create_date) {
            that.data.create_date = options.create_date;
        }
        if (options.count) {
            that.data.count = options.count;
        }
        that.setData({
            date: that.data.date,
            count: that.data.count
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
        var that = this;
        if (!app.check_login()) {
            app.login();
        }
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
     * 发送邮件
     */
    send_email: function(e) {
        var that = this;
        var form_data = e.detail.value;

        // 判断
        if (form_data.email == '') {
            app.basic_dialog('未填写', '请填写接收的邮件地址');
            return false;
        }
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (!reg.test(form_data.email)) {
            app.basic_dialog('填写错误', '请填写正确的邮件格式');
            return false;
        }

        form_data.enterprise_id = that.data.id;
        form_data.date = that.data.create_date;
        form_data.user_id = app.user_id;
        
        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        app.show_nav_loading();
        that.data.loading = true;

        // 提交数据
        app.post_ajax('api/enterprise/send_email', form_data, function (res, status) {
            if (status == 200) {
                app.basic_dialog('发送成功', '已成功发送到您的电子邮箱中，请注意查收', '关闭', function(){
                    app.close_nav_loading();
                    that.data.loading = false;
                })
            } else {
                app.basic_dialog('提交失败', res, '关闭', function () {
                    app.close_nav_loading();
                    that.data.loading = false;
                });
            }
        })
    }
})