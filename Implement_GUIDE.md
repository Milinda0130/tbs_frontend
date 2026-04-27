# TBS Campus IMS — Thumula's Copilot Guide

> **Who this file is for:** Thumula — Inventory Frontend Developer  
> **Project:** TBS Campus Inventory Management System  
> **Stack:** React 18 + Vite + TypeScript + TanStack Query v5 + Axios + Tailwind CSS  
> **Role on team:** You own all inventory, supplier, and purchase order pages (Pages 7–11, 19–23)

---

## 1. Your HTML Design Files (inside design folder)

These are the HTML files from Stitch that map directly to your React components. They are your visual source of truth — match them exactly when building.

| HTML File Folder | React Component | Page # | Route |
|-----------------|-----------------|--------|-------|
| `inventory_list_tbs_campus_ims/` | `ItemListPage.tsx` | 7 | `/inventory` |
| `item_detail_projector_bulb_x200_tbs_campus_ims/` | `ItemDetailPage.tsx` | 8 | `/inventory/:id` |
| `add_edit_item_tbs_campus_ims/` | `ItemFormSlideOver.tsx` | 9 | (slide-over) |
| `stock_in_form_tbs_campus_ims/` | `StockInSlideOver.tsx` | 10 | (slide-over) |
| `low_stock_alerts_tbs_campus_ims/` | `LowStockPage.tsx` | 11 | `/inventory/low-stock` |
| `supplier_list_tbs_campus_ims/` | `SupplierListPage.tsx` | 19 | `/suppliers` |
| `add_edit_supplier_tbs_campus_ims/` | `SupplierFormSlideOver.tsx` | 20 | (slide-over) |
| `supplier_detail_techpro_solutions_inc./` | `SupplierDetailPage.tsx` | 21 | `/suppliers/:id` |
| `purchase_orders_tbs_campus_ims/` | `PurchaseOrderListPage.tsx` | 22 | `/purchase-orders` |
| `create_edit_purchase_order_tbs_campus_ims/` | `PurchaseOrderFormPage.tsx` | 23 | `/purchase-orders/create`, `/purchase-orders/:id/edit` |

> **How to use these with Copilot:** Open the relevant `code.html` alongside your `.tsx` file. Reference the HTML for class names, layout structure, and element order. Tell Copilot: *"Convert this HTML section to a React component using TanStack Query and Axios following the conventions in this guide. Use TypeScript (.tsx) with proper type annotations."*

---

## 2. Design System Tokens

The project uses a custom Tailwind config based on `campus_inventory_design_system/DESIGN.md`. Use these exact class names in your JSX.

### Colors (custom Tailwind classes)
```
bg-primary                    → #003D9B  (dark blue — primary buttons, active states)
bg-primary-container          → #0052CC  (slightly lighter blue)
bg-surface-container-low      → #F0F3FF  (page backgrounds, subtle fills)
bg-surface-container-lowest   → #FFFFFF  (white card backgrounds)
bg-surface-variant            → #D7E3FB  (hover states, selected tabs)
bg-background                 → #F9F9FF  (app background)
bg-error                      → #BA1A1A  (error/danger)

text-on-surface               → #101C2D  (primary body text)
text-on-surface-variant       → #434654  (secondary/muted text)
text-primary                  → #003D9B
text-error                    → #BA1A1A
text-on-primary               → #FFFFFF  (white text on blue buttons)

border-outline-variant        → #C3C6D6  (default borders)
border-primary                → #003D9B  (focused input border)
```

### Semantic colors used in your pages
```
Low stock row bg:       bg-[#FFF0F0]
Low stock hover:        hover:bg-[#ffeaea]
Active tab border:      border-[#0052CC] border-b-2
Active tab text:        text-[#0052CC]
Standard card border:   border-[#E1E4E8]
```

### Typography classes
```
text-headline-lg   → 32px / 700 weight  (page titles)
text-headline-md   → 24px / 700 weight  (section headings)
text-headline-sm   → 20px / 600 weight  (card headings)
text-body-lg       → 16px / 400 weight  (body text)
text-body-md       → 14px / 400 weight  (table content, labels)
text-label-bold    → 12px / 700 weight / 0.05em spacing (table headers — small caps style)
text-label-md      → 12px / 600 weight  (secondary labels)
```

### Font
```css
/* Add to index.css */
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap');
body { font-family: 'Public Sans', sans-serif; }
```

