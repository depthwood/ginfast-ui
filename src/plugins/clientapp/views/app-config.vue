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
                        <a-select v-model="activeConfigId" placeholder="选择配置" allow-clear style="width: 220px" @change="handleConfigChange">
                            <a-option v-for="item in dataList" :key="item.id" :value="item.id">
                                {{ item.name }} · {{ item.status === 1 ? '启用' : '停用' }}
                            </a-option>
                        </a-select>
                        <a-button @click="createConfig">新建</a-button>
                        <a-button @click="jsonVisible = true">高级 JSON</a-button>
                        <a-button type="primary" :loading="saving" @click="handlePublish" v-hasPerm="['plugins:clientapp:appconfig:publish','plugins:clientapp:appconfig:save']">
                            发布到 App
                        </a-button>
                    </a-space>
                </div>

                <div class="designer-body">
                    <div class="phone-shell">
                        <div class="phone-screen" :style="{ backgroundColor: themePreview.pageBgColor }">
                            <div class="phone-navbar" :style="{ backgroundColor: themePreview.cardBgColor, color: themePreview.textColor }">
                                {{ themePreview.brandName || 'GinFast' }}
                            </div>
                            <div class="phone-content">
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
                                            <div class="service-icon" :style="{ backgroundColor: iconColor(item.className) }">{{ item.title.slice(0, 1) }}</div>
                                            <span>{{ item.title }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="section-card" :style="{ backgroundColor: themePreview.cardBgColor }">
                                    <div class="section-head">
                                        <strong>最新动态</strong>
                                        <span>本周精选</span>
                                    </div>
                                    <div v-for="item in homePreview.news" :key="item.id" class="news-row">
                                        <strong>{{ item.title }}</strong>
                                        <span>{{ item.desc }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="phone-tabbar" :style="{ backgroundColor: themePreview.cardBgColor }">
                                <span v-for="item in navPreview" :key="item.id" :class="{ active: item.id === 'home' }">{{ item.title }}</span>
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
                            <a-form-item label="首页公告">
                                <a-input v-model="homeDraft.notice" @change="syncDraftHome" />
                            </a-form-item>
                            <a-form-item label="首屏标题">
                                <a-input v-model="homeDraft.bannerTitle" @change="syncDraftHome" />
                            </a-form-item>
                            <a-form-item label="首屏描述">
                                <a-textarea v-model="homeDraft.bannerDesc" :auto-size="{ minRows: 2, maxRows: 3 }" @change="syncDraftHome" />
                            </a-form-item>
                            <a-form-item label="备注">
                                <a-textarea v-model="form.remark" :auto-size="{ minRows: 2, maxRows: 3 }" />
                            </a-form-item>
                        </a-form>
                    </div>
                </div>
            </section>

            <aside class="chat">
                <div class="chat-head">
                    <div>
                        <strong>AI 装修助手</strong>
                        <p>说出风格、行业、首屏重点，生成后先预览，确认再发布。</p>
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
                        <a-button size="small" type="primary" @click="applyPendingPreview">应用到左侧预览</a-button>
                        <a-button size="small" @click="pendingPreview = null">丢弃</a-button>
                    </a-space>
                </div>
                <div class="composer">
                    <a-textarea v-model="prompt" placeholder="例如：做一个蓝色科技感首页，强调预约服务和进度提醒" :auto-size="{ minRows: 4, maxRows: 6 }" />
                    <a-button type="primary" long :loading="aiLoading" @click="sendPrompt" v-hasPerm="['plugins:clientapp:appconfig:preview']">
                        生成装修预览
                    </a-button>
                </div>
            </aside>
        </div>

        <a-modal v-model:visible="jsonVisible" title="高级 JSON 配置" :width="900" :footer="false">
            <a-tabs default-active-key="theme">
                <a-tab-pane key="theme" title="主题"><a-textarea v-model="form.theme" :auto-size="{ minRows: 10 }" @blur="syncDraftsFromForm" /></a-tab-pane>
                <a-tab-pane key="pages" title="页面"><a-textarea v-model="form.pages" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="navigation" title="导航"><a-textarea v-model="form.navigation" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="flags" title="功能"><a-textarea v-model="form.featureFlags" :auto-size="{ minRows: 10 }" /></a-tab-pane>
                <a-tab-pane key="extra" title="装修"><a-textarea v-model="form.extra" :auto-size="{ minRows: 10 }" @blur="syncDraftsFromForm" /></a-tab-pane>
            </a-tabs>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useClientHook } from '../hooks/client';
import { useAppConfigHook } from '../hooks/app-config';
import type { AppConfigData, AppDecorationPreviewData } from '../api/app-config';
import { generateDecorationPreview } from '../api/app-config';
import { STATUS_OPTIONS } from '../constants';

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
const { dataList, fetchDataList, getDetail, publishData } = useAppConfigHook();

const activeClientId = ref<number>();
const activeConfigId = ref<number>();
const saving = ref(false);
const aiLoading = ref(false);
const jsonVisible = ref(false);
const prompt = ref('');
const pendingPreview = ref<AppDecorationPreviewData | null>(null);
const messages = ref<ChatMessage[]>([
    { id: 1, role: 'assistant', content: '我可以帮你生成 App 首页风格、主题色、导航和首页区块。生成后会先进入预览，不会直接发布。' }
]);

const form = reactive({
    id: 0,
    clientId: undefined as number | undefined,
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
        brandName: 'GinFast',
        primaryColor: '#E53935',
        primaryLightColor: '#FFF7F6',
        primarySoftColor: '#FDECEC',
        pageBgColor: '#F7F8FA',
        cardBgColor: '#FFFFFF',
        textColor: '#1F2937',
        subTextColor: '#8A94A6',
        borderColor: '#EEF0F4'
    }, null, 2),
    pages: JSON.stringify([
        { id: 'home', title: '首页', path: '/pages/index/index', enabled: true },
        { id: 'work', title: '服务', path: '/pages/work/work', enabled: true },
        { id: 'discover', title: '活动', path: '/pages/discover/discover', enabled: true },
        { id: 'message', title: '消息', path: '/pages/message/message', enabled: true },
        { id: 'mine', title: '我的', path: '/pages/mine/mine', enabled: true }
    ], null, 2),
    featureFlags: JSON.stringify({ walletLogin: false, miniProgramLogin: true, payment: false }, null, 2),
    navigation: JSON.stringify([
        { id: 'home', title: '首页', icon: 'home', activeIcon: 'home-fill', routeId: 'home', enabled: true },
        { id: 'work', title: '服务', icon: 'grid', activeIcon: 'grid-fill', routeId: 'work', enabled: true },
        { id: 'discover', title: '活动', icon: 'gift', activeIcon: 'gift-fill', routeId: 'discover', enabled: true },
        { id: 'message', title: '消息', icon: 'chat', activeIcon: 'chat-fill', routeId: 'message', enabled: true },
        { id: 'mine', title: '我的', icon: 'account', activeIcon: 'account-fill', routeId: 'mine', enabled: true }
    ], null, 2),
    extra: JSON.stringify({
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
        }
    }, null, 2)
};

