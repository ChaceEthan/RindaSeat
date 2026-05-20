/* global __RINDASEAT_API_URL__, __RINDASEAT_SOCKET_URL__, __RINDASEAT_IS_PRODUCTION__ */

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(__RINDASEAT_API_URL__);
export const SOCKET_URL = trimTrailingSlash(__RINDASEAT_SOCKET_URL__);
export const IS_PRODUCTION = __RINDASEAT_IS_PRODUCTION__;
