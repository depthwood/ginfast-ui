<template>
    <div class="carousel-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Carousel height (px)">
                <a-input-number
                    :model-value="props.config.height"
                    @update:model-value="(v) => emit('update', 'height', v)"
                    placeholder="200"
                    :min="50"
                />
            </a-form-item>

            <a-divider>Carousel items</a-divider>

            <div
                v-for="(item, index) in items"
                :key="index"
                class="carousel-item-card"
                style="border: 1px solid #e5e6eb; border-radius: 6px; padding: 12px; margin-bottom: 12px;"
            >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 500; font-size: 13px;">Item {{ index + 1 }}</span>
                    <a-button type="text" status="danger" size="small" @click="removeItem(index)">
                        Delete
                    </a-button>
                </div>

                <a-form-item label="Image URL">
                    <a-input
                        :model-value="item.image"
                        @update:model-value="(v) => updateItem(index, 'image', v)"
                        placeholder="Enter image URL"
                    />
                </a-form-item>

                <a-form-item label="Title">
                    <a-input
                        :model-value="item.title"
                        @update:model-value="(v) => updateItem(index, 'title', v)"
                        placeholder="Enter title"
                    />
                </a-form-item>

                <a-form-item label="Description">
                    <a-input
                        :model-value="item.desc"
                        @update:model-value="(v) => updateItem(index, 'desc', v)"
                        placeholder="Enter description"
                    />
                </a-form-item>

                <a-form-item label="Action type">
                    <a-select
                        :model-value="item.action?.type"
                        @update:model-value="(v) => updateItemAction(index, 'type', v)"
                        placeholder="Select action type"
                    >
                        <a-option value="route">Route</a-option>
                        <a-option value="url">URL</a-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Action value">
                    <a-input
                        :model-value="item.action?.value"
                        @update:model-value="(v) => updateItemAction(index, 'value', v)"
                        placeholder="Enter route path or URL"
                    />
                </a-form-item>
            </div>

            <a-button type="outline" long @click="addItem">
                + Add carousel item
            </a-button>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();

const items = computed(() => props.config.items || []);

function addItem() {
    const newItems = [
        ...items.value,
        { image: '', title: '', desc: '', action: { type: 'route', value: '' } },
    ];
    emit('update', 'items', newItems);
}

function removeItem(index: number) {
    const newItems = items.value.filter((_: any, i: number) => i !== index);
    emit('update', 'items', newItems);
}

function updateItem(index: number, key: string, value: any) {
    const newItems = items.value.map((item: any, i: number) => {
        if (i !== index) return item;
        return { ...item, [key]: value };
    });
    emit('update', 'items', newItems);
}

function updateItemAction(index: number, key: string, value: any) {
    const newItems = items.value.map((item: any, i: number) => {
        if (i !== index) return item;
        return {
            ...item,
            action: { ...(item.action || { type: 'route', value: '' }), [key]: value },
        };
    });
    emit('update', 'items', newItems);
}
</script>
