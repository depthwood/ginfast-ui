import { ref, computed } from 'vue';
import type { UserData, UserFormData, UserListParams } from '../api/user';
import {
    getUserList,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    updateUserStatus,
    bindUserIdentity,
    unbindUserIdentity
} from '../api/user';
import type { IdentityInput } from '../api/user';

export const useUserHook = () => {
    const dataList = ref<UserData[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<UserListParams>>({});

    const fetchDataList = async (params?: Partial<UserListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };

            const response = await getUserList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                nickname: searchParams.value.nickname,
                status: searchParams.value.status,
                registerSource: searchParams.value.registerSource,
                clientId: searchParams.value.clientId
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

    const getDetail = async (id: number) => getUserById(id);
    const createData = (data: UserFormData) => createUser(data);
    const updateData = (data: UserFormData) => updateUser(data);
    const deleteData = (id: number) => deleteUser(id);
    const updateStatus = (id: number, status: number) => updateUserStatus({ id, status });
    const bindIdentity = (data: IdentityInput & { userId: number }) => bindUserIdentity(data);
    const unbindIdentity = (id: number) => unbindUserIdentity(id);

    const resetSearchParams = () => {
        searchParams.value = {};
        currentPage.value = 1;
    };

    return {
        dataList,
        loading,
        total,
        currentPage,
        pageSize,
        searchParams,
        getDataList: computed(() => dataList.value),
        fetchDataList,
        getDetail,
        createData,
        updateData,
        deleteData,
        updateStatus,
        bindIdentity,
        unbindIdentity,
        resetSearchParams
    };
};
