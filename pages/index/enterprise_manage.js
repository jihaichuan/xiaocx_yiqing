// pages/index/enterprise_manage.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},           // 企业信息
        id: 0,              // 企业ID
        user_id: 0,         // 用户ID
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        if (options.id) {
            that.data.id = parseInt(options.id);
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
        that.get_info();

        // 设置数据
        that.setData({
            user_id: app.user_id
        })
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
     * 获取企业信息
     */
    get_info: function () {
        var that = this;
        app.get_ajax('api/enterprise/get_detail', {
            user_id: app.user_id,
            enterprise_id: that.data.id
        }, function (res, status) {
            if (status == 200) {
                that.data.info = res;
                that.setData({
                    info: that.data.info
                })
            }
        });
    },

    /**
     * 进入打印登记码
     */
    down_qrcode: function() {
        var that = this;
        if (that.data.info.qrcode_url == '') {
            app.show_loading('加载中');
            that.set_qrcode(function(res) {
                app.basic_dialog('操作结果', '登记码生成成功，请进入下载', '去下载', function(){
                    that.go_qrcode(res.qrcode_url);
                })
            });
        } else {
            that.go_qrcode(that.data.info.qrcode_url);
        }
    },

    /**
     * 进入下载页面
     */
    go_qrcode: function(img) {
        var that = this;
        wx.navigateTo({
            url: 'health_code?img='+img
        })
    },

    /**
     * 导出Excel 
     */
    go_excel: function() {
        var that = this;
        wx.navigateTo({
            url: 'export_data?id='+that.data.id,
        })
    },

    /**
     * 进入员工列表
     */
    go_user_list: function() {
        var that = this;
        wx.navigateTo({
            url: 'employee_list?id=' + that.data.id,
        })
    },

    /**
     * 支付成功，生成企业二维码
     */
    set_qrcode: function (fn) {
        var that = this;
        app.get_ajax('Api/Enterprise/set_qrcode', {
            user_id: app.user_id,
            enterprise_id: that.data.id
        }, fn);
    },

})