const parseJson = <T,>(value: string, fallback: T): T => {
    try {
        return JSON.parse(value || '') as T;
    } catch {
        return fallback;
    }
};

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

const themePreview = computed<PreviewTheme>(() => ({
    brandName: 'GinFast',
    primaryColor: '#E53935',
    primaryLightColor: '#FFF7F6',
    primarySoftColor: '#FDECEC',
    pageBgColor: '#F7F8FA',
    cardBgColor: '#FFFFFF',
    textColor: '#1F2937',
    subTextColor: '#8A94A6',
    ...parseJson<Record<string, string>>(form.theme, {})
}));

const extraPreview = computed(() => parseJson<Record<string, any>>(form.extra, {}));
const homePreview = computed(() => {
    return extraPreview.value.home || parseJson<Record<string, any>>(defaults.extra, {}).home;
});
const firstBanner = computed(() => homePreview.value.banners?.[0] || {});
const navPreview = computed(() => parseJson<any[]>(form.navigation, parseJson<any[]>(defaults.navigation, [])).filter(item => item.enabled !== false));

const iconColor = (className: string) => {
    const map: Record<string, string> = {
        'icon-red': '#E53935',
        'icon-blue': '#1677FF',
        'icon-green': '#00A870',
        'icon-purple': '#7C3AED'
    };
    return map[className] || themePreview.value.primaryColor;
};

const loadConfigs = async () => {
    await fetchDataList({
        pageNum: 1,
        pageSize: 50,
        clientId: activeClientId.value,
        status: undefined
    });
};

