import type { Category, Product, ShopSettings } from '../types';

const now = new Date('2026-08-04T18:00:00+08:00').toISOString();

export const seedSettings: ShopSettings = {
  name: 'WOWFOOD 夜摊',
  notice: '今天支持提前预订，到摊现场付款。',
  adminPin: '1666',
  openLabel: '今晚营业',
  acceptingOrders: true,
  pauseMessage: '今天暂不接单，请稍后再来。'
};

export const seedCategories: Category[] = [
  { id: 'cat-bbq', name: '烧烤', sortOrder: 10, createdAt: now },
  { id: 'cat-fried', name: '炸货', sortOrder: 20, createdAt: now },
  { id: 'cat-snack', name: '小吃', sortOrder: 30, createdAt: now },
  { id: 'cat-braised', name: '卤肉', sortOrder: 40, createdAt: now },
  { id: 'cat-drink', name: '冰镇饮品', sortOrder: 50, createdAt: now }
];

export const seedProducts: Product[] = [
  {
    id: 'prod-beef-skewer',
    categoryId: 'cat-bbq',
    name: '招牌牛肉串',
    price: 25,
    unit: '10串',
    description: '鲜肉现穿，炭香足，适合多人一起点。',
    tags: ['招牌', '热销'],
    imageUrl:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-chicken-wing',
    categoryId: 'cat-bbq',
    name: '蒜香鸡翅',
    price: 18,
    unit: '4只',
    description: '外焦里嫩，蒜香入味。',
    tags: ['人气'],
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-squid',
    categoryId: 'cat-bbq',
    name: '铁板鱿鱼',
    price: 16,
    unit: '份',
    description: '刷酱现烤，口感弹牙。',
    tags: ['现烤'],
    imageUrl:
      'https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-fried-chicken',
    categoryId: 'cat-fried',
    name: '金黄炸鸡排',
    price: 16,
    unit: '份',
    description: '切块出餐，酥脆多汁。',
    tags: ['热销'],
    imageUrl:
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-fries',
    categoryId: 'cat-fried',
    name: '香脆薯条',
    price: 12,
    unit: '份',
    description: '现炸出锅，番茄酱另附。',
    tags: ['小朋友爱吃'],
    imageUrl:
      'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-rice-cake',
    categoryId: 'cat-fried',
    name: '炸年糕',
    price: 10,
    unit: '份',
    description: '外脆内糯，甜辣酱可选。',
    tags: ['糯叽叽'],
    imageUrl:
      'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-cold-noodle',
    categoryId: 'cat-snack',
    name: '凉拌面筋',
    price: 12,
    unit: '碗',
    description: '爽口开胃，辣度可调。',
    tags: ['爽口'],
    imageUrl:
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-bingfen',
    categoryId: 'cat-snack',
    name: '红糖冰粉',
    price: 9,
    unit: '碗',
    description: '冰爽解辣，红糖和花生碎搭配。',
    tags: ['冰爽'],
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-braised-beef',
    categoryId: 'cat-braised',
    name: '卤牛肉',
    price: 28,
    unit: '份',
    description: '卤香浓，切片装盒。',
    tags: ['下酒菜'],
    imageUrl:
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-braised-duck',
    categoryId: 'cat-braised',
    name: '卤鸭翅',
    price: 15,
    unit: '4只',
    description: '越啃越香，微辣更好吃。',
    tags: ['微辣'],
    imageUrl:
      'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=600&q=80',
    status: 'sold_out',
    createdAt: now
  },
  {
    id: 'prod-plum-juice',
    categoryId: 'cat-drink',
    name: '冰镇酸梅汤',
    price: 8,
    unit: '杯',
    description: '冰镇现装，解腻解辣。',
    tags: ['解辣'],
    imageUrl:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  },
  {
    id: 'prod-lemon-tea',
    categoryId: 'cat-drink',
    name: '暴打柠檬茶',
    price: 10,
    unit: '杯',
    description: '清爽茶底，酸甜适中。',
    tags: ['清爽'],
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    status: 'available',
    createdAt: now
  }
];