### Card style pattern (from HTML)
```
bg-surface-container-lowest rounded-lg border border-[#E1E4E8] shadow-[0px_2px_4px_rgba(0,0,0,0.05)]
```

### Border radius
```
rounded      → 4px   (buttons, inputs)
rounded-md   → 6px
rounded-lg   → 8px   (cards)
rounded-full → 9999px (pill badges)
```

---

## 3. Folder Structure

```
src/
├── api/
│   ├── axiosInstance.ts        ← Milinda's shared Axios instance — always import this
│   ├── index.ts                ← re-exports all API groups
│   ├── inventoryApi.ts         ← YOUR file
│   ├── supplierApi.ts          ← YOUR file
│   └── purchaseOrderApi.ts     ← YOUR file
├── components/
│   └── ui/
│       ├── Badge.tsx           ← YOU build (Sprint 1)
│       ├── DataTable.tsx       ← YOU build (Sprint 1)
│       ├── Skeleton.tsx        ← YOU build (Sprint 1)
│       ├── Button.tsx          ← Milinda
│       ├── Input.tsx           ← Milinda
│       ├── Select.tsx          ← Milinda
│       ├── Modal.tsx           ← Piyara
│       ├── SlideOver.tsx       ← Piyara — you use this for ALL your slide-overs
│       ├── PageHeader.tsx      ← Menuka
│       ├── Card.tsx            ← Menuka
│       ├── EmptyState.tsx      ← Menuka
│       ├── FilterBar.tsx       ← Chamath
│       ├── ExportButton.tsx    ← Chamath
│       ├── Toast.tsx           ← Milinda
│       └── ConfirmModal.tsx    ← Milinda
├── features/
│   ├── inventory/
│   │   ├── pages/
│   │   │   ├── ItemListPage.tsx         ← Page 7
│   │   │   ├── ItemDetailPage.tsx       ← Page 8
│   │   │   └── LowStockPage.tsx         ← Page 11
│   │   └── components/
│   │       ├── ItemFormSlideOver.tsx    ← Page 9
│   │       └── StockInSlideOver.tsx     ← Page 10
│   ├── suppliers/
│   │   ├── pages/
│   │   │   ├── SupplierListPage.tsx     ← Page 19
│   │   │   └── SupplierDetailPage.tsx   ← Page 21
│   │   └── components/
│   │       └── SupplierFormSlideOver.tsx ← Page 20
│   └── purchaseOrders/
│       ├── pages/
│       │   ├── PurchaseOrderListPage.tsx ← Page 22
│       │   └── PurchaseOrderFormPage.tsx ← Page 23
│       └── components/
│           └── POLineItemsTable.tsx
├── hooks/
│   └── useDebounce.ts          ← YOU build
├── lib/
│   └── echo.ts                 ← Milinda (WebSocket — Sprint 4)
├── routes/
│   └── index.tsx               ← Milinda owns — register your routes here
└── stores/
    └── AuthContext.tsx         ← Milinda — import useAuth() from here
```

---

## 4. Rules — Non-Negotiable

### Axios
- **NEVER** call `axios.create()` yourself.
- **ALWAYS** import: `import axiosInstance from '@/api/axiosInstance';`
- Put all API functions in your own api files (`inventoryApi.ts`, etc.)
- Return data directly: `const { data } = await axiosInstance.get(...); return data;`
- File downloads: use `responseType: 'blob'` and trigger via temp `<a>` element.

### TanStack Query
- Every GET → `useQuery`. Every POST/PUT/PATCH/DELETE → `useMutation`.
- Query keys always arrays: `['inventory', store, filters]`
- On mutation success: `queryClient.invalidateQueries(['inventory'])`
- Never store server data in local `useState` — use TanStack Query cache.
- Always handle `isLoading` and `isError` — show `<Skeleton />` when loading.
- staleTime: **30s** for list pages, **10s** for real-time pages.

### ESLint
- `npx eslint src/ --fix` before every PR. Zero errors. No exceptions.
- No `console.log`. No inline styles. Max 200 lines per file.

### Git
- Branch: `feature/thumula/item-list-page`, `feature/thumula/shared-ui-components`, etc.
- One feature = one PR. Never self-merge. Milinda reviews all PRs.
- Commits: `feat: add item list page` | `fix: low stock row color` | `refactor: extract useDebounce`

