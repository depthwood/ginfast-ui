import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

/** 设备数据 */
export interface DeviceData {
    id: number;
    deviceUUID: string;
    tenantID: number;
    clientID: number;
    deviceName: string;
    platform: string;
    appVersion: string;
    deviceInfo?: string;
    status: number;
    registeredAt: string;
    lastSeenAt: string;
    remark?: string;
    clientName?: string;
    clientKey?: string;
    createdAt?: string;
}

export type DeviceListResult = BaseResult<{
    list: DeviceData[];
    total: number;
}>;

export interface DeviceListParams {
    pageNum: number;
    pageSize: number;
    deviceUUID?: string;
    clientId?: number;
    platform?: string;
    status?: number;
}

export interface DeviceStatusData {
    id: number;
    status: number;
}

export interface DeviceBindData {
    id: number;
    clientId: number;
    remark?: string;
}

/** 分页查询设备列表 */
export const getDeviceList = (params: DeviceListParams) => {
    return http.request<DeviceListResult>('get', baseUrlApi('plugins/clientapp/admin/device/list'), { params });
};

/** 更新设备状态 */
export const updateDeviceStatus = (data: DeviceStatusData) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/device/status'), { data });
};

/** 绑定设备到客户端 */
export const bindDeviceClient = (data: DeviceBindData) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/device/bind'), { data });
};

/** 删除设备 */
export const deleteDevice = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/device/delete'), { data: { id } });
};

/** 模拟设备发现（测试用） */
export const simulateDiscover = (data?: { deviceName?: string; platform?: string }) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/device/simulate'), { data: data || {} });
};
