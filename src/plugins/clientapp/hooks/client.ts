import { ref, computed } from 'vue';
import type { ClientData, ClientFormData, ClientListParams } from '../api/client';
import {
    getClientList,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    updateClientStatus,
    getClientOptions
} from '../api/client';

export const useClientHook = () => {
    const dataList = ref<ClientData[]>([]);
    const optionList = ref<ClientData[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<ClientListParams>>({});

    const fetchDataList = async (params?: Partial<ClientListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };

            const response = await getClientList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                clientKey: searchParams.value.clientKey,
                clientName: searchParams.value.clientName,
                clientType: searchParams.value.clientType,
                status: searchParams.value.status
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

    const fetchOptions = async () => {
        const response = await getClientOptions();
        optionList.value = response.data.list || [];
    };

    const getDetail = async (id: number) => {
        return getClientById(id);
    };

    const createData = (data: ClientFormData) => createClient(data);
    const updateData = (data: ClientFormData) => updateClient(data);
    const deleteData = (id: number) => deleteClient(id);
    const updateStatus = (id: number, status: number) => updateClientStatus({ id, status });

    const resetSearchParams = () => {
        searchParams.value = {};
        currentPage.value = 1;
    };

    return {
        dataList,
        optionList,
        loading,
        total,
        currentPage,
        pageSize,
        searchParams,
        getDataList: computed(() => dataList.value),
        fetchDataList,
        fetchOptions,
        getDetail,
        createData,
        updateData,
        deleteData,
        updateStatus,
        resetSearchParams
    };
};