### Role-based UI
```tsx
const { hasRole } = useAuth();
// Hide Edit and Stock In for Audit Officers:
{!hasRole(['audit_officer']) && <button>Edit</button>}
// Hide Add Item for non-stock-management roles:
{hasRole(['admin', 'coordinator', 'stock_keeper']) && <button>Add Item</button>}
```

---

## 5. Your Shared Components (Sprint 1 — Build These First)

### `<Badge />`
File: `src/components/ui/Badge.tsx`

From the HTML files, badges are rounded-pill chips. Colors seen in your pages:

```tsx
// Props: text (string), color ('green'|'red'|'orange'|'blue'|'purple'|'gray'|'teal'), size ('sm'|'md')
const colorMap = {
  green:  'bg-green-100 text-green-700 border border-green-300',
  red:    'bg-[#FFF0F0] text-red-600 border border-red-300',
  orange: 'bg-orange-50 text-orange-700 border border-orange-300',
  blue:   'bg-blue-50 text-blue-800 border border-blue-300',
  purple: 'bg-purple-100 text-purple-800',
  gray:   'bg-slate-100 text-slate-600',
  teal:   'bg-teal-50 text-teal-700',
};
const sizeMap = { sm: 'px-2 py-0.5 text-label-md', md: 'px-3 py-1 text-body-md' };
// Render: <span className={`rounded-full font-medium ${colorMap[color]} ${sizeMap[size]}`}>{text}</span>
```

### `<DataTable />`
File: `src/components/ui/DataTable.tsx`

From `inventory_list_tbs_campus_ims/code.html`:
- Header: `bg-slate-50` background, `text-label-bold` text (uppercase small caps style)
- Row dividers: `border-b border-[#E1E4E8]` (no vertical borders)
- Hover: `hover:bg-slate-50`
- Low-stock rows applied externally via `rowClassName` prop

```tsx
// Props:
//   columns: [{ key, label, sortable (bool), render (fn: (value, row) => ReactNode) }]
//   data: []
//   loading: bool             — show <Skeleton /> placeholder rows when true
//   emptyMessage: string
//   pagination: { page, total, perPage, onChange }
//   rowClassName: (row) => string   ← callers use this to apply bg-[#FFF0F0] on low-stock rows
```

### `<Skeleton />`
File: `src/components/ui/Skeleton.tsx`

```tsx
// Props: lines (int, default 5), height (string, default '20px'), width (string, default '100%')
// Render: animated pulse placeholder bars
// Example: <Skeleton lines={8} height="18px" width="100%" />
```

---

## 6. Page-by-Page Implementation Notes (with HTML Reference)

### Page 7 — Item List (`inventory_list_tbs_campus_ims/code.html`)

**File:** `src/features/inventory/pages/ItemListPage.tsx`

**Store tabs from HTML:**
```
Main Store | Nursing Stock | Hospitality Stock | Media Equipment Store
```
Active tab: `border-b-2 border-[#0052CC] text-[#0052CC]`
Inactive tab: `text-on-surface-variant hover:text-on-surface`

**Item Type toggle from HTML:** All | Consumable | Non-Consumable (pill buttons, `bg-blue-50` when active)

**Table columns (exact from HTML, in order):**
```
# | Item Name | SKU | Category | Unit | Current Stock | Min Stock | Approval Required | Item Type | Actions
```

**Low-stock row:**
```tsx
rowClassName={(row) => row.current_stock < row.min_stock ? 'bg-[#FFF0F0] hover:bg-[#ffeaea]' : ''}
```

**Actions column:** View (eye icon → `/inventory/:id`) | Edit (pencil → `<ItemFormSlideOver />`) | Stock In (add → `<StockInSlideOver />`)

**Query:**
```ts
queryKey: ['inventory', store, { search, category, itemType, approvalRequired, page }]
staleTime: 30_000
refetchOnWindowFocus: true
```

**All filters + store in URL params** — use `useSearchParams()`.

---

### Page 8 — Item Detail (`item_detail_projector_bulb_x200_tbs_campus_ims/code.html`)

**File:** `src/features/inventory/pages/ItemDetailPage.tsx` | Route: `/inventory/:id`

**From HTML:**
- Page title: item name as `text-headline-lg`
- Top-right action buttons: Edit Item | Stock In | Deactivate Item
- Two columns: left = "Item Details" card + "Movement History" table | right = stock widget + supplier card

**Movement History table columns:**
```
Date | Type (badge) | Qty | Reference | User | Notes
```

