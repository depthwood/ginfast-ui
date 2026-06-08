<template>
    <div class="text-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Text content">
                <a-textarea
                    :model-value="props.config.content"
                    @update:model-value="(v) => emit('update', 'content', v)"
                    placeholder="Enter text content"
                    :auto-size="{ minRows: 2, maxRows: 6 }"
                />
            </a-form-item>

            <a-form-item label="Font size">
                <a-select
                    :model-value="props.config.size"
                    @update:model-value="(v) => emit('update', 'size', v)"
                    placeholder="Select font size"
                >
                    <a-option value="title">Title (20px)</a-option>
                    <a-option value="large">Large (18px)</a-option>
                    <a-option value="default">Default (14px)</a-option>
                    <a-option value="small">Small (12px)</a-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Text color">
                <a-input
                    :model-value="props.config.color"
                    @update:model-value="(v) => emit('update', 'color', v)"
                    placeholder="e.g. #333333"
                />
            </a-form-item>

            <a-form-item label="Text align">
                <a-radio-group
                    :model-value="props.config.align"
                    @update:model-value="(v) => emit('update', 'align', v)"
                    type="button"
                >
                    <a-radio value="left">Left</a-radio>
                    <a-radio value="center">Center</a-radio>
                    <a-radio value="right">Right</a-radio>
                </a-radio-group>
            </a-form-item>

            <a-form-item label="Padding top (px)">
                <a-input-number
                    :model-value="props.config.paddingTop"
                    @update:model-value="(v) => emit('update', 'paddingTop', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-form-item label="Padding bottom (px)">
                <a-input-number
                    :model-value="props.config.paddingBottom"
                    @update:model-value="(v) => emit('update', 'paddingBottom', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
