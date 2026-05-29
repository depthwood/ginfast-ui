import { http } from '@/utils/http';
import { baseUrlApi } from '@/api/utils';
import { BaseResult } from '@/api/types';

/** 用户身份绑定 */
export interface IdentityData {
    id: number;
    identityType: string;
    identityKey: string;
    platform?: string;
    platformId?: number;
    providerId?: string;
    unionKey?: string;
    platformAppName?: string;
    status: number;
}

/** 客户端用户 */
export interface UserData {
    id: number;
    tenantID: number;
    nickname: string;
    avatar?: string;
    gender: number;
    status: number;
    registerSource: string;
    registerClientId?: number;
    registerPlatformId?: number;
    lastLoginAt?: string;
    lastLoginIp?: string;
    remark?: string;
    identityCount?: number;
    identities?: IdentityData[];
}

export type UserListResult = BaseResult<{
    list: UserData[];
    total: number;
}>;

export type UserResult = BaseResult<UserData>;

export interface UserListParams {
    pageNum: number;
    pageSize: number;
    nickname?: string;
    status?: number;
    registerSource?: string;
    clientId?: number;
}

export interface IdentityInput {
    identityType: string;
    identityKey: string;
    platformId?: number;
    clientId?: number;
    providerId?: string;
    unionKey?: string;
}

export interface UserFormData {
    id?: number;
    nickname: string;
    avatar?: string;
    gender: number;
    status: number;
    remark?: string;
    registerClientId?: number;
    registerPlatformId?: number;
    identities?: IdentityInput[];
}

/** 分页查询用户列表 */
export const getUserList = (params: UserListParams) => {
    return http.request<UserListResult>('get', baseUrlApi('plugins/clientapp/admin/user/list'), { params });
};

/** 获取用户详情 */
export const getUserById = (id: number) => {
    return http.request<UserResult>('get', baseUrlApi(`plugins/clientapp/admin/user/${id}`));
};

/** 代注册用户 */
export const createUser = (data: UserFormData) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/user/add'), { data });
};

/** 更新用户 */
export const updateUser = (data: UserFormData) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/user/edit'), { data });
};

/** 更新用户状态 */
export const updateUserStatus = (data: { id: number; status: number }) => {
    return http.request<BaseResult>('put', baseUrlApi('plugins/clientapp/admin/user/status'), { data });
};

/** 删除用户 */
export const deleteUser = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/user/delete'), { data: { id } });
};

/** 绑定身份 */
export const bindUserIdentity = (data: IdentityInput & { userId: number }) => {
    return http.request<BaseResult>('post', baseUrlApi('plugins/clientapp/admin/user/identity/bind'), { data });
};

/** 解绑身份 */
export const unbindUserIdentity = (id: number) => {
    return http.request<BaseResult>('delete', baseUrlApi('plugins/clientapp/admin/user/identity/unbind'), { data: { id } });
};