**Stock gauge color logic:**
```ts
const stockStatus =
  current_stock <= 0           ? 'empty'   :
  current_stock < min_stock    ? 'low'     :
  current_stock < min_stock * 1.2 ? 'warning' : 'healthy';

const colorClass = {
  healthy: 'text-green-700', warning: 'text-orange-700',
  low: 'text-red-600',       empty: 'text-error'
}[stockStatus];
```

**Two queries:**
```ts
useQuery({ queryKey: ['item', id],           queryFn: () => getItem(id) })
useQuery({ queryKey: ['item-movements', id], queryFn: () => getItemMovements(id) })
```

**Real-time (Sprint 4):**
```ts
useChannel('stock.' + id, 'StockUpdated', () => queryClient.invalidateQueries(['item', id]))
```

---

### Page 9 — Add/Edit Item Slide-Over (`add_edit_item_tbs_campus_ims/code.html`)

**File:** `src/features/inventory/components/ItemFormSlideOver.tsx`

**Slide-over width:** 680px → `<SlideOver width="680px" ...>`

**Sections and fields from HTML (exact):**

*Basic Info:*
- Item Name * (required)
- SKU/Item Code * (required)

*Classification:*
- Category (dropdown)
- Unit of Measure (dropdown)
- Store Assignment (dropdown)
- Item Type: Consumable | Non-Consumable (radio toggle)

*Stock Settings:*
- Initial Stock Quantity (number — **create mode only, hide on edit**)
- Minimum Stock Level (number)
- Supplier (searchable dropdown)
- Serial Number (**only shown when Store = 'Media Equipment Store'**)
- Approval Required (toggle switch — uses `peer-checked:bg-primary` styling from HTML)
- Notes (textarea)

**Dynamic serial number field:**
```tsx
{selectedStore === 'media' && (
  <div className="transition-all duration-200 overflow-hidden">
    <Input label="Serial Number" value={serialNumber} onChange={...} />
  </div>
)}
// When store changes away from media: clear serial number value
useEffect(() => {
  if (selectedStore !== 'media') setSerialNumber('');
}, [selectedStore]);
```

**On 422 error:**
```ts
import { parseApiErrors } from '@/utils/parseApiErrors';
onError: (error) => setFieldErrors(parseApiErrors(error))
```

---

### Page 10 — Stock-In Slide-Over (`stock_in_form_tbs_campus_ims/code.html`)

**File:** `src/features/inventory/components/StockInSlideOver.tsx`

**Props:** `open`, `onClose`, `item` (pre-filled item object)

**From HTML — top section "Inventory Status":**
- Item name as `text-headline-md`
- Current stock as large number — read-only

**Form fields (exact from HTML labels):**
```
Quantity Received *         (number, required)
Date Received *             (date picker, default today)
Supplier                    (dropdown, pre-filled from item.supplier_id)
Unit Cost                   (currency input, optional)
Purchase Order Reference    (text, optional)
Notes                       (textarea, optional)
```

**Live preview below qty input:**
```tsx
<p className="text-body-md text-on-surface-variant mt-1">
  New stock level will be:{' '}
  <span className="font-semibold text-on-surface">
    {item.current_stock + (parseInt(qty) || 0)} {item.unit}
  </span>
</p>
```

**On success:** invalidate both `['inventory']` AND `['item', item.id]`

---

### Page 11 — Low Stock Alerts (`low_stock_alerts_tbs_campus_ims/code.html`)

**File:** `src/features/inventory/pages/LowStockPage.tsx`

**From HTML:**
- Header: "Low Stock Alerts" + count badge (e.g. `12` in a red circle)
- Store filter tabs: All Stores | Main Store | Nursing Stock | Hospitality Stock | Media Equipment
- Download (export) + Add buttons top-right

**Table columns (exact from HTML, in order):**
```
Item Name | SKU | Store | Category | Current Stock | Min Stock | Shortage | Action
```

**Shortage column:** `min_stock - current_stock` → display as `"Need X more"` in red bold

**All rows:** `className="bg-[#FFF0F0]"`, current stock cell: `className="text-red-600 font-semibold"`

**Sort client-side after fetch:**
```ts
const sorted = [...data].sort((a, b) =>
  (b.min_stock - b.current_stock) - (a.min_stock - a.current_stock)
);
```

**Empty state:** green checkmark + "All stock levels are healthy." (use `<EmptyState />` when Menuka builds it)

