import type { CartItem, OrderStatus, Product } from '../types';

export const statusLabel: Record<OrderStatus, string> = {
  pending: '待制作',
  preparing: '制作中',
  ready: '待取货',
  completed: '已完成'
};

export const nextStatus: Record<OrderStatus, OrderStatus> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: 'completed'
};

export function formatMoney(value: number): string {
  return `￥${value.toFixed(2).replace(/\.00$/, '')}`;
}

export function maskPhone(phone: string): string {
  if (!/^1\d{10}$/.test(phone)) return phone || '未填写手机号';
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function phoneTail(phone: string): string {
  return phone.slice(-4) || '----';
}

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function displayQueueNumber(queueNumber: number): string {
  return `#${String(queueNumber).padStart(2, '0')}`;
}

export function calculateCartTotal(cart: CartItem[], products: Product[]): number {
  return cart.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return total;
    return total + product.price * item.quantity;
  }, 0);
}

export function getCartQuantity(cart: CartItem[], productId: string): number {
  return cart.find((item) => item.productId === productId)?.quantity ?? 0;
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function generatePickupOptions(date = new Date()): string[] {
  const options = ['立即取餐'];
  const base = new Date(date);
  base.setMinutes(Math.ceil(base.getMinutes() / 15) * 15, 0, 0);

  for (let index = 1; index <= 6; index += 1) {
    const option = new Date(base.getTime() + index * 15 * 60 * 1000);
    const hour = `${option.getHours()}`.padStart(2, '0');
    const minute = `${option.getMinutes()}`.padStart(2, '0');
    options.push(`${hour}:${minute}`);
  }

  return options;
}

export function sortByPickupTime(a: { pickupTime: string }, b: { pickupTime: string }): number {
  if (a.pickupTime === '立即取餐') return -1;
  if (b.pickupTime === '立即取餐') return 1;
  return a.pickupTime.localeCompare(b.pickupTime);
}
