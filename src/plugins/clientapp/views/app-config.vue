<template>
    <div class="snow-page">
        <div class="workbench">
            <section class="designer">
                <div class="toolbar">
                    <a-space wrap>
                        <a-select v-model="activeClientId" placeholder="选择客户端" style="width: 240px" @change="handleClientChange">
                            <a-option v-for="item in clientOptions" :key="item.id" :value="item.id">
                                {{ item.clientName }} ({{ item.clientKey }})
                            </a-option>
                        </a-select>
                        <!-- 方案选择器 -->
                        <a-select v-model="activeConfigId" placeholder="选择配置方案" allow-clear style="width: 220px" @change="handleConfigChange">
                            <a-option v-for="item in dataList" :key="item.id" :value="item.id">
                                <span>{{ item.name }}</span>
                                <a-tag v-if="item.isActive" color="green" size="small" style="margin-left:4px;">激活</a-tag>
                                <a-tag v-else-if="item.status === 1" size="small">启用</a-tag>
                                <a-tag v-else size="small" color="gray">停用</a-tag>
                            </a-option>
                        </a-select>
                        <a-button @click="createConfig">新建方案</a-button>
                        <a-button @click="jsonVisible = true">高级 JSON</a-button>
                        <a-divider direction="vertical" />
                        <!-- 页面选择器 -->
                        <a-select v-model="activePageCode" placeholder="选择页面" style="width: 140px" @change="handlePageChange">
                            <a-option v-for="page in pageDefinitions" :key="page.id" :value="page.id">
                                {{ page.title }}
                            </a-option>
                        </a-select>
                        <a-divider direction="vertical" />
                        <a-radio-group v-model="decoMode" type="button" size="small">
                            <a-radio value="ai">智能装修</a-radio>
                            <a-radio value="manual">手动装修</a-radio>
                        </a-radio-group>
                        <a-button type="primary" :loading="saving" @click="handlePublish" v-hasPerm="['plugins:clientapp:appconfig:publish','plugins:clientapp:appconfig:save']">
                            发布到 App
                        </a-button>
                    </a-space>
                    <div class="toolbar-actions">
                        <a-space>
                            <a-button size="small" @click="handleActivateScheme" :disabled="!activeConfigId || currentConfigIsActive">
                                {{ currentConfigIsActive ? '当前已激活' : '激活此方案' }}
                            </a-button>
                            <a-button size="small" @click="showSnapshotDrawer">版本历史</a-button>
                            <a-button size="small" @click="handleCreateSnapshot" :disabled="!activeConfigId">保存快照</a-button>
                        </a-space>
                    </div>
                </div>

                <div class="designer-body">
                    <!-- AI 智能装修模式：手机预览 + 表单编辑 -->
                    <template v-if="decoMode === 'ai'">
                    <div class="phone-shell">
                        <div class="phone-screen" :style="{ backgroundColor: themePreview.pageBgColor }">
                            <div class="phone-navbar" :style="{ backgroundColor: themePreview.cardBgColor, color: themePreview.textColor }">
                                {{ themePreview.brandName || 'GinFast' }} - {{ currentPageTitle }}
                            </div>
                            <div class="phone-content">
                                <!-- 首页预览 -->
                                <template v-if="activePageCode === 'home'">
                                    <div class="banner" :style="{ backgroundColor: firstBanner.bgColor || themePreview.primaryColor }">
                                        <div>
                                            <div class="banner-title">{{ firstBanner.title }}</div>
                                            <div class="banner-desc">{{ firstBanner.desc }}</div>
                                            <button class="banner-button" :style="{ color: firstBanner.bgColor || themePreview.primaryColor }">
                                                {{ firstBanner.buttonText }}
                                            </button>
                                        </div>
                                        <div class="banner-mark">{{ firstBanner.mark }}</div>
                                    </div>
                                    <div class="notice" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <span class="notice-dot" :style="{ backgroundColor: themePreview.primarySoftColor, color: themePreview.primaryColor }">!</span>
                                        <span>{{ homePreview.notice }}</span>
                                    </div>
                                    <div class="search" :style="{ backgroundColor: themePreview.cardBgColor, color: themePreview.subTextColor }">
                                        搜索服务、活动、帮助
                                    </div>
                                    <div class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head">
                                            <strong>热门服务</strong>
                                            <span :style="{ color: themePreview.primaryColor }">更多</span>
                                        </div>
                                        <div class="service-grid">
                                            <div v-for="item in homePreview.quickServices" :key="item.id" class="service-item">
                                                <div class="service-icon" :style="{ backgroundColor: iconColor(item.className) }">{{ item.title?.slice(0, 1) }}</div>
                                                <span>{{ item.title }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head"><strong>最新动态</strong><span>本周精选</span></div>
                                        <div v-for="item in homePreview.news" :key="item.id" class="news-row">
                                            <strong>{{ item.title }}</strong>
                                            <span>{{ item.desc }}</span>
                                        </div>
                                    </div>
                                </template>

                                <!-- 服务页预览 -->
                                <template v-else-if="activePageCode === 'work'">
                                    <div class="page-preview-header">服务页面</div>
                                    <div class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head"><strong>服务分类</strong></div>
                                        <div class="service-grid">
                                            <div v-for="item in workPreview.services" :key="item.id" class="service-item">
                                                <div class="service-icon" :style="{ backgroundColor: themePreview.primaryColor }">{{ item.title?.slice(0, 1) }}</div>
                                                <span>{{ item.title }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <!-- 活动页预览 -->
                                <template v-else-if="activePageCode === 'discover'">
                                    <div class="page-preview-header">活动页面</div>
                                    <div v-for="item in discoverPreview.featured" :key="item.id" class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head"><strong>{{ item.title }}</strong><a-tag size="small">{{ item.tag }}</a-tag></div>
                                        <span :style="{ color: themePreview.subTextColor, fontSize: '12px' }">{{ item.desc }}</span>
                                    </div>
                                </template>

                                <!-- 消息页预览 -->
                                <template v-else-if="activePageCode === 'message'">
                                    <div class="page-preview-header">消息页面</div>
                                    <div v-for="item in messagePreview.categories" :key="item.id" class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head"><strong>{{ item.title }}</strong><span :style="{ color: themePreview.subTextColor }">查看</span></div>
                                    </div>
                                </template>

                                <!-- 我的页预览 -->
                                <template v-else-if="activePageCode === 'mine'">
                                    <div class="mine-header" :style="{ backgroundColor: minePreview.userCard?.bgColor || themePreview.primaryColor }">
                                        <div class="mine-avatar">{{ userEntryText }}</div>
                                        <div class="mine-info">
                                            <div style="color:#fff;font-weight:600;">用户中心</div>
                                            <div style="color:rgba(255,255,255,0.7);font-size:12px;">个人信息和设置</div>
                                        </div>
                                    </div>
                                    <div v-for="group in minePreview.menuGroups" :key="group.id" class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                        <div class="section-head"><strong>{{ group.title }}</strong></div>
                                        <div class="service-grid">
                                            <div v-for="item in group.items" :key="item.id" class="service-item">
                                                <div class="service-icon" :style="{ backgroundColor: themePreview.primaryColor }">{{ item.title?.slice(0, 1) }}</div>
                                                <span>{{ item.title }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <!-- 通用占位 -->
                                <template v-else>
                                    <div class="canvas-empty">
                                        <p>{{ currentPageTitle }} - 装修预览</p>
                                    </div>
                                </template>
                            </div>
                            <div class="phone-tabbar" :style="{ backgroundColor: themePreview.cardBgColor }">
                                <span v-for="item in navPreview" :key="item.id" :class="{ active: item.id === activePageCode }">{{ item.title }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="inspector">
                        <a-form :model="form" layout="vertical">
                            <a-row :gutter="12">
                                <a-col :span="12">
                                    <a-form-item label="配置名称">
                                        <a-input v-model="form.name" />
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item label="状态">
                                        <a-select v-model="form.status">
                                            <a-option v-for="item in STATUS_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                            <a-form-item label="品牌名">
                                <a-input v-model="themeDraft.brandName" @change="syncDraftTheme" />
                            </a-form-item>
                            <a-form-item label="主色">
                                <a-input v-model="themeDraft.primaryColor" @change="syncDraftTheme" />
                            </a-form-item>

                            <!-- 根据当前页面显示不同的编辑字段 -->
                            <template v-if="activePageCode === 'home'">
                                <a-form-item label="首页公告">
                                    <a-input v-model="homeDraft.notice" @change="syncDraftHome" />
                                </a-form-item>
                                <a-form-item label="首屏标题">
                                    <a-input v-model="homeDraft.bannerTitle" @change="syncDraftHome" />
                                </a-form-item>
                                <a-form-item label="首屏描述">
                                    <a-textarea v-model="homeDraft.bannerDesc" :auto-size="{ minRows: 2, maxRows: 3 }" @change="syncDraftHome" />
                                </a-form-item>
                            </template>
                            <template v-else>
                                <a-alert type="info" style="margin-bottom:12px;">
                                    当前编辑 <strong>{{ currentPageTitle }}</strong> 页面。切换到"手动装修"模式可使用 DIY 编辑器自由编排此页面组件。
                                </a-alert>
                            </template>

                            <a-form-item label="备注">
                                <a-textarea v-model="form.remark" :auto-size="{ minRows: 2, maxRows: 3 }" />
                            </a-form-item>
                        </a-form>
                    </div>
                    </template>

                    <!-- 手动装修模式：可视化 DIY 编辑器（支持多页面） -->
                    <diy-editor-panel
                        v-else
                        :extra="diyExtra"
                        :page-code="activePageCode"
                        @update:extra="onDiyExtraUpdate"
                    />
                </div>
            </section>

            <aside class="chat" v-show="decoMode === 'ai'">
                <div class="chat-head">
                    <div>
                        <strong>AI 装修助手</strong>
                        <p>说出风格、行业、页面重点，生成后先预览，确认再发布。当前编辑：<strong>{{ currentPageTitle }}</strong></p>
                    </div>
                    <a-tag color="arcoblue">Schema 预览</a-tag>
                </div>
                <div class="messages">
                    <div v-for="item in messages" :key="item.id" class="message" :class="item.role">
                        <div class="bubble">{{ item.content }}</div>
                    </div>
                </div>
                <div v-if="pendingPreview" class="pending">
                    <strong>{{ pendingPreview.summary }}</strong>
                    <a-space>
                        <a-button size="small" type="primary" @click="applyPendingPreview">应用到预览</a-button>
                        <a-button size="small" @click="pendingPreview = null">丢弃</a-button>
                    </a-space>
                </div>
                <div class="composer">
                    <a-textarea v-model="prompt" :placeholder="`例如：为${currentPageTitle}做一个蓝色科技感风格`" :auto-size="{ minRows: 4, maxRows: 6 }" />
                    <a-button type="primary" long :loading="aiLoading" @click="sendPrompt" v-hasPerm="['plugins:clientapp:appconfig:preview']">
                        生成 {{ currentPageTitle }} 装修预览
                    </a-button>
                </div>
            </aside>
        </div>

        <!-- 高级 JSON 弹窗 -->
        <a-modal v-model:visible="jsonVisible" title="高级 JSON 配置" :width="900" :footer="false">
            <a-tabs default-active-key="theme">
                <a-tab-pane key="theme" title="主题"><a-textarea v-model="form.theme" :auto-size="{ minRows: 10 }" @blur="syncDraftsFromForm" /></a-tab-pane>
                <a-tab-pane key="pages" title="页面"><a-textarea v-model="form.pages" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="navigation" title="导航"><a-textarea v-model="form.navigation" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="flags" title="功能"><a-textarea v-model="form.featureFlags" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="extra" title="装修"><a-textarea v-model="form.extra" :auto-size="{ minRows: 10 }" @blur="syncDraftsFromForm" /></a-tab-pane>
            </a-tabs>
        </a-modal>

        <!-- 版本历史抽屉 -->
        <a-drawer
            v-model:visible="snapshotDrawerVisible"
            title="版本历史（快照）"
            :width="520"
            placement="right"
        >
            <div style="margin-bottom:12px;">
                <a-space>
                    <a-button type="primary" size="small" @click="handleCreateSnapshot" :disabled="!activeConfigId">保存当前快照</a-button>
                    <a-button size="small" @click="loadSnapshots">刷新</a-button>
                </a-space>
            </div>
            <a-spin :loading="snapshotsLoading">
                <a-list :bordered="false" v-if="snapshots.length > 0">
                    <a-list-item v-for="snap in snapshots" :key="snap.id">
                        <a-list-item-meta :title="snap.name" :description="`版本 ${snap.version} · ${snap.configName || snap.configKey} · ${formatDate(snap.createdAt)}`">
                        </a-list-item-meta>
                        <template #actions>
                            <a-popconfirm content="确定要恢复到这个版本吗？当前未保存的更改将丢失。" @ok="handleRestoreSnapshot(snap.id)">
                                <a-button type="text" size="small" status="success">恢复</a-button>
                            </a-popconfirm>
                            <a-popconfirm content="确定要删除这个快照吗？" @ok="handleDeleteSnapshot(snap.id)">
                                <a-button type="text" size="small" status="danger">删除</a-button>
                            </a-popconfirm>
                        </template>
                    </a-list-item>
                </a-list>
                <a-empty v-else description="暂无快照记录" />
            </a-spin>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { useClientHook } from '../hooks/client';
import { useAppConfigHook } from '../hooks/app-config';
import type { AppConfigData, AppDecorationPreviewData } from '../api/app-config';
import { generateDecorationPreview, DEFAULT_PAGE_DEFINITIONS } from '../api/app-config';
import { STATUS_OPTIONS } from '../constants';
import DiyEditorPanel from './components/diy-editor-panel.vue';

type ChatMessage = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
};

type PreviewTheme = {
    brandName: string;
    primaryColor: string;
    primaryLightColor: string;
    primarySoftColor: string;
    pageBgColor: string;
    cardBgColor: string;
    textColor: string;
    subTextColor: string;
};

const { optionList, fetchOptions } = useClientHook();
const clientOptions = computed(() => optionList.value);
const {
    dataList, fetchDataList, getDetail, publishData,
    activateScheme,
    snapshots, snapshotsLoading, fetchSnapshots, createSnapshot, restoreSnapshot, deleteSnapshot,
} = useAppConfigHook();

const activeClientId = ref<number>();
const activeConfigId = ref<number>();
const saving = ref(false);
const aiLoading = ref(false);
const jsonVisible = ref(false);
const prompt = ref('');
const snapshotDrawerVisible = ref(false);

/** 可装修页面定义 */
const pageDefinitions = DEFAULT_PAGE_DEFINITIONS;

/** 当前选中的页面 */
const activePageCode = ref<string>('home');

/** 当前选中的页面标题 */
const currentPageTitle = computed(() => {
    const page = pageDefinitions.find(p => p.id === activePageCode.value);
    return page?.title || activePageCode.value;
});

/** 当前配置是否已激活 */
const currentConfigIsActive = computed(() => {
    if (!activeConfigId.value) return false;
    const config = dataList.value.find(c => c.id === activeConfigId.value);
    return config?.isActive === true;
});

const userEntryText = ref('用');

/** 装修模式：ai = 智能装修, manual = 手动装修 */
const decoMode = ref<'ai' | 'manual'>('ai');

/** 手动装修模式下的 DIY 数据 */
const diyExtra = ref('');

const pendingPreview = ref<AppDecorationPreviewData | null>(null);
const messages = ref<ChatMessage[]>([
    { id: 1, role: 'assistant', content: '我可以帮你生成 App 各页面的风格、主题色和区块布局。生成后先进入预览，确认后再发布。支持首页、服务、活动、消息、我的等页面。' }
]);

const form = reactive({
    id: 0,
    clientId: undefined as number | undefined,
    configKey: 'default',
    name: '默认配置',
    status: 1,
    theme: '',
    pages: '',
    featureFlags: '',
    navigation: '',
    extra: '',
    remark: ''
});

const themeDraft = reactive({ brandName: 'GinFast', primaryColor: '#E53935' });
const homeDraft = reactive({ notice: '', bannerTitle: '', bannerDesc: '' });

const defaults = {
    theme: JSON.stringify({
        brandName: 'GinFast', primaryColor: '#E53935',
        primaryLightColor: '#FFF7F6', primarySoftColor: '#FDECEC',
        pageBgColor: '#F7F8FA', cardBgColor: '#FFFFFF',
        textColor: '#1F2937', subTextColor: '#8A94A6', borderColor: '#EEF0F4'
    }, null, 2),
    pages: JSON.stringify(pageDefinitions, null, 2),
    featureFlags: JSON.stringify({ walletLogin: false, miniProgramLogin: true, payment: false }, null, 2),
    navigation: JSON.stringify([
        { id: 'home', title: '首页', icon: 'home', activeIcon: 'home-fill', routeId: 'home', enabled: true },
        { id: 'work', title: '服务', icon: 'grid', activeIcon: 'grid-fill', routeId: 'work', enabled: true },
        { id: 'discover', title: '活动', icon: 'gift', activeIcon: 'gift-fill', routeId: 'discover', enabled: true },
        { id: 'message', title: '消息', icon: 'chat', activeIcon: 'chat-fill', routeId: 'message', enabled: true },
        { id: 'mine', title: '我的', icon: 'account', activeIcon: 'account-fill', routeId: 'mine', enabled: true }
    ], null, 2),
    extra: JSON.stringify({
        shared: {},
        pages: {
            home: {
                notice: '系统公告：新人权益礼包已上线，登录后即可领取。',
                banners: [{ id: 'b1', title: '新人权益礼包', desc: '登录后领取专属优惠和服务权益', buttonText: '立即领取', action: 'login', mark: 'NEW', bgColor: '#E53935' }],
                quickServices: [
                    { id: 'coupon', title: '领权益', icon: 'gift', className: 'icon-red' },
                    { id: 'order', title: '查进度', icon: 'order', className: 'icon-blue' },
                    { id: 'customer', title: '联系客服', icon: 'kefu-ermai', className: 'icon-green' },
                    { id: 'help', title: '帮助中心', icon: 'question-circle', className: 'icon-purple' }
                ],
                news: [
                    { id: 'n1', title: '服务上新', desc: '更多便民服务已开放预约办理' },
                    { id: 'n2', title: '消息提醒', desc: '登录后可接收订单进度和权益通知' }
                ]
            },
            work: { services: [], categories: [] },
            discover: { featured: [], activities: [] },
            message: { categories: [] },
            mine: { userCard: {}, menuGroups: [] }
        }
    }, null, 2)
};

const parseJson = <T,>(value: string, fallback: T): T => {
    try { return JSON.parse(value || '') as T; } catch { return fallback; }
};

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

const themePreview = computed<PreviewTheme>(() => ({
    brandName: 'GinFast', primaryColor: '#E53935',
    primaryLightColor: '#FFF7F6', primarySoftColor: '#FDECEC',
    pageBgColor: '#F7F8FA', cardBgColor: '#FFFFFF',
    textColor: '#1F2937', subTextColor: '#8A94A6',
    ...parseJson<Record<string, string>>(form.theme, {})
}));

const extraPreview = computed(() => {
    const extra = parseJson<Record<string, any>>(form.extra, {});
    // 兼容新结构：extra.pages.xxx
    if (extra.pages && typeof extra.pages === 'object' && !Array.isArray(extra.pages)) {
        return extra;
    }
    // 兼容旧结构：extra.home 直接挂在 extra 下
    return { pages: { home: extra.home || {} } };
});

const homePreview = computed(() => {
    const pages = extraPreview.value.pages || {};
    return pages.home || parseJson<Record<string, any>>(defaults.extra, {}).pages?.home || {};
});

const workPreview = computed(() => {
    const pages = extraPreview.value.pages || {};
    return pages.work || { services: [], categories: [] };
});

const discoverPreview = computed(() => {
    const pages = extraPreview.value.pages || {};
    return pages.discover || { featured: [], activities: [] };
});

const messagePreview = computed(() => {
    const pages = extraPreview.value.pages || {};
    return pages.message || { categories: [] };
});

const minePreview = computed(() => {
    const pages = extraPreview.value.pages || {};
    return pages.mine || { userCard: {}, menuGroups: [] };
});

const firstBanner = computed(() => homePreview.value.banners?.[0] || {});
const navPreview = computed(() => parseJson<any[]>(form.navigation, parseJson<any[]>(defaults.navigation, [])).filter((item: any) => item.enabled !== false));

const iconColor = (className: string) => {
    const map: Record<string, string> = {
        'icon-red': '#E53935', 'icon-blue': '#1677FF',
        'icon-green': '#00A870', 'icon-purple': '#7C3AED'
    };
    return map[className] || themePreview.value.primaryColor;
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
};

// ==================== 数据加载 ====================

const loadConfigs = async () => {
    await fetchDataList({ pageNum: 1, pageSize: 50, clientId: activeClientId.value, status: undefined });
};

const assignForm = (data?: Partial<AppConfigData>) => {
    Object.assign(form, {
        id: data?.id || 0,
        clientId: data?.clientId || activeClientId.value,
        configKey: data?.configKey || 'default',
        name: data?.name || '默认配置',
        status: data?.status ?? 1,
        theme: formatJSON(data?.theme, defaults.theme),
        pages: formatJSON(data?.pages, defaults.pages),
        featureFlags: formatJSON(data?.featureFlags, defaults.featureFlags),
        navigation: formatJSON(data?.navigation, defaults.navigation),
        extra: formatJSON(data?.extra, defaults.extra),
        remark: data?.remark || ''
    });
    syncDraftsFromForm();
    syncDiyExtra();
};

const syncDiyExtra = () => {
    try {
        const extraObj = JSON.parse(form.extra || '{}');
        if (extraObj.diy || extraObj.shared || extraObj.pages) {
            diyExtra.value = JSON.stringify(extraObj);
        } else {
            diyExtra.value = '{}';
        }
    } catch {
        diyExtra.value = '{}';
    }
};

const handleClientChange = async () => {
    activeConfigId.value = undefined;
    assignForm();
    await loadConfigs();
    if (dataList.value.length > 0) {
        // 自动选择激活的方案
        const active = dataList.value.find(c => c.isActive);
        await handleConfigChange(active ? active.id : dataList.value[0].id);
    }
};

const handleConfigChange = async (id?: number) => {
    if (!id) { assignForm(); return; }
    const detail = await getDetail(id);
    activeConfigId.value = id;
    assignForm(detail.data);
};

const handlePageChange = () => {
    // 页面切换时，同步当前页面的 DIY 数据
    syncDiyExtra();
};

const createConfig = () => {
    activeConfigId.value = undefined;
    form.configKey = '';
    assignForm();
};

// ==================== DIY 编辑器同步 ====================

const onDiyExtraUpdate = (value: string) => {
    diyExtra.value = value;
    try {
        const diyObj = JSON.parse(value || '{}');
        const extraObj = JSON.parse(form.extra || '{}');

        // 确保新结构
        if (!extraObj.shared) extraObj.shared = {};
        if (!extraObj.pages) extraObj.pages = {};

        // 同步 DIY 数据
        if (diyObj.diy) {
            extraObj.diy = diyObj.diy;
        }

        // 同步页面级 DIY 模块
        if (diyObj.pageModules) {
            const pageCode = activePageCode.value;
            if (!extraObj.pages[pageCode]) extraObj.pages[pageCode] = {};
            extraObj.pages[pageCode].modules = diyObj.pageModules;
        }

        form.extra = JSON.stringify(extraObj, null, 2);
    } catch {
        // JSON 解析失败时不影响现有数据
    }
};

// ==================== 发布 ====================

const validateJsonFields = () => {
    const fields: Array<keyof typeof defaults> = ['theme', 'pages', 'featureFlags', 'navigation', 'extra'];
    for (const field of fields) {
        try { JSON.parse(form[field]); } catch {
            Message.error(`${field} 不是合法 JSON`);
            return false;
        }
    }
    return true;
};

const handlePublish = async () => {
    if (!activeClientId.value && !form.clientId) {
        Message.error('请选择客户端');
        return;
    }
    if (!validateJsonFields()) return;
    saving.value = true;
    try {
        const res = await publishData({ ...form, clientId: form.clientId || activeClientId.value! });
        assignForm(res.data);
        activeConfigId.value = res.data.id;
        Message.success(`发布成功（版本 ${res.data.cacheVersion || '-'}, cacheTTL ${res.data.cacheTtl || 0}s）`);
        await loadConfigs();
    } catch {
        Message.error('发布失败，请重试');
    } finally {
        saving.value = false;
    }
};

// ==================== 方案切换 ====================

const handleActivateScheme = async () => {
    if (!activeConfigId.value) return;
    try {
        await activateScheme(activeConfigId.value);
        Message.success('方案激活成功');
        await loadConfigs();
    } catch {
        Message.error('激活方案失败');
    }
};

// ==================== 快照管理 ====================

const showSnapshotDrawer = () => {
    snapshotDrawerVisible.value = true;
    loadSnapshots();
};

const loadSnapshots = () => {
    if (activeConfigId.value) {
        fetchSnapshots(activeConfigId.value);
    } else if (activeClientId.value) {
        fetchSnapshots(undefined, activeClientId.value);
    }
};

const handleCreateSnapshot = () => {
    if (!activeConfigId.value) return;
    Modal.confirm({
        title: '保存快照',
        content: () => {
            const name = ref(`快照 ${new Date().toLocaleString('zh-CN')}`);
            return h('div', {}, [
                h('p', '为当前配置创建一个版本快照，可用于后续回滚。'),
                h('input', {
                    value: name.value,
                    onInput: (e: Event) => { name.value = (e.target as HTMLInputElement).value; },
                    style: 'width:100%;padding:6px 8px;border:1px solid #e5e6eb;border-radius:4px;margin-top:8px;',
                    placeholder: '快照名称'
                })
            ]);
        },
        onOk: async () => {
            try {
                await createSnapshot(activeConfigId.value!, `快照 ${new Date().toLocaleString('zh-CN')}`);
                Message.success('快照创建成功');
                loadSnapshots();
            } catch {
                Message.error('创建快照失败');
            }
        }
    });
};

const handleRestoreSnapshot = async (snapshotId: number) => {
    try {
        await restoreSnapshot(snapshotId);
        Message.success('已从快照恢复');
        // 重新加载当前配置
        if (activeConfigId.value) {
            await handleConfigChange(activeConfigId.value);
        }
    } catch {
        Message.error('恢复快照失败');
    }
};

const handleDeleteSnapshot = async (snapshotId: number) => {
    try {
        await deleteSnapshot(snapshotId);
        Message.success('快照已删除');
        loadSnapshots();
    } catch {
        Message.error('删除快照失败');
    }
};

// ==================== AI 智能装修 ====================

const sendPrompt = async () => {
    const text = prompt.value.trim();
    if (!text) {
        Message.warning('请输入装修需求');
        return;
    }
    messages.value.push({ id: Date.now(), role: 'user', content: `[${currentPageTitle.value}] ${text}` });
    aiLoading.value = true;
    try {
        const res = await generateDecorationPreview({
            prompt: text,
            pageCode: activePageCode.value,
            theme: form.theme,
            pages: form.pages,
            featureFlags: form.featureFlags,
            navigation: form.navigation,
            extra: form.extra
        });
        pendingPreview.value = res.data;
        messages.value.push({ id: Date.now() + 1, role: 'assistant', content: res.data.summary });
        prompt.value = '';
    } finally {
        aiLoading.value = false;
    }
};

const applyPendingPreview = () => {
    if (!pendingPreview.value) return;
    form.theme = stringify(pendingPreview.value.theme);
    form.pages = stringify(pendingPreview.value.pages);
    form.featureFlags = stringify(pendingPreview.value.featureFlags);
    form.navigation = stringify(pendingPreview.value.navigation);
    form.extra = stringify(pendingPreview.value.extra);
    syncDraftsFromForm();
    pendingPreview.value = null;
    Message.success(`已应用${currentPageTitle.value}装修预览，确认后可发布`);
};

// ==================== 草稿同步 ====================

const syncDraftsFromForm = () => {
    const theme = parseJson<Record<string, string>>(form.theme, {});
    const pages = parseJson<Record<string, any>>(form.extra, {}).pages || {};
    const home = pages.home || parseJson<Record<string, any>>(defaults.extra, {}).pages?.home || {};
    themeDraft.brandName = theme.brandName || 'GinFast';
    themeDraft.primaryColor = theme.primaryColor || '#E53935';
    homeDraft.notice = home.notice || '';
    homeDraft.bannerTitle = home.banners?.[0]?.title || '';
    homeDraft.bannerDesc = home.banners?.[0]?.desc || '';
};

const syncDraftTheme = () => {
    const theme = parseJson<Record<string, any>>(form.theme, {});
    theme.brandName = themeDraft.brandName;
    theme.primaryColor = themeDraft.primaryColor;
    if (!theme.primaryLightColor) theme.primaryLightColor = '#FFF7F6';
    if (!theme.primarySoftColor) theme.primarySoftColor = '#FDECEC';
    form.theme = stringify(theme);
};

const syncDraftHome = () => {
    const extra = parseJson<Record<string, any>>(form.extra, {});
    if (!extra.pages) extra.pages = {};
    const home = extra.pages.home || {};
    home.notice = homeDraft.notice;
    home.banners = home.banners || [];
    if (home.banners.length === 0) home.banners.push({ id: 'b1', buttonText: '立即查看', action: 'login', mark: 'NEW' });
    home.banners[0].title = homeDraft.bannerTitle;
    home.banners[0].desc = homeDraft.bannerDesc;
    home.banners[0].bgColor = themeDraft.primaryColor;
    extra.pages.home = home;
    form.extra = stringify(extra);
};

const formatJSON = (value?: unknown, fallback = '{}') => {
    try {
        return JSON.stringify(typeof value === 'string' ? JSON.parse(value || fallback) : value || JSON.parse(fallback), null, 2);
    } catch { return fallback; }
};

// h function for modal content
const h = (tag: string, attrs: Record<string, any>, children?: any[]) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k.startsWith('on')) {
            el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === 'style') {
            el.setAttribute('style', v);
        } else {
            (el as any)[k] = v;
        }
    });
    children?.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else el.appendChild(child);
    });
    return el;
};

