import { http } from '@/utils/http';
import { baseUrlApi } from "@/api/utils";
import { BaseResult } from "@/api/types";

/** 登录日志 */
export interface LoginLogData {
    id: number;
    tenantID: number;
    clientId?: number;
    platformId?: number;
    platform?: string;
    userId?: number;
    identityType?: string;
    identityKey?: string;
    loginChannel?: string;
    ip?: string;
    userAgent?: string;
    status: number;
    failReason?: string;
    createdAt?: string;
    clientName?: string;
    platformAppName?: string;
}

export type LoginLogListResult = BaseResult<{
    list: LoginLogData[];
    total: number;
}>;

export interface LoginLogListParams {
    pageNum: number;
    pageSize: number;
    clientId?: number;
    platformId?: number;
    platform?: string;
    userId?: number;
    loginChannel?: string;
    status?: number;
}

/** 分页查询登录日志 */
export const getLoginLogList = (params: LoginLogListParams) => {
    return http.request<LoginLogListResult>("get", baseUrlApi("plugins/clientapp/admin/signlog/list"), { params });
};
