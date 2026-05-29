export const CLIENT_TYPE_OPTIONS = [
    { label: '小程序', value: 'mini_program' },
    { label: 'H5', value: 'h5' },
    { label: '原生App', value: 'native' }
];

export const STATUS_OPTIONS = [
    { label: '停用', value: 0 },
    { label: '启用', value: 1 }
];

export const PLATFORM_LABELS: Record<string, string> = {
    wechat: '微信小程序',
    alipay: '支付宝小程序',
    douyin: '抖音小程序',
    baidu: '百度小程序',
    qq: 'QQ小程序',
    kuaishou: '快手小程序',
    feishu: '飞书小程序',
    jd: '京东小程序'
};

export const IDENTITY_TYPE_OPTIONS = [
    { label: '小程序OpenID', value: 'mp_openid' },
    { label: '小程序UnionID', value: 'mp_unionid' },
    { label: 'EVM钱包', value: 'wallet_evm' },
    { label: '手机号', value: 'phone' }
];

export const REGISTER_SOURCE_OPTIONS = [
    { label: '管理员代注册', value: 'admin' },
    { label: '小程序', value: 'mp' },
    { label: 'EVM钱包', value: 'wallet_evm' },
    { label: '手机号', value: 'phone' }
];

export const EVM_CHAIN_OPTIONS = [
    { label: 'Ethereum (1)', value: '1' },
    { label: 'BSC (56)', value: '56' },
    { label: 'Polygon (137)', value: '137' },
    { label: 'Arbitrum (42161)', value: '42161' }
];

export const GENDER_OPTIONS = [
    { label: '未知', value: 0 },
    { label: '男', value: 1 },
    { label: '女', value: 2 }
];

export function getPlatformLabel(platform?: string) {
    if (!platform) return '-';
    return PLATFORM_LABELS[platform] || platform;
}

export function getIdentityTypeLabel(type?: string) {
    return IDENTITY_TYPE_OPTIONS.find(item => item.value === type)?.label || type || '-';
}

export function getClientTypeLabel(type?: string) {
    return CLIENT_TYPE_OPTIONS.find(item => item.value === type)?.label || type || '-';
}
