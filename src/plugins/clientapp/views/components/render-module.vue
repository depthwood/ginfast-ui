<template>
    <div class="render-module">
        <!-- text -->
        <div v-if="module.type === 'text'" class="preview-text" :style="textStyle">
            {{ module.config.content }}
        </div>

        <!-- carousel -->
        <div v-else-if="module.type === 'carousel'" class="preview-carousel">
            <a-carousel
                :style="{ height: (module.config.height || 200) + 'px' }"
                :auto-play="false"
            >
                <div
                    v-for="(item, index) in (module.config.items || [])"
                    :key="index"
                    class="carousel-item"
                    :style="{
                        height: (module.config.height || 200) + 'px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f2f3f5',
                    }"
                >
                    <div v-if="item.image" class="carousel-image">
                        <img :src="item.image" :alt="item.title" style="max-width: 100%; max-height: 60%;" />
                    </div>
                    <div class="carousel-title" style="font-size: 14px; margin-top: 8px; color: #333;">
                        {{ item.title }}
                    </div>
                    <div class="carousel-desc" style="font-size: 12px; color: #999; margin-top: 4px;">
                        {{ item.desc }}
                    </div>
                </div>
            </a-carousel>
            <div
                v-if="!module.config.items || module.config.items.length === 0"
                class="carousel-empty"
                :style="{ height: (module.config.height || 200) + 'px' }"
            >
                <span style="color: #c9cdd4;">No carousel items</span>
            </div>
        </div>

        <!-- image -->
        <div v-else-if="module.type === 'image'" class="preview-image">
            <div
                :style="{
                    height: (module.config.height || 150) + 'px',
                    borderRadius: module.config.rounded ? '8px' : '0',
                    background: module.config.background || '#f2f3f5',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }"
            >
                <img
                    v-if="module.config.src"
                    :src="module.config.src"
                    :style="{
                        width: '100%',
                        height: '100%',
                        objectFit: module.config.mode || 'aspectFill',
                    }"
                />
                <span v-else style="color: #c9cdd4;">Image placeholder</span>
            </div>
        </div>

        <!-- button -->
        <div v-else-if="module.type === 'button'" class="preview-button">
            <div
                :style="{
                    display: 'inline-block',
                    padding: '8px 24px',
                    color: module.config.color || '#fff',
                    backgroundColor: module.config.backgroundColor || '#165DFF',
                    borderRadius: (module.config.borderRadius || 4) + 'px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                }"
            >
                {{ module.config.text || 'Button' }}
            </div>
        </div>

        <!-- spacer -->
        <div
            v-else-if="module.type === 'spacer'"
            class="preview-spacer"
            :style="{
                height: (module.config.height || 20) + 'px',
                background: module.config.background || 'transparent',
            }"
        ></div>

        <!-- nav-grid -->
        <div v-else-if="module.type === 'nav-grid'" class="preview-nav-grid">
            <div
                class="nav-grid-container"
                :style="{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${module.config.columns || 4}, 1fr)`,
                    gap: '8px',
                }"
            >
                <div
                    v-for="(item, index) in (module.config.items || [])"
                    :key="index"
                    class="nav-grid-item"
                    style="display: flex; flex-direction: column; align-items: center; padding: 8px 0;"
                >
                    <div
                        class="nav-icon"
                        style="width: 36px; height: 36px; background: #f2f3f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;"
                    >
                        {{ item.icon || '?' }}
                    </div>
                    <div class="nav-title" style="font-size: 12px; color: #333; margin-top: 4px;">
                        {{ item.title }}
                    </div>
                </div>
            </div>
            <div
                v-if="!module.config.items || module.config.items.length === 0"
                style="text-align: center; padding: 16px; color: #c9cdd4;"
            >
                No nav items
            </div>
        </div>

        <!-- notice -->
        <div
            v-else-if="module.type === 'notice'"
            class="preview-notice"
            :style="{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                color: module.config.color || '#333',
                background: module.config.background || '#fffbe6',
                fontSize: '13px',
            }"
        >
            <span v-if="module.config.icon" class="notice-icon" style="margin-right: 8px;">
                {{ module.config.icon }}
            </span>
            <span
                class="notice-text"
                :style="{
                    whiteSpace: module.config.scrollable ? 'nowrap' : 'normal',
                    overflow: module.config.scrollable ? 'hidden' : 'visible',
                }"
            >
                {{ module.config.text || 'Notice text' }}
            </span>
        </div>

        <!-- video -->
        <div
            v-else-if="module.type === 'video'"
            class="preview-video"
            :style="{
                height: (module.config.height || 200) + 'px',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }"
        >
            <div style="color: #fff; font-size: 14px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">&#9654;</div>
                <div>Video placeholder</div>
            </div>
        </div>

        <!-- unknown -->
        <div v-else class="preview-unknown" style="padding: 20px; text-align: center; color: #c9cdd4;">
            Unknown module: {{ module.type }}
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    module: {
        type: string;
        config: Record<string, any>;
    };
}>();

const textStyle = computed(() => {
    const config = props.module.config || {};
    const sizeMap: Record<string, string> = {
        title: '20px',
        large: '18px',
        small: '12px',
        default: '14px',
    };
    return {
        fontSize: sizeMap[config.size] || sizeMap.default,
        color: config.color || '#333',
        textAlign: config.align || 'left',
        paddingTop: (config.paddingTop || 0) + 'px',
        paddingBottom: (config.paddingBottom || 0) + 'px',
    };
});
</script>

<style scoped>
.render-module {
    width: 100%;
}

.preview-text {
    word-break: break-word;
    line-height: 1.6;
}

.preview-carousel .carousel-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f2f3f5;
}

.preview-image {
    overflow: hidden;
}

.preview-button {
    text-align: center;
    padding: 8px 0;
}

.preview-spacer {
    width: 100%;
}
</style>