**Real-time (Sprint 4):**
```ts
useChannel('stock.updates', 'StockUpdated', () => queryClient.invalidateQueries(['low-stock', filters]))
```

---

### Page 19 — Supplier List (`supplier_list_tbs_campus_ims/code.html`)

**File:** `src/features/suppliers/pages/SupplierListPage.tsx`

**From HTML:**
- Card grid (not a table): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Each card: supplier name, contact person, phone, email, items count, last purchase date
- Card buttons: Edit (pencil icon) | View (→ `/suppliers/:id`)
- Search bar at top with debounce
- Empty state: `<h3>No suppliers found</h3>` + Add Supplier button

---

### Page 20 — Add/Edit Supplier Slide-Over (`add_edit_supplier_tbs_campus_ims/code.html`)

**File:** `src/features/suppliers/components/SupplierFormSlideOver.tsx`

**Slide-over width:** 560px

**Fields (exact from HTML labels):**
```
Supplier Name *     (required)
Contact Person *    (required)
Phone *             (required)
Email               (optional)
Address             (optional)
Notes               (optional)
```

---

### Page 21 — Supplier Detail (`supplier_detail_techpro_solutions_inc./code.html`)

**File:** `src/features/suppliers/pages/SupplierDetailPage.tsx`

**From HTML:**
- Header: supplier name as `text-headline-lg`, Edit + Add (new PO) buttons top-right
- "Contact Information" section: label-value rows
- "Linked Items" table — columns: **Item Name | Store | Category | Last Purchased**
- PO History table — columns: **PO Number | Date | Status | Total Amount (LKR) | Ordered By | Received By**

**Two queries:**
```ts
useQuery({ queryKey: ['supplier', id],    queryFn: () => getSupplier(id) })
useQuery({ queryKey: ['supplier-pos', id], queryFn: () => getSupplierPOs(id) })
```

**"New Purchase Order" button:**
```tsx
<button onClick={() => navigate(`/purchase-orders/create?supplier=${id}`)}>
  New Purchase Order
</button>
```

---

### Page 22 — Purchase Order List (`purchase_orders_tbs_campus_ims/code.html`)

**File:** `src/features/purchaseOrders/pages/PurchaseOrderListPage.tsx`

**From HTML:**
- "Create New PO" button prominently top-right
- Status tabs: All Orders | Draft | Ordered | Received | Cancelled
- Filter bar: Supplier dropdown | Date Range | filter icon button

**Table columns (exact from HTML, in order):**
```
PO NUMBER | SUPPLIER | ORDER DATE | STATUS | TOTAL AMOUNT | ORDERED BY | RECEIVED BY | ACTIONS
```
Note: headers use `text-label-bold` uppercase styling.

**Status badge colors:**
```
Draft     → gray
Ordered   → blue
Received  → green
Cancelled → red
```

---

### Page 23 — Create/Edit PO (`create_edit_purchase_order_tbs_campus_ims/code.html`)

**File:** `src/features/purchaseOrders/pages/PurchaseOrderFormPage.tsx`

**Section "Order Details" fields:**
```
Supplier *     (dropdown, required)
Order Date     (date picker)
Status         (dropdown)
Notes          (textarea)
```

**Line items table columns (from HTML):**
```
Item Name | Qty Ordered | Unit Cost (LKR) | Line Total
```
- "Add Item" opens searchable item dropdown → appends row
- Line Total = `qty_ordered × unit_cost` (computed, reactive)
- Grand Total below = sum of all line totals

**Grand total:**
```ts
const grandTotal = lineItems.reduce((sum, line) =>
  sum + ((line.qty || 0) * (line.unitCost || 0)), 0
);
// Display: `LKR ${grandTotal.toLocaleString()}`
```

**Section "Record Receipt"** (shown only when editing + status = 'Received'):
```
Per line: Item | Qty Received | Date Received
```

**On Confirm Receipt:**
```ts
mutate({ id, payload: { items: lineItems.map(l => ({ item_id: l.id, qty_received: l.qtyReceived, date_received: l.dateReceived })) } })
// PATCH /api/purchase-orders/:id/receive → stock_in records created server-side
```

---

## 7. Your API Files

