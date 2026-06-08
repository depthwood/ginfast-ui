<template>
    <div class="diy-editor-panel">
        <!-- ========== 左侧：组件库面板 ========== -->
        <div class="diy-sidebar">
            <div class="sidebar-header">
                <span class="sidebar-title">组件库</span>
            </div>
            <!-- 页面级编辑模式选择 -->
            <div class="sidebar-mode">
                <a-radio-group v-model="editMode" type="button" size="mini">
                    <a-radio value="page">当前页面</a-radio>
                    <a-radio value="shared">共享层</a-radio>
                </a-radio-group>
                <div class="mode-tip">{{ editModeTip }}</div>
            </div>
            <div class="sidebar-body">
                <a-collapse :default-active-key="['base', 'media', 'marketing']" :bordered="false">
                    <a-collapse-item
                        v-for="group in componentGroups"
                        :key="group.key"
                        :header="group.label"
                    >
                        <div class="component-grid">
                            <div
                                v-for="item in group.items"
                                :key="item.type"
                                class="component-item"
                                draggable="true"
                                @dragstart="onSidebarDragStart($event, item.type)"
                                @dragend="onSidebarDragEnd"
                            >
                                <div class="component-icon">
                                    <icon-fonts v-if="item.type === 'text'" />
                                    <icon-line-height v-else-if="item.type === 'spacer'" />
                                    <icon-thunderbolt v-else-if="item.type === 'button'" />
                                    <icon-notification v-else-if="item.type === 'notice'" />
                                    <icon-image v-else-if="item.type === 'carousel'" />
                                    <icon-file-image v-else-if="item.type === 'image'" />
                                    <icon-play-arrow v-else-if="item.type === 'video'" />
                                    <icon-apps v-else-if="item.type === 'nav-grid'" />
                                    <icon-layers v-else />
                                </div>
                                <span class="component-label">{{ item.label }}</span>
                            </div>
                        </div>
                    </a-collapse-item>
                </a-collapse>
            </div>
        </div>

        <!-- ========== 中间：手机画布区域 ========== -->
        <div class="diy-canvas">
            <div class="canvas-toolbar">
                <a-space>
                    <a-tag :color="editMode === 'page' ? 'arcoblue' : 'green'" size="small">
                        {{ editMode === 'page' ? currentPageTitle + ' 页面' : '共享层' }}
                    </a-tag>
                    <a-button size="small" @click="showPreview">
                        <template #icon><icon-eye /></template>
                        预览
                    </a-button>
                    <span class="canvas-tip">拖拽左侧组件到手机区域添加</span>
                </a-space>
            </div>
            <div
                class="canvas-body"
                @dragover.prevent="onCanvasDragOver"
                @dragleave="onCanvasDragLeave"
                @drop="onCanvasDrop"
            >
                <div class="phone-frame">
                    <div class="phone-header">
                        <span class="phone-title">{{ editMode === 'page' ? currentPageTitle : '共享组件' }} 预览</span>
                    </div>
                    <div class="phone-scroll">
                        <div
                            class="phone-content-area"
                            :class="{ 'drop-active': isDragOverCanvas && !isInternalDrag }"
                        >
                            <!-- 空状态 -->
                            <div v-if="modules.length === 0" class="canvas-empty">
                                <icon-layers style="font-size: 48px; color: var(--color-text-4);" />
                                <p>从左侧拖入组件开始搭建{{ editMode === 'page' ? currentPageTitle : '共享' }}页面</p>
                                <p v-if="sharedModules.length > 0 && editMode === 'page'" class="canvas-shared-hint">
                                    共享层有 {{ sharedModules.length }} 个组件
                                </p>
                            </div>

                            <!-- 共享层组件指示器（在页面模式下显示为背景） -->
                            <template v-if="editMode === 'page' && sharedModules.length > 0">
                                <div class="shared-indicator">
                                    <a-tag size="small" color="green">共享组件 ×{{ sharedModules.length }}</a-tag>
                                    <a-button size="mini" type="text" @click="editMode = 'shared'">编辑共享层</a-button>
                                </div>
                            </template>

                            <!-- 模块列表 -->
                            <div
                                v-for="(mod, index) in modules"
                                :key="mod.id"
                                class="canvas-module"
                                :class="{
                                    selected: selectedModuleId === mod.id,
                                    'drag-over-top': dragOverIndex === index && dragOverPosition === 'top',
                                    'drag-over-bottom': dragOverIndex === index && dragOverPosition === 'bottom',
                                    dragging: dragSourceIndex === index,
                                }"
                                draggable="true"
                                @click="selectModule(mod.id)"
                                @dragstart.stop="onModuleDragStart($event, index)"
                                @dragover.prevent.stop="onModuleDragOver($event, index)"
                                @dragleave.stop="onModuleDragLeave"
                                @drop.stop="onModuleDrop($event, index)"
                                @dragend.stop="onModuleDragEnd"
                            >
                                <div class="module-render">
                                    <render-module :module="mod" />
                                </div>

                                <!-- 选中遮罩层 + 工具栏 -->
                                <div v-if="selectedModuleId === mod.id" class="module-overlay">
                                    <div class="module-toolbar">
                                        <a-tooltip content="上移">
                                            <a-button size="mini" type="text" :disabled="index === 0" @click.stop="moveModule(index, -1)">
                                                <template #icon><icon-up /></template>
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip content="下移">
                                            <a-button size="mini" type="text" :disabled="index === modules.length - 1" @click.stop="moveModule(index, 1)">
                                                <template #icon><icon-down /></template>
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip content="复制">
                                            <a-button size="mini" type="text" @click.stop="copyModule(index)">
                                                <template #icon><icon-copy /></template>
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip content="删除">
                                            <a-button size="mini" type="text" status="danger" @click.stop="deleteModule(index)">
                                                <template #icon><icon-delete /></template>
                                            </a-button>
                                        </a-tooltip>
                                    </div>
                                    <span class="module-type-label">{{ moduleTypeLabels[mod.type] || mod.type }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========== 右侧：属性设置面板 ========== -->
        <div class="diy-settings">
            <div class="settings-header">
                <span class="settings-title">
                    <icon-settings style="margin-right: 4px;" />
                    属性设置
                </span>
            </div>
            <div class="settings-body" v-if="selectedModule">
                <a-tabs v-model:active-key="settingsTab" size="small" type="rounded">
                    <a-tab-pane key="content" title="内容配置">
                        <div class="settings-scroll">
                            <component
                                :is="currentSettingsComponent"
                                v-if="currentSettingsComponent"
                                :config="selectedModule.config"
                                @update="onConfigUpdate"
                            />
                            <a-empty v-else description="该组件暂无内容配置" />
                        </div>
                    </a-tab-pane>
                    <a-tab-pane key="style" title="样式设置">
                        <div class="settings-scroll">
                            <style-settings
                                :config="selectedModule.style || {}"
                                @update="onStyleUpdate"
                            />
                        </div>
                    </a-tab-pane>
                </a-tabs>
            </div>
            <div class="settings-body" v-else>
                <div class="settings-empty">
                    <icon-settings style="font-size: 36px; color: var(--color-text-4);" />
                    <p>请选择一个组件进行配置</p>
                </div>
            </div>
        </div>

        <!-- ========== 预览弹窗 ========== -->
        <a-modal
            v-model:visible="previewVisible"
            title="页面预览"
            :width="420"
            :footer="false"
            :mask-closable="true"
        >
            <div class="preview-modal-phone">
                <div class="preview-phone-header">
                    <span>{{ editMode === 'page' ? currentPageTitle : '共享组件' }} 预览</span>
                </div>
                <div class="preview-phone-scroll">
                    <!-- 在页面模式下也展示共享组件（灰底标记） -->
                    <template v-if="editMode === 'page' && sharedModules.length > 0">
                        <div class="preview-section-label">共享组件</div>
                        <div v-for="mod in sharedModules" :key="mod.id" class="preview-module shared-module">
                            <render-module :module="mod" />
                        </div>
                    </template>
                    <div class="preview-section-label" v-if="editMode === 'page' && sharedModules.length > 0">页面组件</div>
                    <div
                        v-for="mod in modules"
                        :key="mod.id"
                        class="preview-module"
                    >
                        <render-module :module="mod" />
                    </div>
                    <a-empty v-if="modules.length === 0 && sharedModules.length === 0" description="暂无组件" />
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, markRaw, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import RenderModule from './render-module.vue';
import TextSettings from './settings/text-settings.vue';
import CarouselSettings from './settings/carousel-settings.vue';
import ImageSettings from './settings/image-settings.vue';
import ButtonSettings from './settings/button-settings.vue';
import SpacerSettings from './settings/spacer-settings.vue';
import NavGridSettings from './settings/nav-grid-settings.vue';
import NoticeSettings from './settings/notice-settings.vue';
import VideoSettings from './settings/video-settings.vue';
import StyleSettings from './settings/style-settings.vue';
import { DEFAULT_PAGE_DEFINITIONS } from '../../api/app-config';

// ==================== 类型定义 ====================

interface DiyModule {
    id: string;
    type: string;
    config: Record<string, any>;
    style?: Record<string, any>;
}

// ==================== 组件元信息 ====================

const moduleTypeLabels: Record<string, string> = {
    text: '文本', spacer: '间距', button: '按钮', notice: '公告',
    carousel: '轮播', image: '图片', video: '视频', 'nav-grid': '导航',
};

const defaultConfigs: Record<string, () => Record<string, any>> = {
    text: () => ({
        content: '请输入文本内容', size: 'default', color: '#1F2937',
        align: 'left', paddingTop: 10, paddingBottom: 10,
    }),
    spacer: () => ({ height: 20, background: 'transparent' }),
    button: () => ({
        text: '按钮', color: '#FFFFFF', backgroundColor: '#1677FF',
        borderRadius: 22, action: { type: 'route', value: 'home' },
    }),
    notice: () => ({
        text: '这是一条公告通知', icon: 'bell', color: '#E53935',
        background: '#FFF8E1', scrollable: true,
    }),
    carousel: () => ({
        height: 170,
        items: [
            { id: '1', image: '', title: '轮播一', desc: '描述文字', action: { type: 'route', value: 'home' } },
            { id: '2', image: '', title: '轮播二', desc: '描述文字', action: { type: 'route', value: 'work' } },
        ],
    }),
    image: () => ({
        src: '', height: 170, rounded: true, mode: 'aspectFill', background: '#F2F2F2',
    }),
    video: () => ({ src: '', poster: '', autoplay: false, height: 200 }),
    'nav-grid': () => ({
        columns: 4,
        items: [
            { id: '1', icon: 'home', title: '首页', action: { type: 'route', value: 'home' } },
            { id: '2', icon: 'grid', title: '服务', action: { type: 'route', value: 'work' } },
            { id: '3', icon: 'gift', title: '活动', action: { type: 'route', value: 'discover' } },
            { id: '4', icon: 'chat', title: '消息', action: { type: 'route', value: 'message' } },
        ],
    }),
};

const componentGroups = [
    {
        key: 'base', label: '基础组件',
        items: [
            { type: 'text', label: '文本' }, { type: 'spacer', label: '间距' },
            { type: 'button', label: '按钮' }, { type: 'notice', label: '公告' },
        ],
    },
    {
        key: 'media', label: '图文媒体',
        items: [
            { type: 'carousel', label: '轮播' }, { type: 'image', label: '图片' },
            { type: 'video', label: '视频' }, { type: 'nav-grid', label: '导航' },
        ],
    },
    {
        key: 'marketing', label: '营销组件',
        items: [] as Array<{ type: string; label: string }>,
    },
];

const settingsComponentMap: Record<string, any> = {
    text: markRaw(TextSettings),
    carousel: markRaw(CarouselSettings),
    image: markRaw(ImageSettings),
    button: markRaw(ButtonSettings),
    spacer: markRaw(SpacerSettings),
    'nav-grid': markRaw(NavGridSettings),
    notice: markRaw(NoticeSettings),
    video: markRaw(VideoSettings),
};

// ==================== Props 与 Emits ====================

const props = withDefaults(
    defineProps<{
        extra?: string;
        pageCode?: string;
    }>(),
    { extra: '', pageCode: 'home' },
);

const emit = defineEmits<{
    (e: 'update:extra', value: string): void;
}>();

// ==================== 内部状态 ====================

/** 编辑模式：page = 当前页面, shared = 共享层 */
const editMode = ref<'page' | 'shared'>('page');

/** 当前页面的模块列表 */
const modules = ref<DiyModule[]>([]);

/** 共享层模块列表 */
const sharedModules = ref<DiyModule[]>([]);

const selectedModuleId = ref<string | null>(null);
const settingsTab = ref('content');
const previewVisible = ref(false);
let isInternalUpdate = false;

// ==================== 拖拽状态 ====================

let isDraggingFromSidebar = false;
let dragModuleType = '';
const dragSourceIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const dragOverPosition = ref<'top' | 'bottom' | null>(null);
const isInternalDrag = computed(() => dragSourceIndex.value !== null);
const isDragOverCanvas = ref(false);

// ==================== 计算属性 ====================

const currentPageTitle = computed(() => {
    const page = DEFAULT_PAGE_DEFINITIONS.find(p => p.id === props.pageCode);
    return page?.title || props.pageCode;
});

const editModeTip = computed(() => {
    if (editMode.value === 'page') {
        return `编辑 ${currentPageTitle.value} 页面专属组件`;
    }
    return '编辑所有页面共享的组件';
});

const selectedModule = computed(() => {
    if (!selectedModuleId.value) return null;
    return modules.value.find((m) => m.id === selectedModuleId.value) || null;
});

const currentSettingsComponent = computed(() => {
    if (!selectedModule.value) return null;
    return settingsComponentMap[selectedModule.value.type] || null;
});

// ==================== 工具函数 ====================

function safeParseJson<T>(json: string, fallback: T): T {
    try { return JSON.parse(json) as T; } catch { return fallback; }
}

function generateId(): string {
    return 'mod_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/** 从 extra JSON 中提取指定页面的模块列表 */
function extractPageModules(extraStr: string, pageCode: string): DiyModule[] {
    const data = safeParseJson<Record<string, any>>(extraStr, {});

    // 新结构：extra.pages[pageCode].modules
    if (data.pages && typeof data.pages === 'object' && !Array.isArray(data.pages)) {
        const pageData = data.pages[pageCode];
        if (pageData && Array.isArray(pageData.modules)) {
            return pageData.modules;
        }
    }

    // 兼容旧结构：extra.diy.modules（仅 home 页面）
    if (pageCode === 'home' && data.diy && Array.isArray(data.diy.modules)) {
        return data.diy.modules;
    }

    return [];
}

/** 从 extra JSON 中提取共享层模块列表 */
function extractSharedModules(extraStr: string): DiyModule[] {
    const data = safeParseJson<Record<string, any>>(extraStr, {});
    if (data.shared && Array.isArray(data.shared.modules)) {
        return data.shared.modules;
    }
    return [];
}

/** 将内部模块序列化并通知父组件 */
function emitUpdate() {
    isInternalUpdate = true;
    const data = safeParseJson<Record<string, any>>(props.extra, {});

    // 确保新结构存在
    if (!data.shared) data.shared = {};
    if (!data.pages) data.pages = {};

    if (editMode.value === 'shared') {
        data.shared.modules = sharedModules.value;
    } else {
        const pageCode = props.pageCode || 'home';
        if (!data.pages[pageCode]) data.pages[pageCode] = {};
        data.pages[pageCode].modules = modules.value;
    }

    emit('update:extra', JSON.stringify(data, null, 2));
    nextTick(() => { isInternalUpdate = false; });
}

/** 重新加载所有模块数据 */
function reloadModules() {
    modules.value = extractPageModules(props.extra, props.pageCode || 'home');
    sharedModules.value = extractSharedModules(props.extra);
    // 清除选中状态
    if (selectedModuleId.value && !modules.value.find(m => m.id === selectedModuleId.value)) {
        selectedModuleId.value = null;
    }
}

// ==================== 生命周期与监听 ====================

watch(
    () => props.extra,
    (newVal) => {
        if (isInternalUpdate) return;
        reloadModules();
    },
);

watch(
    () => props.pageCode,
    () => {
        // 页面切换时重新加载对应页面的模块
        reloadModules();
        selectedModuleId.value = null;
        editMode.value = 'page';
    },
);

onMounted(() => {
    reloadModules();
});

// ==================== 侧边栏拖拽 ====================

function onSidebarDragStart(_event: DragEvent, type: string) {
    isDraggingFromSidebar = true;
    dragModuleType = type;
    dragSourceIndex.value = null;
}

function onSidebarDragEnd() {
    isDraggingFromSidebar = false;
    dragModuleType = '';
    isDragOverCanvas.value = false;
}

// ==================== 画布区域拖拽 ====================

function onCanvasDragOver(event: DragEvent) {
    if (!isDraggingFromSidebar) return;
    event.preventDefault();
    isDragOverCanvas.value = true;
}

function onCanvasDragLeave() {
    if (isDraggingFromSidebar) isDragOverCanvas.value = false;
}

function onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    isDragOverCanvas.value = false;
    if (!isDraggingFromSidebar || !dragModuleType) return;
    addModule(dragModuleType);
    isDraggingFromSidebar = false;
    dragModuleType = '';
}

// ==================== 模块排序拖拽 ====================

function onModuleDragStart(event: DragEvent, index: number) {
    event.stopPropagation();
    dragSourceIndex.value = index;
    isDraggingFromSidebar = false;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
    }
}

function onModuleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (dragSourceIndex.value === index) {
        dragOverIndex.value = null; dragOverPosition.value = null; return;
    }
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    dragOverIndex.value = index;
    dragOverPosition.value = event.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
}

function onModuleDragLeave() {
    dragOverIndex.value = null; dragOverPosition.value = null;
}

function onModuleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    const sourceIndex = dragSourceIndex.value;
    if (sourceIndex === null || sourceIndex === targetIndex) { resetDragState(); return; }
    let insertIndex = targetIndex;
    if (dragOverPosition.value === 'bottom') insertIndex = targetIndex + 1;
    if (sourceIndex < insertIndex) insertIndex -= 1;
    const list = [...modules.value];
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(insertIndex, 0, moved);
    modules.value = list;
    emitUpdate();
    resetDragState();
}

function onModuleDragEnd() { resetDragState(); }

function resetDragState() {
    dragSourceIndex.value = null; dragOverIndex.value = null; dragOverPosition.value = null;
}

// ==================== 模块 CRUD ====================

function addModule(type: string) {
    const configFactory = defaultConfigs[type];
    if (!configFactory) { Message.warning(`未知组件类型: ${type}`); return; }
    const newModule: DiyModule = { id: generateId(), type, config: configFactory(), style: {} };
    modules.value = [...modules.value, newModule];
    selectedModuleId.value = newModule.id;
    settingsTab.value = 'content';
    emitUpdate();
    Message.success(`已添加${moduleTypeLabels[type] || type}组件`);
}

