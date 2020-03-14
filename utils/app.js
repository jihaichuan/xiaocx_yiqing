import { hexMD5 } from 'md5.js';

let app = {
    app_id: '',                                 // 当前小程序app ID
    api_url: 'https://yiqing.xiaocx.org/',       // 请求API接口地址
    safety_code: '',                            // API 安全码
    open_id: '',                                // 当前登陆的用户ID；
    user_id: 0,                                 // 用户ID
    call_back_fn: '',                           // 回调函数

    share_path: {
        title: '小熊猫疫情登记小助手，快速帮助企业、实体店和小区对疫情数字化管理',
        path: 'pages/index/index',
        imageUrl: '/img/share_img.png'
    },

    // 首次加载
    onLaunch: function () {
        var that = this;
        let accountInfo = wx.getAccountInfoSync();
        that.app_id = accountInfo.miniProgram.appId;
    },

    /**
     * 获取当前用户ID
     */
    get_user_id: function () {
        var that = this;
        if (that.user_id) {
            return that.user_id;
        }
        that.call_back_fn = function () {
            return that.user_id;
        }
        that.login();
    },

    /**
     * 检测当前微信用户是否登陆
     */
    check_login: function () {
        var that = this;
        return that.user_id ? true : false;
    },

    /**
     * 微信小程序登陆
     */
    login: function () {
        var that = this;
        wx.login({
            success: function (code) {
                that.get_ajax('api/login/index', {
                    code: code.code
                }, function (res, code) {
                    if (code == 200) {
                        that.user_id = res.user_id;
                        that.safety_code = res.safety_code;
                        if (that.call_back_fn) {
                            that.call_back_fn();
                        }
                    } else {
                        that.basic_dialog(res.errcode, res.errmsg, '重新登陆', function () {
                            that.login();
                        });
                    }
                });
            },
            fail: function (res) {
                // console.log(res);
            }
        })

    },


    /**
     * get 请求
     */
    get_ajax: function (url, data, fn) {
        var that = this;
        that.request_data('get', url, data, fn);
    },

    /**
     * post 请求
     */
    post_ajax: function (url, data, fn) {
        var that = this;
        that.request_data('post', url, data, fn);
    },


    /**
     * 生成-data签名
     * jihaichuan
     */
    ajax_sign: function (data, safety_code) {
        // 当前时间戳
        let timestamp = Date.parse(new Date()) / 1000;
        let timestamp2 = (timestamp + 86400).toString();
        let sign = hexMD5(timestamp2 + safety_code);
        if (data) {
            data.sign = sign;
            data.timestamp = timestamp;
        } else {
            data = {
                sign: sign,
                timestamp: timestamp
            }
        }
        return data;
    },

    /**
     * 请求数据
     */
    request_data: function (type, url, data, fn) {
        var that = this;
        data = data || {};

        // 新增一个appID；
        data.app_id = that.app_id;
        that.ajax_sign(data, that.safety_code);

        wx.request({
            url: that.api_url + url,
            data: data,
            method: type,
            success: function (res) {
                if (fn) {
                    fn(res.data, res.statusCode);
                }
            }
        })
    },

    /**
     * 基础弹窗
     */
    basic_dialog: function (title, content, confirmText, fn) {
        wx.showModal({
            title: String(title),
            content: content,
            showCancel: false,
            confirmText: confirmText ? confirmText : '确认',
            success: fn
        })
    },

    /**
     * 成功吐司
     */
    toast_ok: function (title, fn) {
        wx.showToast({
            icon: 'success',
            title: title,
            success: function () {
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

    /**
     * 显示加载中状态
     */
    show_loading: function (str) {
        wx.showToast({
            icon: 'loading',
            title: str,
        })
    },

    /**
     * 隐藏加载
     */
    hide_loading: function () {
        wx.hideToast();
    },

    /**
     * 显示导航加载状态
     */
    show_nav_loading: function () {
        wx.showNavigationBarLoading();
    },


    close_nav_loading: function () {
        wx.hideNavigationBarLoading();
    },


    /**
     * 获取当前日期
     */
    current_date: function () {
        var n_d = new Date();
        var y = n_d.getFullYear();
        var m = n_d.getMonth() + 1;
        var d = n_d.getDate();
        m = m > 9 ? m : '0' + m;
        d = d > 9 ? d : '0' + d;
        return {
            date: y + '-' + m + '-' + d,
            y: y,
            m: m,
            d: d
        }
    }
}

// 获取账号信息
let accountInfo = wx.getAccountInfoSync();
app.app_id = accountInfo.miniProgram.appId;

module.exports = {
    app: app
}