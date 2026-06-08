<template>
    <div class="notice-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Notice text">
                <a-input
                    :model-value="props.config.text"
                    @update:model-value="(v) => emit('update', 'text', v)"
                    placeholder="Enter notice text"
                />
            </a-form-item>

            <a-form-item label="Icon">
                <a-input
                    :model-value="props.config.icon"
                    @update:model-value="(v) => emit('update', 'icon', v)"
                    placeholder="Enter icon name or emoji"
                />
            </a-form-item>

            <a-form-item label="Text color">
                <a-input
                    :model-value="props.config.color"
                    @update:model-value="(v) => emit('update', 'color', v)"
                    placeholder="e.g. #333333"
                />
            </a-form-item>

            <a-form-item label="Background color">
                <a-input
                    :model-value="props.config.background"
                    @update:model-value="(v) => emit('update', 'background', v)"
                    placeholder="e.g. #fffbe6"
                />
            </a-form-item>

            <a-form-item label="Scrollable">
                <a-switch
                    :model-value="props.config.scrollable"
                    @update:model-value="(v) => emit('update', 'scrollable', v)"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