### `src/api/inventoryApi.ts`
```ts
import axiosInstance from './axiosInstance';

export const getItems = async (params) => {
  const { data } = await axiosInstance.get('/inventory', { params });
  return data;
};
export const getItem = async (id) => {
  const { data } = await axiosInstance.get(`/inventory/${id}`);
  return data;
};
export const getItemMovements = async (id) => {
  const { data } = await axiosInstance.get(`/inventory/${id}/movements`);
  return data;
};
export const createItem = async (payload) => {
  const { data } = await axiosInstance.post('/inventory', payload);
  return data;
};
export const updateItem = async (id, payload) => {
  const { data } = await axiosInstance.put(`/inventory/${id}`, payload);
  return data;
};
export const stockIn = async (id, payload) => {
  const { data } = await axiosInstance.post(`/inventory/${id}/stock-in`, payload);
  return data;
};
export const getLowStock = async (params) => {
  const { data } = await axiosInstance.get('/inventory/low-stock', { params });
  return data;
};
```

### `src/api/supplierApi.ts`
```ts
import axiosInstance from './axiosInstance';

export const getSuppliers = async (params) => {
  const { data } = await axiosInstance.get('/suppliers', { params });
  return data;
};
export const getSupplier = async (id) => {
  const { data } = await axiosInstance.get(`/suppliers/${id}`);
  return data;
};
export const getSupplierPOs = async (id) => {
  const { data } = await axiosInstance.get(`/suppliers/${id}/purchase-orders`);
  return data;
};
export const createSupplier = async (payload) => {
  const { data } = await axiosInstance.post('/suppliers', payload);
  return data;
};
export const updateSupplier = async (id, payload) => {
  const { data } = await axiosInstance.put(`/suppliers/${id}`, payload);
  return data;
};
```

### `src/api/purchaseOrderApi.ts`
```ts
import axiosInstance from './axiosInstance';

export const getPurchaseOrders = async (params) => {
  const { data } = await axiosInstance.get('/purchase-orders', { params });
  return data;
};
export const getPurchaseOrder = async (id) => {
  const { data } = await axiosInstance.get(`/purchase-orders/${id}`);
  return data;
};
export const createPurchaseOrder = async (payload) => {
  const { data } = await axiosInstance.post('/purchase-orders', payload);
  return data;
};
export const updatePurchaseOrder = async (id, payload) => {
  const { data } = await axiosInstance.put(`/purchase-orders/${id}`, payload);
  return data;
};
export const receivePurchaseOrder = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/purchase-orders/${id}/receive`, payload);
  return data;
};
```

---

## 8. TanStack Query Keys

```ts
['inventory']                                 // invalidate on any item mutation
['inventory', store, filters]                 // item list with store + filters
['item', id]                                  // single item detail
['item-movements', id]                        // movement history
['low-stock', filters]                        // low stock page
['suppliers']                                 // supplier list
['supplier', id]                              // single supplier
['supplier-pos', id]                          // PO history on supplier detail
['purchase-orders', status, filters]          // PO list
['purchase-order', id]                        // single PO
```

---

## 9. Reusable Code Snippets

### useDebounce hook
```ts
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

### parseApiErrors helper
```ts
// src/utils/parseApiErrors.ts
export function parseApiErrors(error) {
  const errors = error?.response?.data?.errors ?? {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]])
  );
}
```

### Standard mutation pattern
```tsx
const queryClient = useQueryClient();
const [fieldErrors, setFieldErrors] = useState({});

const { mutate, isPending } = useMutation({
  mutationFn: (payload) => itemId ? updateItem(itemId, payload) : createItem(payload),
  onSuccess: () => {
    queryClient.invalidateQueries(['inventory']);
    toast.success(itemId ? 'Item updated.' : 'Item created.');
    onClose();
  },
  onError: (error) => {
    if (error.response?.status === 422) {
      setFieldErrors(parseApiErrors(error));
    }
  },
});
```

### File download (export)
```ts
const handleExport = async (format) => {
  const response = await axiosInstance.get('/inventory/export', {
    params: { ...filters, format },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-export.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### WebSocket (Sprint 4 — wait for Milinda's echo.ts)
```ts
import { useChannel } from '@/lib/echo';

