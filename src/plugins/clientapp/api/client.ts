import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

/** 客户端应用 */
export interface ClientData {
    id: number;
    tenantID: number;
    clientKey: string;
    clientName: string;
    clientType: string;
    status: number;
    walletEvmEnabled: number;
    allowedChainIds?: string;
    walletSignMessage?: string;
    logo?: string;
    remark?: string;
    platformCount?: number;
    createdAt?: string;
}

export type ClientListResult = BaseResult<{
    list: ClientData[];
    total: number;
}>;

export type ClientResult = BaseResult<ClientData>;

export interface ClientListParams {
    pageNum: number;
    pageSize: number;
    clientKey?: string;
    clientName?: string;
    clientType?: string;
    status?: number;
}

export interface ClientFormData {
    id?: number;
    clientKey?: string;
    clientName: string;
    clientType: string;
    status: number;
    walletEvmEnabled: number;
    allowedChainIds?: string;
    walletSignMessage?: string;
    logo?: string;
    remark?: string;
}

/** 分页查询客户端列表 */
export const getClientList = (params: ClientListParams) => {
    return http.request<ClientListResult>('get', baseUrlApi('plugins/clientapp/admin/client/list'), { params });
};

/** 获取客户端下拉选项 */
export const getClientOptions = () => {
    return http.request<BaseResult<{ list: ClientData[] }>>('get', baseUrlApi('plugins/clientapp/admin/client/options'));
};

/** 获取客户端详情 */
export const getClientById = (id: number) => {
    return http.request<ClientResult>('get', baseUrlApi(`plugins/clientapp/admin/client/${id}`));
};

/** 创建客户端 */
export const createClient = (data: ClientFormData) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/client/add'), { data });
};

/** 更新客户端 */
export const updateClient = (data: ClientFormData) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/client/edit'), { data });
};

/** 更新客户端状态 */
export const updateClientStatus = (data: { id: number; status: number }) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/client/status'), { data });
};

/** 删除客户端 */
export const deleteClient = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/client/delete'), { data: { id } });
};
