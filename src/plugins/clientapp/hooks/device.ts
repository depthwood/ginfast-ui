import { ref, computed } from 'vue';
import type { DeviceData, DeviceListParams, DeviceStatusData, DeviceBindData } from '../api/device';
import { getDeviceList, updateDeviceStatus, bindDeviceClient, deleteDevice, simulateDiscover } from '../api/device';

export const useDeviceHook = () => {
    const dataList = ref<DeviceData[]>([]);
    const loading = ref(false);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchParams = ref<Partial<DeviceListParams>>({});

    const fetchDataList = async (params?: Partial<DeviceListParams>) => {
        loading.value = true;
        try {
            if (params?.pageNum !== undefined) currentPage.value = params.pageNum;
            if (params?.pageSize !== undefined) pageSize.value = params.pageSize;
            if (params) searchParams.value = { ...searchParams.value, ...params };

            const response = await getDeviceList({
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                deviceUUID: searchParams.value.deviceUUID,
                clientId: searchParams.value.clientId,
                platform: searchParams.value.platform,
                status: searchParams.value.status
            });
            dataList.value = response.data.list || [];
            total.value = response.data.total || 0;
        } finally {
            loading.value = false;
        }
    };

    const updateStatus = (data: DeviceStatusData) => updateDeviceStatus(data);
    const bindClient = (data: DeviceBindData) => bindDeviceClient(data);
    const deleteData = (id: number) => deleteDevice(id);
    const simulate = (data?: { deviceName?: string; platform?: string }) => simulateDiscover(data);

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
        updateStatus,
        bindClient,
        deleteData,
        simulate,
        resetSearchParams
    };
};