useChannel('stock.' + id, 'StockUpdated', () => {
  queryClient.invalidateQueries(['item', id]);
  queryClient.invalidateQueries(['inventory']);
});
```

---

## 10. Dependencies

### What you need from teammates

| What | Who | Needed for |
|------|-----|------------|
| `axiosInstance.ts` | Milinda | All API calls — needed before anything else |
| `useAuth()` hook | Milinda | Role-based UI guards |
| `<SlideOver />` | Piyara | Pages 9, 10, 20 (all your slide-overs) |
| `<Modal />` | Piyara | Confirmation dialogs |
| `<EmptyState />` | Menuka | Empty list states |
| `<ExportButton />` | Chamath | Export on Low Stock, PO pages |
| `echo.ts` + `useChannel()` | Milinda | WebSocket (Sprint 4 only) |

### What teammates need from you

| Component | Needed by | When |
|-----------|-----------|------|
| `<Badge />` | Everyone | Sprint 1 — build first |
| `<DataTable />` | Piyara, Menuka, Chamath | Sprint 1 — build first |
| `<Skeleton />` | Everyone | Sprint 1 — build first |
| `<StockInSlideOver />` | Milinda (Dashboard) | Sprint 2 — dashboard low-stock quick action |

---

## 11. Acceptance Criteria Checklist

### Sprint 1 — Shared Components
- [ ] `<Badge />` renders all color variants with correct design system classes
- [ ] `<DataTable />` sorts on header click, shows `<Skeleton />` when loading, shows emptyMessage when empty, pagination works
- [ ] `<Skeleton />` renders correct number of lines with pulse animation

### Page 7 — Item List
- [ ] Store tabs update `?store=` URL param and re-fetch
- [ ] Low-stock rows show `bg-[#FFF0F0]` without manual refresh
- [ ] Edit and Stock In buttons hidden for Audit Officer
- [ ] Search debounced 300ms — no API call on every keystroke

### Page 8 — Item Detail
- [ ] Stock gauge color matches stock level (green/orange/red)
- [ ] Movement history loads separately from item details (two queries)

### Page 9 — Add/Edit Item Slide-Over
- [ ] Serial Number field appears only when Store = 'Media Equipment Store'
- [ ] Initial Stock field hidden when editing (only shown on create)
- [ ] 422 errors appear per-field, not as a generic toast
- [ ] After save, item appears in list immediately (query invalidated)

### Page 10 — Stock-In
- [ ] New stock level preview is correct: `current_stock + enteredQty`
- [ ] After save, both list page and detail page stock numbers update

### Page 11 — Low Stock
- [ ] Sorted worst-shortage first
- [ ] Shortage column shows "Need X more"
- [ ] Empty state shows when all stock is healthy
- [ ] Stock In button pre-fills slide-over with the correct item

### Pages 19–21 — Suppliers
- [ ] Supplier list is a card grid, not a table
- [ ] "New Purchase Order" navigates with `?supplier={id}`
- [ ] Supplier detail makes two separate TanStack queries

### Pages 22–23 — Purchase Orders
- [ ] Status tabs filter correctly and reflect in URL
- [ ] Grand total recomputes instantly on any qty or cost change
- [ ] Confirm Receipt triggers stock increase in inventory
- [ ] Line item search excludes already-added items

### All Pages
- [ ] `npx eslint src/ --fix` passes with 0 errors
- [ ] All loading states use `<Skeleton />` — no blank areas
- [ ] All error states handled — not just happy paths
- [ ] Design tokens match the HTML files (correct colors and typography classes)

---

## 12. Quick Reference

| Thing | Value |
|-------|-------|
| Axios import | `import axiosInstance from '@/api/axiosInstance'` |
| Auth hook | `import { useAuth } from '@/stores/AuthContext'` |
| Query client | `import { useQueryClient } from '@tanstack/react-query'` |
| Path alias | `@/` = `src/` (set by Milinda in vite.config.ts) |
| Font | `Public Sans` — must be imported in index.css |
| Primary color | `#003D9B` → `bg-primary` / `text-primary` |
| Low stock row | `bg-[#FFF0F0]` |
| Active tab | `border-b-2 border-[#0052CC] text-[#0052CC]` |
| Card style | `bg-surface-container-lowest rounded-lg border border-[#E1E4E8]` |
| Table header | `bg-slate-50 text-label-bold` |
| Linting | `npx eslint src/ --fix` |
| Branch format | `feature/thumula/{feature-name}` |
| PR reviewer | Milinda — never self-merge |

---

*TBS Campus IMS Frontend Plan v1.0 · April 2026 · Thumula — Inventory Developer*  
*HTML designs from Stitch · Design system: Public Sans + custom Tailwind tokens*  
*Refer to `campus_inventory_design_system/DESIGN.md` for full design token reference.*
