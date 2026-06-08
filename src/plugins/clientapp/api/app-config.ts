import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

// ==================== 类型定义 ====================

export interface AppConfigData {
    id: number;
    tenantID: number;
    clientId: number;
    clientName?: string;
    clientKey?: string;
    configKey?: string;
    name: string;
    status: number;
    isActive?: boolean;
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
    configKey?: string;
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
    pageCode?: string;
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
    pageCode: string;
    summary: string;
}

/** 页面装修数据 */
export interface PageConfigData {
    pageCode: string;
    modules: any[];
    home: Record<string, any>;
}

/** 配置快照 */
export interface AppConfigSnapshotData {
    id: number;
    tenantID: number;
    clientId: number;
    configId: number;
    configKey: string;
    name: string;
    version: string;
    snapshotData?: string;
    remark?: string;
    configName?: string;
    createdAt?: string;
}

/** 可装修页面定义 */
export interface PageDefinition {
    id: string;
    title: string;
    path: string;
    enabled: boolean;
}

export type AppConfigListResult = BaseResult<{
    list: AppConfigData[];
    total: number;
}>;

export type AppConfigResult = BaseResult<AppConfigData>;

// ==================== 基础 CRUD 接口 ====================

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

export const getPublicAppConfig = (params: { tenantId?: number; tenantCode?: string; clientKey: string; pageCode?: string }) => {
    return http.request<BaseResult<AppConfigData>>('get', baseUrlApi('plugins/clientapp/app/config'), { params });
};

// ==================== 多页面装修接口 ====================

export const getPageConfig = (params: { id: number; pageCode: string }) => {
    return http.request<BaseResult<PageConfigData>>(
        'get',
        baseUrlApi('plugins/clientapp/admin/appconfig/page'),
        { params }
    );
};

export const savePageConfig = (data: { id: number; pageCode: string; pageData: string; autoSave?: boolean }) => {
    return http.request<BaseResult<{ id: number; cacheVersion: string }>>(
        'post',
        baseUrlApi('plugins/clientapp/admin/appconfig/page/save'),
        { data }
    );
};

// ==================== 方案切换接口 ====================

export const activateScheme = (data: { id: number }) => {
    return http.request<BaseResult<{ id: number; configKey: string; isActive: boolean }>>(
        'post',
        baseUrlApi('plugins/clientapp/admin/appconfig/activate'),
        { data }
    );
};

// ==================== 快照/版本管理接口 ====================

export const createSnapshot = (data: { configId: number; name: string; remark?: string }) => {
    return http.request<BaseResult<AppConfigSnapshotData>>(
        'post',
        baseUrlApi('plugins/clientapp/admin/appconfig/snapshot/create'),
        { data }
    );
};

export const listSnapshots = (params: { configId?: number; clientId?: number; pageNum?: number; pageSize?: number }) => {
    return http.request<BaseResult<{ list: AppConfigSnapshotData[]; total: number }>>(
        'get',
        baseUrlApi('plugins/clientapp/admin/appconfig/snapshot/list'),
        { params }
    );
};

export const restoreFromSnapshot = (data: { snapshotId: number }) => {
    return http.request<BaseResult<{ id: number; cacheVersion: string }>>(
        'post',
        baseUrlApi('plugins/clientapp/admin/appconfig/snapshot/restore'),
        { data }
    );
};

export const deleteSnapshot = (id: number) => {
    return http.request<BaseResult>(
        'delete',
        baseUrlApi('plugins/clientapp/admin/appconfig/snapshot/delete'),
        { data: { id } }
    );
};

// ==================== 默认页面定义 ====================

export const DEFAULT_PAGE_DEFINITIONS: PageDefinition[] = [
    { id: 'home', title: '首页', path: '/pages/index/index', enabled: true },
    { id: 'work', title: '服务', path: '/pages/work/work', enabled: true },
    { id: 'discover', title: '活动', path: '/pages/discover/discover', enabled: true },
    { id: 'message', title: '消息', path: '/pages/message/message', enabled: true },
    { id: 'mine', title: '我的', path: '/pages/mine/mine', enabled: true },
];
