import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

export interface AppConfigData {
    id: number;
    tenantID: number;
    clientId: number;
    clientName?: string;
    clientKey?: string;
    name: string;
    status: number;
    theme?: string;
    pages?: string;
    featureFlags?: string;
    navigation?: string;
    extra?: string;
    cacheVersion?: string;
    cacheTtl?: number;
    effectiveETag?: string;
    effectiveConfig?: string;
    remark?: string;
    createdAt?: string;
}

export interface AppConfigListParams {
    pageNum: number;
    pageSize: number;
    clientId?: number;
    name?: string;
    status?: number;
}

export interface AppConfigFormData {
    id?: number;
    clientId: number;
    name: string;
    status: number;
    theme: string;
    pages: string;
    featureFlags: string;
    navigation: string;
    extra: string;
    remark?: string;
}

export interface AppDecorationPreviewRequest {
    prompt: string;
    theme: string;
    pages: string;
    featureFlags: string;
    navigation: string;
    extra: string;
}

export interface AppDecorationPreviewData {
    theme: Record<string, any>;
    pages: any[];
    featureFlags: Record<string, any>;
    navigation: any[];
    extra: Record<string, any>;
    summary: string;
}

export type AppConfigListResult = BaseResult<{
    list: AppConfigData[];
    total: number;
}>;

export type AppConfigResult = BaseResult<AppConfigData>;

export const getAppConfigList = (params: AppConfigListParams) => {
    return http.request<AppConfigListResult>('get', baseUrlApi('plugins/clientapp/admin/appconfig/list'), { params });
};

export const getAppConfigById = (id: number) => {
    return http.request<AppConfigResult>('get', baseUrlApi(`plugins/clientapp/admin/appconfig/${id}`));
};

export const saveAppConfig = (data: AppConfigFormData) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/appconfig/save'), { data });
};

export const publishAppConfig = (data: AppConfigFormData) => {
    return http.request<BaseResult<AppConfigData>>('post', baseUrlApi('plugins/clientapp/admin/appconfig/publish'), { data });
};

export const updateAppConfigStatus = (data: { id: number; status: number }) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/appconfig/status'), { data });
};

export const deleteAppConfig = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/appconfig/delete'), { data: { id } });
};

export const generateDecorationPreview = (data: AppDecorationPreviewRequest) => {
    return http.request<BaseResult<AppDecorationPreviewData>>(
        'post',
        baseUrlApi('plugins/clientapp/admin/appconfig/decoration/preview'),
        { data }
    );
};

export const getPublicAppConfig = (params: { tenantId?: number; tenantCode?: string; clientKey: string }) => {
    return http.request<BaseResult<AppConfigData>>('get', baseUrlApi('plugins/clientapp/app/config'), { params });
};
