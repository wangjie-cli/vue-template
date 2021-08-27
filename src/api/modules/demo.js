import $axios from '../index';

export default {
  /**
   * demo
   * @param {*} params
   * @returns{*}
   */
  demo(params) {
    return $axios.get('', { params });
  },
};
