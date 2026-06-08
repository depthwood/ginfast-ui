<template>
    <div class="spacer-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Height (px)">
                <a-input-number
                    :model-value="props.config.height"
                    @update:model-value="(v) => emit('update', 'height', v)"
                    placeholder="20"
                    :min="1"
                />
            </a-form-item>

            <a-form-item label="Background color">
                <a-input
                    :model-value="props.config.background"
                    @update:model-value="(v) => emit('update', 'background', v)"
                    placeholder="e.g. transparent or #ffffff"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
