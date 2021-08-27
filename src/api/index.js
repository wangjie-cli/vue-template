import axios from 'axios';
import qs from 'qs';
import Vue from 'vue';

/**
 * 错误提示方法
 */
const errorTip = message => {
  const tipFn = Vue.prototype.$toast ? Vue.prototype.$toast : console.log;
  tipFn({
    type: 'fail',
    message,
  });
};

// 错误响应 响应操作
const errorHandler = {
  502: () => {
    errorTip('服务器错误，请联系管理员！');
  },
  default: error => {
    if (!(error.message && (error.message === '取消上传' || error.message === 'cancel'))) {
      if (navigator.onLine) {
        error.message ? errorTip(error.message) : errorTip('服务器错误，请联系系统管理员！');
      } else {
        errorTip('网络错误，请检查网络连接！');
      }
    }
    return Promise.reject(error);
  },
};

// code响应 响应操作
const codeHandler = {
  0: response => {
    const { data } = response.data;
    return data;
  },
  1: () => {
    errorTip('数据库，请联系管理人员！');
  },
  500: error => {
    const { msg } = error.data;
    errorTip(msg);
  },
  10010001: () => {
    errorTip('服务器错误，请联系管理人员！');
  },
  default: () => {
    errorTip('异常错误，请联系管理人员！');
  },
};
/**
 * 创建axios实例
 */
const $axios = axios.create({
  timeout: 10000,
  baseURL: process.env.VUE_APP_BASE_URL,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' }),
});

/**
 * 请求拦截
 */
$axios.interceptors.request.use(
  config => {
    const token = 'c733c479613347b18ea13678411fbe4d';
    token && (config.headers.authorization = token);
    return config;
  },
  error => Promise.reject(error),
);

/**
 * 响应拦截
 */
$axios.interceptors.response.use(
  response => {
    const { code } = response.data;
    const handler = codeHandler[code] || codeHandler.default;
    return handler(response);
  },
  error => {
    if (!error.response || !error.response.data) {
      errorTip('网络连接失败，请稍后重试！');
      return Promise.reject(error);
    }
    const { status } = error?.response;
    const handler = errorHandler[status] || errorHandler.default;
    return handler(error);
  },
);

export default $axios;
