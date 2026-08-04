import { ChevronRight, Clock3, ShoppingBag, Store, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { QuantityStepper } from '../components/QuantityStepper';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { Product } from '../types';
import {
  calculateCartTotal,
  formatMoney,
  getCartCount,
  getCartQuantity,
  maskPhone,
  statusLabel
} from '../utils/format';

export default function CustomerMenuPage() {
  const settings = useWowfoodStore((state) => state.settings);
  const categories = useWowfoodStore((state) => state.categories);
  const products = useWowfoodStore((state) => state.products);
  const cart = useWowfoodStore((state) => state.cart);
  const customerPhone = useWowfoodStore((state) => state.customerPhone);
  const orders = useWowfoodStore((state) => state.orders);
  const currentOrderId = useWowfoodStore((state) => state.currentOrderId);
  const setCustomerPhone = useWowfoodStore((state) => state.setCustomerPhone);
  const addToCart = useWowfoodStore((state) => state.addToCart);
  const reduceFromCart = useWowfoodStore((state) => state.reduceFromCart);
  const clearCart = useWowfoodStore((state) => state.clearCart);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(customerPhone);
  const acceptingOrders = settings.acceptingOrders ?? true;
  const pauseMessage = settings.pauseMessage || '今天暂不接单，请稍后再来。';

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const activeOrder = orders.find(
    (order) => order.id === currentOrderId && order.status !== 'completed'
  );

  useEffect(() => {
    if (!selectedCategoryId && sortedCategories[0]) {
      setSelectedCategoryId(sortedCategories[0].id);
      return;
    }

    if (selectedCategoryId && !sortedCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(sortedCategories[0]?.id ?? '');
    }
  }, [selectedCategoryId, sortedCategories]);

  const selectedProducts = products.filter((product) => product.categoryId === selectedCategoryId);
  const cartCount = getCartCount(cart);
  const cartTotal = calculateCartTotal(cart, products);
  const cartProducts = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => Boolean(item));

  function handlePhoneSave() {
    setCustomerPhone(phoneDraft.replace(/\D/g, '').slice(0, 11));
    setPhoneOpen(false);
  }

  return (
    <main className="relative min-h-screen pb-48">
      <header className="sticky top-0 z-20 bg-white px-4 pb-3 pt-safe-top shadow-sm">
        <div className="flex items-center justify-between pt-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
              <Store size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">{settings.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {acceptingOrders ? settings.notice : pauseMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPhoneDraft(customerPhone);
              setPhoneOpen(true);
            }}
            className="ml-3 shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
          >
            {customerPhone ? maskPhone(customerPhone) : '手机号'}
          </button>
        </div>

        {activeOrder ? (
          <Link
            to={`/ticket/${activeOrder.id}`}
            className="mt-3 flex items-center justify-between rounded-lg bg-brand-dark px-4 py-3 text-white"
          >
            <div>
              <p className="text-xs text-white/70">当前订单</p>
              <p className="text-lg font-bold">
                {activeOrder.displayNumber} · {statusLabel[activeOrder.status]}
              </p>
            </div>
            <ChevronRight size={20} />
          </Link>
        ) : null}
        {!acceptingOrders ? (
          <div className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {pauseMessage}
          </div>
        ) : null}
      </header>

      <section className="px-4 py-4">
        <div className="overflow-hidden rounded-lg bg-brand-dark text-white">
          <div className="bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center">
            <div className="bg-gradient-to-r from-black/75 to-black/10 p-4">
              <p className="text-sm text-white/75">{acceptingOrders ? settings.openLabel : '暂停接单'}</p>
              <h2 className="mt-1 text-2xl font-bold">提前点好，到摊自提</h2>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <Clock3 size={16} />
                现场付款，按取货时间制作
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex h-[calc(100vh-280px)] min-h-[420px] border-t border-slate-100 bg-white">
        <aside className="w-28 shrink-0 overflow-y-auto bg-slate-100">
          {sortedCategories.map((category) => {
            const quantity = cart.reduce((total, item) => {
              const product = products.find((candidate) => candidate.id === item.productId);
              return product?.categoryId === category.id ? total + item.quantity : total;
            }, 0);

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`relative flex min-h-14 w-full items-center justify-center px-2 text-sm font-medium ${
                  selectedCategoryId === category.id
                    ? 'bg-white text-slate-950'
                    : 'text-slate-500'
                }`}
              >
                <span className="line-clamp-2">{category.name}</span>
                {quantity > 0 ? (
                  <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs text-white">
                    {quantity}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 overflow-y-auto px-4 pb-28">
          <h2 className="sticky top-0 bg-white py-4 text-lg font-bold">
            {sortedCategories.find((category) => category.id === selectedCategoryId)?.name ?? '菜单'}
          </h2>

          <div className="space-y-4">
            {selectedProducts.map((product) => {
              const quantity = getCartQuantity(cart, product.id);
              const soldOut = product.status === 'sold_out';

              return (
                <article key={product.id} className="flex gap-3 border-b border-slate-100 pb-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={`h-full w-full object-cover ${soldOut ? 'grayscale' : ''}`}
                      loading="lazy"
                    />
                    {soldOut ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-slate-500">
                        已售罄
                      </div>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand-mint px-2 py-0.5 text-xs text-brand-green"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {product.unit}
                      </span>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <p className="text-lg font-bold">{formatMoney(product.price)}</p>
                      <QuantityStepper
                        quantity={quantity}
                        disabled={soldOut}
                        onAdd={() => addToCart(product.id)}
                        onReduce={() => reduceFromCart(product.id)}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {cartCount > 0 ? (
        <div className="fixed inset-x-0 bottom-[86px] z-30 mx-auto max-w-[480px] px-4">
          <div className="mb-3 flex h-16 overflow-hidden rounded-full bg-black text-white shadow-bar">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex w-24 items-center justify-center border-r border-white/10"
              aria-label="打开购物车"
            >
              <ShoppingBag size={28} />
              <span className="absolute right-5 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs">
                {cartCount}
              </span>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="flex flex-1 items-center px-4 text-left text-xl font-bold"
            >
              {formatMoney(cartTotal)}
            </button>
            {acceptingOrders ? (
              <Link
                to="/checkout"
                className="flex w-32 items-center justify-center bg-brand-green text-lg font-semibold"
              >
                去结算
              </Link>
            ) : (
              <button
                disabled
                className="flex w-32 items-center justify-center bg-slate-600 text-base font-semibold"
              >
                暂不接单
              </button>
            )}
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-lg bg-white pb-safe-bottom">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <h2 className="text-lg font-bold">购物车</h2>
                <p className="text-sm text-slate-500">已点 {cartCount} 份</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearCart} className="text-sm text-slate-500">
                  清空
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                  aria-label="关闭购物车"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-4">
              {cartProducts.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-4"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.unit} · {formatMoney(product.price)}
                    </p>
                  </div>
                  <QuantityStepper
                    quantity={quantity}
                    onAdd={() => addToCart(product.id)}
                    onReduce={() => reduceFromCart(product.id)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm text-slate-500">现场应付</p>
                <p className="text-2xl font-bold">{formatMoney(cartTotal)}</p>
              </div>
              {acceptingOrders ? (
                <Link
                  to="/checkout"
                  className="flex h-12 min-w-32 items-center justify-center rounded-lg bg-brand-green px-5 font-semibold text-white"
                >
                  去结算
                </Link>
              ) : (
                <button
                  disabled
                  className="h-12 min-w-32 rounded-lg bg-slate-300 px-5 font-semibold text-white"
                >
                  暂不接单
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {phoneOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="mx-auto w-full max-w-[480px] rounded-t-lg bg-white p-5 pb-safe-bottom">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">手机号</h2>
              <button
                onClick={() => setPhoneOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <input
              value={phoneDraft}
              onChange={(event) => setPhoneDraft(event.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="tel"
              className="mt-4 h-12 w-full rounded-lg border border-slate-200 px-4 text-lg outline-none focus:border-brand-green"
              placeholder="请输入 11 位手机号"
            />
            <button
              onClick={handlePhoneSave}
              className="mt-4 h-12 w-full rounded-lg bg-brand-green font-semibold text-white"
            >
              保存
            </button>
          </div>
        </div>
      ) : null}
      <CustomerTabBar />
    </main>
  );
}
