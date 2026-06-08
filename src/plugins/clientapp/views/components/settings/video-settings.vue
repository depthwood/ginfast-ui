<template>
    <div class="video-settings">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="Video URL">
                <a-input
                    :model-value="props.config.src"
                    @update:model-value="(v) => emit('update', 'src', v)"
                    placeholder="Enter video URL"
                />
            </a-form-item>

            <a-form-item label="Poster URL">
                <a-input
                    :model-value="props.config.poster"
                    @update:model-value="(v) => emit('update', 'poster', v)"
                    placeholder="Enter cover image URL"
                />
            </a-form-item>

            <a-form-item label="Autoplay">
                <a-switch
                    :model-value="props.config.autoplay"
                    @update:model-value="(v) => emit('update', 'autoplay', v)"
                />
            </a-form-item>

            <a-form-item label="Height (px)">
                <a-input-number
                    :model-value="props.config.height"
                    @update:model-value="(v) => emit('update', 'height', v)"
                    placeholder="200"
                    :min="50"
                />
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ config: Record<string, any> }>();
const emit = defineEmits<{ (e: 'update', key: string, value: any): void }>();
</script>
