import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

/** 平台渠道 */
export interface PlatformData {
    id: number;
    tenantID: number;
    clientId: number;
    platform: string;
    platformAppId: string;
    platformAppName?: string;
    credentials?: string;
    features?: string;
    status: number;
    remark?: string;
    clientName?: string;
    clientKey?: string;
    createdAt?: string;
}

export type PlatformListResult = BaseResult<{
    list: PlatformData[];
    total: number;
}>;

export type PlatformResult = BaseResult<PlatformData>;

export interface PlatformListParams {
    pageNum: number;
    pageSize: number;
    clientId?: number;
    platform?: string;
    platformAppId?: string;
    platformAppName?: string;
    status?: number;
}

export interface PlatformFormData {
    id?: number;
    clientId: number;
    platform: string;
    platformAppId: string;
    platformAppName?: string;
    credentials?: string;
    features?: string;
    status: number;
    remark?: string;
}

/** 分页查询平台渠道列表 */
export const getPlatformList = (params: PlatformListParams) => {
    return http.request<PlatformListResult>('get', baseUrlApi('plugins/clientapp/admin/platform/list'), { params });
};

/** 获取平台渠道下拉选项 */
export const getPlatformOptions = (clientId?: number) => {
    return http.request<BaseResult<{ list: PlatformData[] }>>('get', baseUrlApi('plugins/clientapp/admin/platform/options'), {
        params: clientId ? { clientId } : undefined
    });
};

/** 获取支持的小程序平台列表 */
export const getSupportedPlatforms = () => {
    return http.request<BaseResult<{ list: string[] }>>('get', baseUrlApi('plugins/clientapp/admin/platform/supported'));
};

/** 获取平台渠道详情 */
export const getPlatformById = (id: number) => {
    return http.request<PlatformResult>('get', baseUrlApi(`plugins/clientapp/admin/platform/${id}`));
};

/** 创建平台渠道 */
export const createPlatform = (data: PlatformFormData) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/platform/add'), { data });
};

/** 更新平台渠道 */
export const updatePlatform = (data: PlatformFormData) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/platform/edit'), { data });
};

/** 更新平台渠道状态 */
export const updatePlatformStatus = (data: { id: number; status: number }) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/platform/status'), { data });
};

/** 删除平台渠道 */
export const deletePlatform = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/platform/delete'), { data: { id } });
};