function selectModule(id: string) {
    selectedModuleId.value = id;
    settingsTab.value = 'content';
}

function moveModule(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= modules.value.length) return;
    const list = [...modules.value];
    [list[index], list[target]] = [list[target], list[index]];
    modules.value = list;
    emitUpdate();
}

function copyModule(index: number) {
    const original = modules.value[index];
    const clone: DiyModule = {
        ...original, id: generateId(),
        config: JSON.parse(JSON.stringify(original.config)),
        style: JSON.parse(JSON.stringify(original.style || {})),
    };
    const list = [...modules.value];
    list.splice(index + 1, 0, clone);
    modules.value = list;
    selectedModuleId.value = clone.id;
    emitUpdate();
    Message.success('已复制组件');
}

function deleteModule(index: number) {
    const deletedId = modules.value[index].id;
    modules.value = modules.value.filter((_, i) => i !== index);
    if (deletedId === selectedModuleId.value) selectedModuleId.value = null;
    emitUpdate();
    Message.success('已删除组件');
}

// ==================== 配置更新 ====================

function onConfigUpdate(key: string, value: any) {
    if (!selectedModule.value) return;
    const idx = modules.value.findIndex((m) => m.id === selectedModuleId.value);
    if (idx === -1) return;
    const list = [...modules.value];
    list[idx] = { ...list[idx], config: { ...list[idx].config, [key]: value } };
    modules.value = list;
    emitUpdate();
}

