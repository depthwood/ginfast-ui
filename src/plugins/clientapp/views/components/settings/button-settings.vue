<template>
    <div class="button-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Button text">
                <a-input
                    :model-value="props.config.text"
                    @update:model-value="(v) => emit('update', 'text', v)"
                    placeholder="Enter button text"
                />
            </a-form-item>

            <a-form-item label="Text color">
                <a-input
                    :model-value="props.config.color"
                    @update:model-value="(v) => emit('update', 'color', v)"
                    placeholder="e.g. #ffffff"
                />
            </a-form-item>

            <a-form-item label="Background color">
                <a-input
                    :model-value="props.config.backgroundColor"
                    @update:model-value="(v) => emit('update', 'backgroundColor', v)"
                    placeholder="e.g. #165DFF"
                />
            </a-form-item>

            <a-form-item label="Border radius (px)">
                <a-input-number
                    :model-value="props.config.borderRadius"
                    @update:model-value="(v) => emit('update', 'borderRadius', v)"
                    placeholder="4"
                    :min="0"
                />
            </a-form-item>

            <a-divider>Action</a-divider>

            <a-form-item label="Action type">
                <a-select
                    :model-value="props.config.action?.type"
                    @update:model-value="(v) => emit('update', 'action', { ...(props.config.action || {}), type: v })"
                    placeholder="Select action type"
                >
                    <a-option value="route">Route</a-option>
                    <a-option value="url">URL</a-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Action value">
                <a-input
                    :model-value="props.config.action?.value"
                    @update:model-value="(v) => emit('update', 'action', { ...(props.config.action || {}), value: v })"
                    placeholder="Enter route path or URL"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