onMounted(async () => {
    await fetchOptions();
    if (clientOptions.value.length > 0) {
        activeClientId.value = clientOptions.value[0].id;
    }
    assignForm();
    await loadConfigs();
    if (dataList.value.length > 0) {
        const active = dataList.value.find(c => c.isActive);
        await handleConfigChange(active ? active.id : dataList.value[0].id);
    }
});
</script>

<style scoped lang="scss">
.workbench {
    display: flex;
    gap: 16px;
    height: calc(100vh - 124px);
    min-height: 680px;
}

.designer,
.chat {
    background: var(--color-bg-2);
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
}

.designer {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.toolbar {
    padding: 14px 16px;
    border-bottom: 1px solid var(--color-border-2);
}

.toolbar-actions {
    margin-top: 8px;
}

.designer-body {
    flex: 1;
    display: flex;
    gap: 18px;
    min-height: 0;
    padding: 18px;
    overflow: auto;
}

.phone-shell {
    width: 390px;
    flex: none;
    display: flex;
    justify-content: center;
}

.phone-screen {
    width: 360px;
    height: 640px;
    border: 10px solid #111827;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 18px 45px rgb(15 23 42 / 18%);
    display: flex;
    flex-direction: column;
}

.phone-navbar {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid rgb(229 231 235 / 70%);
}

.phone-content {
    flex: 1;
    overflow: hidden;
    padding: 12px;
}

.page-preview-header {
    padding: 8px 0;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
    color: var(--color-text-1);
}

.banner {
    height: 142px;
    border-radius: 8px;
    padding: 18px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.banner-title { font-size: 21px; font-weight: 700; }
.banner-desc { margin-top: 8px; font-size: 13px; }
.banner-button {
    margin-top: 16px; height: 30px; padding: 0 14px;
    border: 0; border-radius: 15px; background: #fff; font-weight: 600;
}
.banner-mark {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgb(255 255 255 / 18%);
    display: flex; align-items: center; justify-content: center; font-weight: 700;
}

.notice, .search, .section-card {
    margin-top: 12px; border-radius: 8px; padding: 12px;
}

.notice {
    display: flex; gap: 8px; align-items: center; font-size: 12px;
}

.notice-dot {
    width: 22px; height: 22px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center; font-weight: 700;
}

.search { font-size: 13px; }

.section-head, .phone-tabbar {
    display: flex; justify-content: space-between; align-items: center;
}

.service-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 10px; margin-top: 12px;
}

.service-item {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; font-size: 12px;
}

.service-icon {
    width: 42px; height: 42px; border-radius: 50%;
    color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;
}

.news-row {
    display: flex; flex-direction: column; gap: 4px;
    padding: 10px 0; border-bottom: 1px solid rgb(229 231 235 / 80%); font-size: 12px;
}
.news-row span { color: var(--color-text-3); }

.phone-tabbar {
    height: 54px; padding: 0 18px;
    border-top: 1px solid rgb(229 231 235 / 80%); font-size: 12px;
}
.phone-tabbar .active { color: #e53935; font-weight: 700; }

.mine-header {
    height: 100px; border-radius: 8px; padding: 18px;
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.mine-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.25); color: #fff;
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;
}

.inspector {
    flex: 1; min-width: 320px;
}

.canvas-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 360px; color: var(--color-text-4);
}

.chat {
    width: 380px;
    display: flex; flex-direction: column; min-height: 0;
}

.chat-head {
    padding: 16px; border-bottom: 1px solid var(--color-border-2);
    display: flex; justify-content: space-between; gap: 12px;
}
.chat-head p { margin: 6px 0 0; color: var(--color-text-3); font-size: 12px; }

.messages { flex: 1; min-height: 0; overflow: auto; padding: 16px; }

.message { display: flex; margin-bottom: 12px; }
.message.user { justify-content: flex-end; }

.bubble {
    max-width: 86%; padding: 10px 12px;
    border-radius: 8px; background: var(--color-fill-2); line-height: 1.6;
}
.message.user .bubble { background: rgb(var(--arcoblue-6)); color: #fff; }

.pending {
    margin: 0 16px 12px; padding: 12px; border-radius: 8px;
    background: rgb(var(--arcoblue-1));
    display: flex; flex-direction: column; gap: 10px;
}

.composer {
    padding: 16px; border-top: 1px solid var(--color-border-2);
    display: flex; flex-direction: column; gap: 10px;
}
</style>