function onStyleUpdate(key: string, value: any) {
    if (!selectedModule.value) return;
    const idx = modules.value.findIndex((m) => m.id === selectedModuleId.value);
    if (idx === -1) return;
    const list = [...modules.value];
    list[idx] = { ...list[idx], style: { ...(list[idx].style || {}), [key]: value } };
    modules.value = list;
    emitUpdate();
}

// ==================== 预览 ====================

function showPreview() {
    if (modules.value.length === 0 && sharedModules.value.length === 0) {
        Message.info('暂无组件可预览'); return;
    }
    previewVisible.value = true;
}
</script>

<style lang="scss" scoped>
.diy-editor-panel {
    display: flex; flex: 1; min-height: 0; gap: 0;
    background: var(--color-fill-1);
    border: 1px solid var(--color-border-2); border-radius: 6px; overflow: hidden;
}

.diy-sidebar {
    width: 220px; flex-shrink: 0; background: var(--color-bg-2);
    border-right: 1px solid var(--color-border-2);
    display: flex; flex-direction: column; min-height: 0;
}

.sidebar-header {
    padding: 12px 16px; border-bottom: 1px solid var(--color-border-2);
    font-weight: 600; font-size: 14px; color: var(--color-text-1);
}

.sidebar-mode {
    padding: 8px 12px; border-bottom: 1px solid var(--color-border-1);
}

