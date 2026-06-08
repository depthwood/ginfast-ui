<template>
    <div class="image-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Image URL">
                <a-input
                    :model-value="props.config.src"
                    @update:model-value="(v) => emit('update', 'src', v)"
                    placeholder="Enter image URL"
                />
            </a-form-item>

            <a-form-item label="Height (px)">
                <a-input-number
                    :model-value="props.config.height"
                    @update:model-value="(v) => emit('update', 'height', v)"
                    placeholder="150"
                    :min="10"
                />
            </a-form-item>

            <a-form-item label="Rounded corners">
                <a-switch
                    :model-value="props.config.rounded"
                    @update:model-value="(v) => emit('update', 'rounded', v)"
                />
            </a-form-item>

            <a-form-item label="Fill mode">
                <a-select
                    :model-value="props.config.mode"
                    @update:model-value="(v) => emit('update', 'mode', v)"
                    placeholder="Select fill mode"
                >
                    <a-option value="aspectFill">Aspect Fill</a-option>
                    <a-option value="aspectFit">Aspect Fit</a-option>
                    <a-option value="widthFix">Width Fix</a-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Background color">
                <a-input
                    :model-value="props.config.background"
                    @update:model-value="(v) => emit('update', 'background', v)"
                    placeholder="e.g. #f2f3f5"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
