import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedCategories, seedProducts, seedSettings } from '../data/seed';
import type {
  CartItem,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductStatus,
  SharedSnapshot,
  ShopSettings,
  SpiceLevel
} from '../types';
import {
  calculateCartTotal,
  displayQueueNumber,
  getTodayKey,
  nextStatus
} from '../utils/format';

interface SubmitOrderInput {
  phone: string;
  pickupTime: string;
  spice: SpiceLevel;
  remark: string;
}

interface WowfoodState {
  settings: ShopSettings;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  customerPhone: string;
  currentOrderId: string | null;
  adminUnlocked: boolean;
  remoteRevision: number;
  hydrateSharedState: (snapshot: SharedSnapshot) => void;
  updateSettings: (patch: Partial<ShopSettings>) => void;
  toggleAcceptingOrders: () => void;
  setCustomerPhone: (phone: string) => void;
  setAdminUnlocked: (unlocked: boolean) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, direction: 'up' | 'down') => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  addToCart: (productId: string) => void;
  reduceFromCart: (productId: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  submitOrder: (input: SubmitOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceOrderStatus: (orderId: string) => void;
}

function uid(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSortOrders(categories: Category[]): Category[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category, index) => ({
      ...category,
      sortOrder: (index + 1) * 10
    }));
}

function nextQueueNumber(orders: Order[]): number {
  const todayKey = getTodayKey();
  const todaysOrders = orders.filter((order) => order.dateKey === todayKey);
  return todaysOrders.length + 1;
}

function getOrderItems(cart: CartItem[], products: Product[]): OrderItem[] {
  return cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return null;

      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      };
    })
    .filter((item): item is OrderItem => Boolean(item));
}

function normalizeSettings(settings: Partial<ShopSettings> | undefined): ShopSettings {
  return {
    ...seedSettings,
    ...settings,
    acceptingOrders: settings?.acceptingOrders ?? true,
    pauseMessage: settings?.pauseMessage || seedSettings.pauseMessage
  };
}

function getSharedSnapshot(state: WowfoodState): Omit<SharedSnapshot, 'revision'> {
  return {
    settings: normalizeSettings(state.settings),
    categories: state.categories,
    products: state.products,
    orders: state.orders
  };
}

function pushSharedState(state: WowfoodState) {
  if (typeof window === 'undefined') return;

  void fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(getSharedSnapshot(state))
  }).catch(() => {
    // The local data server is optional during static builds and offline use.
  });
}