.mode-tip {
    margin-top: 4px; font-size: 11px; color: var(--color-text-3);
}

.sidebar-body {
    flex: 1; overflow-y: auto; padding: 4px 0;
    :deep(.arco-collapse) { border: none; }
    :deep(.arco-collapse-item-header) {
        font-size: 13px; font-weight: 500; color: var(--color-text-2); padding: 8px 16px;
    }
    :deep(.arco-collapse-item-content) { padding: 4px 12px 12px; }
}

.component-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.component-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 10px 4px; border: 1px solid var(--color-border-1); border-radius: 6px;
    cursor: grab; transition: all 0.2s ease; background: var(--color-bg-2); user-select: none;
    &:hover { border-color: rgb(var(--primary-6)); color: rgb(var(--primary-6)); background: var(--color-primary-light-1); }
    &:active { cursor: grabbing; }
    .component-icon { font-size: 22px; margin-bottom: 4px; color: var(--color-text-2); }
    &:hover .component-icon { color: rgb(var(--primary-6)); }
    .component-label { font-size: 12px; color: var(--color-text-2); }
    &:hover .component-label { color: rgb(var(--primary-6)); }
}

.diy-canvas {
    flex: 1; min-width: 0; display: flex; flex-direction: column;
    background: var(--color-fill-2); min-height: 0;
}

