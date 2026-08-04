import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleOff,
  Edit3,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '../components/AdminHeader';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { Product, ProductStatus } from '../types';
import { formatMoney } from '../utils/format';

interface ProductFormState {
  name: string;
  categoryId: string;
  price: string;
  unit: string;
  description: string;
  tags: string;
  imageUrl: string;
  status: ProductStatus;
}

const emptyProductForm: ProductFormState = {
  name: '',
  categoryId: '',
  price: '',
  unit: '',
  description: '',
  tags: '',
  imageUrl: '',
  status: 'available'
};

export default function AdminMenuPage() {
  const categories = useWowfoodStore((state) => state.categories);
  const products = useWowfoodStore((state) => state.products);
  const addCategory = useWowfoodStore((state) => state.addCategory);
  const updateCategory = useWowfoodStore((state) => state.updateCategory);
  const deleteCategory = useWowfoodStore((state) => state.deleteCategory);
  const moveCategory = useWowfoodStore((state) => state.moveCategory);
  const addProduct = useWowfoodStore((state) => state.addProduct);
  const updateProduct = useWowfoodStore((state) => state.updateProduct);
  const deleteProduct = useWowfoodStore((state) => state.deleteProduct);
  const toggleProductStatus = useWowfoodStore((state) => state.toggleProductStatus);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const categoryProducts = products.filter((product) => product.categoryId === selectedCategoryId);

  useEffect(() => {
    if (!selectedCategoryId && sortedCategories[0]) {
      setSelectedCategoryId(sortedCategories[0].id);
      setProductForm((form) => ({ ...form, categoryId: sortedCategories[0].id }));
      return;
    }

    if (selectedCategoryId && !sortedCategories.some((category) => category.id === selectedCategoryId)) {
      const nextId = sortedCategories[0]?.id ?? '';
      setSelectedCategoryId(nextId);
      setProductForm((form) => ({ ...form, categoryId: nextId }));
    }
  }, [selectedCategoryId, sortedCategories]);

  function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addCategory(categoryName);
    setCategoryName('');
  }

  function startEditCategory(id: string, name: string) {
    setEditingCategoryId(id);
    setEditingCategoryName(name);
  }

  function saveCategory() {
    if (!editingCategoryId) return;
    updateCategory(editingCategoryId, editingCategoryName);
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }

  function resetProductForm(nextCategoryId = selectedCategoryId) {
    setEditingProductId(null);
    setProductForm({
      ...emptyProductForm,
      categoryId: nextCategoryId
    });
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      unit: product.unit,
      description: product.description,
      tags: product.tags.join('，'),
      imageUrl: product.imageUrl,
      status: product.status
    });
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(productForm.price);
    if (!productForm.name.trim() || !productForm.categoryId || !Number.isFinite(price)) return;

    const payload = {
      name: productForm.name.trim(),
      categoryId: productForm.categoryId,
      price: Math.max(0, price),
      unit: productForm.unit.trim() || '份',
      description: productForm.description.trim(),
      tags: productForm.tags
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageUrl:
        productForm.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      status: productForm.status
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      addProduct(payload);
    }

    setSelectedCategoryId(payload.categoryId);
    resetProductForm(payload.categoryId);
  }

  return (
    <main className="min-h-screen pb-8">
      <AdminHeader />

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-lg bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">分类</h2>
              <p className="mt-1 text-sm text-slate-500">左侧菜单会按这里的顺序展示。</p>
            </div>
            <span className="rounded-full bg-brand-mint px-3 py-1 text-sm font-semibold text-brand-green">
              {sortedCategories.length} 个
            </span>
          </div>

          <form className="mt-4 flex gap-2" onSubmit={handleAddCategory}>
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
              placeholder="新增分类"
            />
            <button className="flex h-11 min-w-20 items-center justify-center gap-1 rounded-lg bg-brand-green px-3 font-semibold text-white">
              <Plus size={16} />
              添加
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {sortedCategories.map((category, index) => {
              const count = products.filter((product) => product.categoryId === category.id).length;
              const editing = editingCategoryId === category.id;

              return (
                <div
                  key={category.id}
                  className={`rounded-lg border p-3 ${
                    selectedCategoryId === category.id
                      ? 'border-brand-green bg-brand-mint'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        value={editingCategoryName}
                        onChange={(event) => setEditingCategoryName(event.target.value)}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                      />
                      <button
                        type="button"
                        onClick={saveCategory}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green text-white"
                        aria-label="保存分类"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"
                        aria-label="取消编辑"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          setProductForm((form) => ({ ...form, categoryId: category.id }));
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="font-semibold">{category.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{count} 个商品</p>
                      </button>
                      <button
                        onClick={() => moveCategory(category.id, 'up')}
                        disabled={index === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 disabled:opacity-30"
                        aria-label="上移分类"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveCategory(category.id, 'down')}
                        disabled={index === sortedCategories.length - 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 disabled:opacity-30"
                        aria-label="下移分类"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => startEditCategory(category.id, category.name)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500"
                        aria-label="编辑分类"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`删除分类「${category.name}」及其商品？`)) {
                            deleteCategory(category.id);
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-red"
                        aria-label="删除分类"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">商品</h2>
              <p className="mt-1 text-sm text-slate-500">
                {sortedCategories.find((category) => category.id === selectedCategoryId)?.name ?? '请选择分类'}
              </p>
            </div>
            {editingProductId ? (
              <button
                onClick={() => resetProductForm()}
                className="h-10 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600"
              >
                新增模式
              </button>
            ) : null}
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleProductSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">商品名称</span>
              <input
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                placeholder="例如 招牌牛肉串"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">所属分类</span>
                <select
                  value={productForm.categoryId}
                  onChange={(event) =>
                    setProductForm({ ...productForm, categoryId: event.target.value })
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-brand-green"
                >
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">价格</span>
                <input
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value.replace(/[^\d.]/g, '')
                    })
                  }
                  inputMode="decimal"
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                  placeholder="25"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">规格</span>
                <input
                  value={productForm.unit}
                  onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                  placeholder="10串 / 份 / 杯"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">状态</span>
                <select
                  value={productForm.status}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      status: event.target.value as ProductStatus
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-brand-green"
                >
                  <option value="available">在售</option>
                  <option value="sold_out">已售罄</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">卖点描述</span>
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({ ...productForm, description: event.target.value })
                }
                className="mt-1 min-h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-green"
                placeholder="鲜肉现穿，炭烤入味"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-600">标签</span>
              <input
                value={productForm.tags}
                onChange={(event) => setProductForm({ ...productForm, tags: event.target.value })}
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                placeholder="招牌，热销"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <ImagePlus size={16} />
                图片 URL
              </span>
              <input
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm({ ...productForm, imageUrl: event.target.value })
                }
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
                placeholder="https://..."
              />
            </label>

            <button
              disabled={sortedCategories.length === 0}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-green font-semibold text-white disabled:bg-slate-300"
            >
              <Save size={18} />
              {editingProductId ? '保存商品' : '新增商品'}
            </button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-4">
          <h2 className="text-lg font-bold">当前分类商品</h2>
          <div className="mt-4 space-y-3">
            {categoryProducts.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                这个分类还没有商品
              </div>
            ) : null}

            {categoryProducts.map((product) => (
              <article key={product.id} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`h-20 w-20 shrink-0 rounded-lg object-cover ${
                    product.status === 'sold_out' ? 'grayscale' : ''
                  }`}
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatMoney(product.price)} / {product.unit}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                        product.status === 'available'
                          ? 'bg-brand-mint text-brand-green'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {product.status === 'available' ? '在售' : '已售罄'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className="flex h-10 items-center justify-center gap-1 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600"
                    >
                      {product.status === 'available' ? (
                        <CircleOff size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {product.status === 'available' ? '沽清' : '上架'}
                    </button>
                    <button
                      onClick={() => startEditProduct(product)}
                      className="flex h-10 items-center justify-center gap-1 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600"
                    >
                      <Edit3 size={15} />
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`删除商品「${product.name}」？`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="flex h-10 items-center justify-center gap-1 rounded-lg bg-red-50 text-sm font-semibold text-brand-red"
                    >
                      <Trash2 size={15} />
                      删除
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
