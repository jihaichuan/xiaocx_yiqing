// pages/index/employee_list.js
import { app } from '../../utils/app.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0,              // 企业ID
        user_list: [],      // 员工列表
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
        that.get_list();
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
     * 返回
     */
    go_back:function(){
        var that = this;
        wx.navigateBack({
            delta: 1
        })
    },

    /**
     * 获取列表
     */
    get_list: function() {
        var that = this;
        app.get_ajax('api/enterprise/get_user_list', {
            user_id: app.user_id,
            enterprise_id: that.data.id
        }, function (res, status) {
            if (status == 200) {
                that.data.user_list = res;
                that.setData({
                    user_list: that.data.user_list
                })
            }
        });
    }
})