.canvas-toolbar {
    padding: 8px 16px; border-bottom: 1px solid var(--color-border-2);
    background: var(--color-bg-2); display: flex; align-items: center;
}

.canvas-tip { font-size: 12px; color: var(--color-text-3); }

.canvas-body {
    flex: 1; overflow-y: auto; display: flex; justify-content: center;
    padding: 20px 16px; min-height: 0;
}

.phone-frame {
    width: 375px; min-height: 600px; flex-shrink: 0;
    border: 8px solid #1f2937; border-radius: 32px; background: var(--color-bg-1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: flex; flex-direction: column; overflow: hidden;
}

.phone-header {
    height: 44px; background: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.phone-title { font-size: 14px; font-weight: 600; color: var(--color-text-1); }

.phone-scroll { flex: 1; overflow-y: auto; min-height: 0; }

.phone-content-area {
    min-height: 400px; padding: 8px; transition: background 0.2s ease;
    &.drop-active {
        background: var(--color-primary-light-1);
        outline: 2px dashed rgb(var(--primary-6)); outline-offset: -4px; border-radius: 4px;
    }
}

.canvas-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 360px; color: var(--color-text-4);
    p { margin-top: 12px; font-size: 13px; }
}

.canvas-shared-hint {
    color: var(--color-text-3) !important; font-size: 12px !important;
}