export const useWowfoodStore = create<WowfoodState>()(
  persist(
    (set, get) => ({
      settings: seedSettings,
      categories: seedCategories,
      products: seedProducts,
      cart: [],
      orders: [],
      customerPhone: '',
      currentOrderId: null,
      adminUnlocked: false,
      remoteRevision: 0,
      hydrateSharedState: (snapshot) =>
        set((state) => {
          const productIds = new Set(snapshot.products.map((product) => product.id));
          return {
            settings: normalizeSettings(snapshot.settings),
            categories: snapshot.categories,
            products: snapshot.products,
            orders: snapshot.orders,
            cart: state.cart.filter((item) => productIds.has(item.productId)),
            remoteRevision: snapshot.revision
          };
        }),
      updateSettings: (patch) => {
        set((state) => ({
          settings: normalizeSettings({
            ...state.settings,
            ...patch
          })
        }));
        pushSharedState(get());
      },
      toggleAcceptingOrders: () => {
        set((state) => {
          const settings = normalizeSettings(state.settings);
          return {
            settings: {
              ...settings,
              acceptingOrders: !settings.acceptingOrders,
              openLabel: !settings.acceptingOrders ? '正在接单' : '暂停接单'
            }
          };
        });
        pushSharedState(get());
      },
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setAdminUnlocked: (unlocked) => set({ adminUnlocked: unlocked }),
      addCategory: (name) => {
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName) return state;
          const lastSortOrder = Math.max(0, ...state.categories.map((category) => category.sortOrder));
          return {
            categories: [
              ...state.categories,
              {
                id: uid('cat'),
                name: trimmedName,
                sortOrder: lastSortOrder + 10,
                createdAt: new Date().toISOString()
              }
            ]
          };
        });
        pushSharedState(get());
      },
      updateCategory: (id, name) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, name: name.trim() || category.name } : category
          )
        }));
        pushSharedState(get());
      },
      deleteCategory: (id) => {
        set((state) => {
          const productIds = state.products
            .filter((product) => product.categoryId === id)
            .map((product) => product.id);

          return {
            categories: normalizeSortOrders(state.categories.filter((category) => category.id !== id)),
            products: state.products.filter((product) => product.categoryId !== id),
            cart: state.cart.filter((item) => !productIds.includes(item.productId))
          };
        });
        pushSharedState(get());
      },
      moveCategory: (id, direction) => {
        set((state) => {
          const categories = normalizeSortOrders(state.categories);
          const currentIndex = categories.findIndex((category) => category.id === id);
          const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

          if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categories.length) {
            return state;
          }

          const nextCategories = [...categories];
          [nextCategories[currentIndex], nextCategories[targetIndex]] = [
            nextCategories[targetIndex],
            nextCategories[currentIndex]
          ];

          return {
            categories: normalizeSortOrders(nextCategories)
          };
        });
        pushSharedState(get());
      },
      addProduct: (product) => {
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: uid('prod'),
              createdAt: new Date().toISOString()
            }
          ]
        }));
        pushSharedState(get());
      },
      updateProduct: (id, patch) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  ...patch,
                  price:
                    typeof patch.price === 'number' && Number.isFinite(patch.price)
                      ? patch.price
                      : product.price
                }
              : product
          )
        }));
        pushSharedState(get());
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          cart: state.cart.filter((item) => item.productId !== id)
        }));
        pushSharedState(get());
      },
      toggleProductStatus: (id) => {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== id) return product;
            const status: ProductStatus = product.status === 'available' ? 'sold_out' : 'available';
            return { ...product, status };
          })
        }));
        pushSharedState(get());
      },
      addToCart: (productId) =>
        set((state) => {
          const product = state.products.find((candidate) => candidate.id === productId);
          if (!product || product.status === 'sold_out') return state;

          const existing = state.cart.find((item) => item.productId === productId);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }

          return {
            cart: [...state.cart, { productId, quantity: 1 }]
          };
        }),
      reduceFromCart: (productId) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0)
        })),
      setCartQuantity: (productId, quantity) =>
        set((state) => {
          const nextQuantity = Math.max(0, Math.floor(quantity));
          const exists = state.cart.some((item) => item.productId === productId);

          if (nextQuantity === 0) {
            return {
              cart: state.cart.filter((item) => item.productId !== productId)
            };
          }

          if (!exists) {
            return {
              cart: [...state.cart, { productId, quantity: nextQuantity }]
            };
          }

          return {
            cart: state.cart.map((item) =>
              item.productId === productId ? { ...item, quantity: nextQuantity } : item
            )
          };
        }),
      clearCart: () => set({ cart: [] }),
      submitOrder: (input) => {
        const state = get();
        const items = getOrderItems(state.cart, state.products);

        if (!items.length) {
          throw new Error('购物车为空');
        }

        const queueNumber = nextQueueNumber(state.orders);
        const order: Order = {
          id: uid('order'),
          dateKey: getTodayKey(),
          queueNumber,
          displayNumber: displayQueueNumber(queueNumber),
          phone: input.phone,
          pickupTime: input.pickupTime,
          spice: input.spice,
          remark: input.remark.trim(),
          status: 'pending',
          items,
          total: calculateCartTotal(state.cart, state.products),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((current) => ({
          orders: [order, ...current.orders],
          cart: [],
          customerPhone: input.phone,
          currentOrderId: order.id
        }));
        pushSharedState(get());

        return order;
      },
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
          )
        }));
        pushSharedState(get());
      },
      advanceOrderStatus: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status: nextStatus[order.status], updatedAt: new Date().toISOString() }
              : order
          )
        }));
        pushSharedState(get());
      }
    }),
    {
      name: 'wowfood-store-v1',
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<WowfoodState> | undefined;
        return {
          ...current,
          ...persistedState,
          settings: normalizeSettings(persistedState?.settings)
        };
      }
    }
  )
);
