<template>
    <div class="style-settings">
        <a-form :model="{}" layout="vertical">
            <a-divider>Padding</a-divider>

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

            <a-form-item label="Padding left (px)">
                <a-input-number
                    :model-value="props.config.paddingLeft"
                    @update:model-value="(v) => emit('update', 'paddingLeft', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-form-item label="Padding right (px)">
                <a-input-number
                    :model-value="props.config.paddingRight"
                    @update:model-value="(v) => emit('update', 'paddingRight', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-divider>Margin</a-divider>

            <a-form-item label="Margin top (px)">
                <a-input-number
                    :model-value="props.config.marginTop"
                    @update:model-value="(v) => emit('update', 'marginTop', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-form-item label="Margin bottom (px)">
                <a-input-number
                    :model-value="props.config.marginBottom"
                    @update:model-value="(v) => emit('update', 'marginBottom', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-divider>Appearance</a-divider>

            <a-form-item label="Border radius (px)">
                <a-input-number
                    :model-value="props.config.borderRadius"
                    @update:model-value="(v) => emit('update', 'borderRadius', v)"
                    placeholder="0"
                    :min="0"
                />
            </a-form-item>

            <a-form-item label="Background color">
                <a-input
                    :model-value="props.config.backgroundColor"
                    @update:model-value="(v) => emit('update', 'backgroundColor', v)"
                    placeholder="e.g. #ffffff"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