.shared-indicator {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 8px; margin-bottom: 8px;
    background: var(--color-success-light-1); border-radius: 4px;
}

.canvas-module {
    position: relative; margin-bottom: 4px;
    border: 2px solid transparent; border-radius: 6px;
    cursor: pointer; transition: border-color 0.15s ease, opacity 0.15s ease;
    overflow: hidden; background: var(--color-bg-2);
    &:hover { border-color: var(--color-primary-light-3); }
    &.selected { border-color: rgb(var(--primary-6)); }
    &.drag-over-top { border-top: 3px solid rgb(var(--primary-6)); }
    &.drag-over-bottom { border-bottom: 3px solid rgb(var(--primary-6)); }
    &.dragging { opacity: 0.4; }
}

.module-render { padding: 4px; pointer-events: none; }

.module-overlay {
    position: absolute; inset: 0; background: rgba(var(--primary-6), 0.04);
    display: flex; flex-direction: column; justify-content: space-between; pointer-events: none;
}

.module-toolbar {
    display: flex; justify-content: flex-end; gap: 2px; padding: 4px;
    background: linear-gradient(to bottom, rgba(var(--primary-6), 0.08), transparent);
    pointer-events: auto;
}

.module-type-label {
    position: absolute; top: 4px; left: 4px; font-size: 11px;
    color: #fff; background: rgb(var(--primary-6));
    padding: 1px 6px; border-radius: 3px; line-height: 1.4;
}

.diy-settings {
    width: 320px; flex-shrink: 0; background: var(--color-bg-2);
    border-left: 1px solid var(--color-border-2);
    display: flex; flex-direction: column; min-height: 0;
}

.settings-header {
    padding: 12px 16px; border-bottom: 1px solid var(--color-border-2);
    font-weight: 600; font-size: 14px; color: var(--color-text-1);
    display: flex; align-items: center;
}

.settings-title { display: flex; align-items: center; }

.settings-body {
    flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0;
    :deep(.arco-tabs) { flex: 1; display: flex; flex-direction: column; min-height: 0; }
    :deep(.arco-tabs-content) { flex: 1; min-height: 0; }
    :deep(.arco-tabs-content-inner) { height: 100%; }
    :deep(.arco-tabs-pane) { height: 100%; }
    :deep(.arco-tabs-nav-tab) { padding: 0 12px; }
}

.settings-scroll { height: 100%; overflow-y: auto; padding: 12px 16px; }

.settings-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: var(--color-text-4);
    p { margin-top: 10px; font-size: 13px; }
}

.preview-modal-phone {
    width: 375px; margin: 0 auto;
    border: 6px solid #1f2937; border-radius: 28px;
    background: var(--color-bg-1); overflow: hidden;
}

.preview-phone-header {
    height: 40px; background: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: var(--color-text-1);
}

.preview-phone-scroll { max-height: 600px; overflow-y: auto; padding: 8px; }

.preview-section-label {
    font-size: 11px; color: var(--color-text-3); font-weight: 600;
    padding: 6px 4px 4px; text-transform: uppercase;
}

.shared-module {
    opacity: 0.7; border-left: 3px solid var(--color-success-6);
}

.preview-module { margin-bottom: 4px; }
</style>