const assignForm = (data?: Partial<AppConfigData>) => {
    Object.assign(form, {
        id: data?.id || 0,
        clientId: data?.clientId || activeClientId.value,
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
};

const handleClientChange = async () => {
    activeConfigId.value = undefined;
    assignForm();
    await loadConfigs();
    if (dataList.value.length > 0) {
        await handleConfigChange(dataList.value[0].id);
    }
};

const handleConfigChange = async (id?: number) => {
    if (!id) {
        assignForm();
        return;
    }
    const detail = await getDetail(id);
    activeConfigId.value = id;
    assignForm(detail.data);
};

const createConfig = () => {
    activeConfigId.value = undefined;
    assignForm();
};

const validateJsonFields = () => {
    const fields: Array<keyof typeof defaults> = ['theme', 'pages', 'featureFlags', 'navigation', 'extra'];
    for (const field of fields) {
        try {
            JSON.parse(form[field]);
        } catch {
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
        Message.success(`发布成功（版本 ${res.data.cacheVersion || '-' }, cacheTTL ${res.data.cacheTtl || 0}s）`);
        await loadConfigs();
    } catch {
        Message.error('发布失败，请重试');
    } finally {
        saving.value = false;
    }
};

const sendPrompt = async () => {
    const text = prompt.value.trim();
    if (!text) {
        Message.warning('请输入装修需求');
        return;
    }
    messages.value.push({ id: Date.now(), role: 'user', content: text });
    aiLoading.value = true;
    try {
        const res = await generateDecorationPreview({
            prompt: text,
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
    Message.success('已应用到左侧预览，确认后可发布');
};

const syncDraftsFromForm = () => {
    const theme = parseJson<Record<string, string>>(form.theme, {});
    const home = parseJson<Record<string, any>>(form.extra, {}).home || {};
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
    const home = extra.home || {};
    home.notice = homeDraft.notice;
    home.banners = home.banners || [];
    if (home.banners.length === 0) home.banners.push({ id: 'b1', buttonText: '立即查看', action: 'login', mark: 'NEW' });
    home.banners[0].title = homeDraft.bannerTitle;
    home.banners[0].desc = homeDraft.bannerDesc;
    home.banners[0].bgColor = themeDraft.primaryColor;
    extra.home = home;
    form.extra = stringify(extra);
};

const formatJSON = (value?: unknown, fallback = '{}') => {
    try {
        return JSON.stringify(typeof value === 'string' ? JSON.parse(value || fallback) : value || JSON.parse(fallback), null, 2);
    } catch {
        return fallback;
    }
};

onMounted(async () => {
    await fetchOptions();
    if (clientOptions.value.length > 0) {
        activeClientId.value = clientOptions.value[0].id;
    }
    assignForm();
    await loadConfigs();
    if (dataList.value.length > 0) {
        await handleConfigChange(dataList.value[0].id);
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
    border-bottom: 1px solid rgb(229 231 235 / 70%);
}

.phone-content {
    flex: 1;
    overflow: hidden;
    padding: 12px;
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

.banner-title {
    font-size: 21px;
    font-weight: 700;
}

.banner-desc {
    margin-top: 8px;
    font-size: 13px;
}

.banner-button {
    margin-top: 16px;
    height: 30px;
    padding: 0 14px;
    border: 0;
    border-radius: 15px;
    background: #fff;
    font-weight: 600;
}

.banner-mark {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgb(255 255 255 / 18%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.notice,
.search,
.section-card {
    margin-top: 12px;
    border-radius: 8px;
    padding: 12px;
}

.notice {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
}

.notice-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.search {
    font-size: 13px;
}

.section-head,
.phone-tabbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.service-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 12px;
}

.service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}

.service-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.news-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 0;
    border-bottom: 1px solid rgb(229 231 235 / 80%);
    font-size: 12px;
}

.news-row span {
    color: var(--color-text-3);
}

.phone-tabbar {
    height: 54px;
    padding: 0 18px;
    border-top: 1px solid rgb(229 231 235 / 80%);
    font-size: 12px;
}

.phone-tabbar .active {
    color: #e53935;
    font-weight: 700;
}

.inspector {
    flex: 1;
    min-width: 320px;
}

.chat {
    width: 380px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.chat-head {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-2);
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.chat-head p {
    margin: 6px 0 0;
    color: var(--color-text-3);
    font-size: 12px;
}

.messages {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px;
}

.message {
    display: flex;
    margin-bottom: 12px;
}

.message.user {
    justify-content: flex-end;
}

.bubble {
    max-width: 86%;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--color-fill-2);
    line-height: 1.6;
}

.message.user .bubble {
    background: rgb(var(--arcoblue-6));
    color: #fff;
}

.pending {
    margin: 0 16px 12px;
    padding: 12px;
    border-radius: 8px;
    background: rgb(var(--arcoblue-1));
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.composer {
    padding: 16px;
    border-top: 1px solid var(--color-border-2);
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
