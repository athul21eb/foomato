import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Seller } from '../types/seller.types';
import { useModalScrollLock } from '../../../lib/use-modal-scroll-lock';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Check,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useUploadImageMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
  useDeleteMenuItemMutation,
} from '../api/seller.api';
import {
  menuItemSchema,
  type MenuItemFormValues,
} from '../schemas/seller.schema';
import type { MenuItem } from '../types/seller.types';
import { formatCurrency, getCurrencySymbol } from '../../../lib/utils';

const ITEMS_PER_PAGE = 6;

interface SellerMenuTabProps {
  seller: Seller;
}

export const SellerMenuTab: React.FC<SellerMenuTabProps> = ({ seller }) => {
  const {
    data: items = [],
    isLoading: isLoadingItems,
    isError: isLoadError,
    refetch,
  } = useGetMenuItemsQuery(seller.id);

  const [createMenuItem] = useCreateMenuItemMutation();
  const [toggleAvailability] = useToggleMenuItemAvailabilityMutation();
  const [deleteMenuItem, { isLoading: isDeletingItem }] = useDeleteMenuItemMutation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // New item modal image & upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isSavingItem, setIsSavingItem] = useState(false);

  const [uploadImage] = useUploadImageMutation();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      price: '' as unknown as number,
      description: '',
      isVeg: true,
    },
  });

  const isVeg = useWatch({ control, name: 'isVeg' });

  // Toggle item in-stock status with optimistic RTK Query update
  const handleToggleAvailability = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const nextAvailable = !item.isAvailable;

    try {
      await toggleAvailability({
        itemId: id,
        isAvailable: nextAvailable,
        sellerId: seller.id,
      }).unwrap();

      if (nextAvailable) {
        toast.success(`${item.name} is now IN STOCK`, { id: `item-stock-${id}` });
      } else {
        toast.info(`${item.name} is now OUT OF STOCK (Closed)`, { id: `item-stock-${id}` });
      }
    } catch {
      toast.error(`Failed to update ${item.name} status`);
    }
  };

  // Confirm delete dish
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const dishName = itemToDelete.name;
    try {
      await deleteMenuItem({
        itemId: itemToDelete.id,
        sellerId: seller.id,
      }).unwrap();
      toast.info(`Removed "${dishName}" from menu`);
      setItemToDelete(null);
    } catch {
      toast.error(`Failed to delete "${dishName}"`);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Image size must be less than 5MB');
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileError('');
    }
  };

  // Handle Add Item submit with React Hook Form
  const onAddMenuItem = async (data: MenuItemFormValues) => {
    if (!selectedFile && !imagePreview) {
      setFileError('Please upload a photo for this dish');
      return;
    }

    setIsSavingItem(true);
    try {
      let finalImageUrl = imagePreview;

      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const uploadRes = await uploadImage(formData).unwrap();
          finalImageUrl = uploadRes.url;
        } catch {
          toast.error('Photo upload failed. Please try again.');
          setIsSavingItem(false);
          return;
        }
      }

      if (!finalImageUrl) {
        setFileError('Dish image could not be processed');
        setIsSavingItem(false);
        return;
      }

      const createdItem = await createMenuItem({
        name: data.name.trim(),
        price: data.price,
        description: data.description.trim(),
        isVeg: data.isVeg,
        isAvailable: true,
        image: finalImageUrl,
        sellerId: seller.id,
      }).unwrap();

      handleCloseModal();
      setCurrentPage(1);
      toast.success(`"${createdItem.name}" added to menu catalog!`);
    } catch {
      toast.error('Failed to add dish item');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    reset({
      name: '',
      price: '' as unknown as number,
      description: '',
      isVeg: true,
    });
    setSelectedFile(null);
    setImagePreview('');
    setFileError('');
  };

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    );
  }, [items, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useModalScrollLock(Boolean(itemToDelete || isAddModalOpen));

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Restaurant Menu
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25">
              {items.length} Dishes
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your kitchen's dishes, pricing, and live availability
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            reset({
              name: '',
              price: '' as unknown as number,
              description: '',
              isVeg: true,
            });
            setSelectedFile(null);
            setImagePreview('');
            setFileError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search dishes by name or ingredients..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dishes Cards Grid */}
      {isLoadingItems ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden animate-pulse flex flex-col justify-between h-72"
            >
              <div className="h-44 bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
              </div>
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isLoadError ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Failed to load menu items
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Could not fetch dishes from the seller service. Please verify your connection or retry.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : paginatedItems.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md ${
                  item.isAvailable
                    ? 'border-zinc-200/80 dark:border-zinc-800/80'
                    : 'border-zinc-300 dark:border-zinc-800 opacity-70'
                }`}
              >
                <div>
                  {/* Dish Photo & Veg Badge */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-800 group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Veg / Non-Veg Icon */}
                    <div className="absolute top-3 left-3 flex items-center">
                      <div className="p-1 rounded-md bg-white/95 dark:bg-zinc-900/95 shadow-md flex items-center justify-center">
                        <div
                          className={`w-3.5 h-3.5 border-2 rounded-xs flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-lg font-black text-white drop-shadow-md">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Dish Details */}
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white tracking-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Control Bar: Availability Toggle & Actions */}
                <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
                  {/* Stock Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.isAvailable}
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        item.isAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Delete Dish Button */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    title="Remove dish"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {Math.min(safePage * ITEMS_PER_PAGE, filteredItems.length)}
                </strong>{' '}
                of{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {filteredItems.length}
                </strong>{' '}
                dishes
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pageNum === safePage
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No dishes found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? `No dishes match "${searchQuery}". Try a different keyword.`
              : 'Add dishes to start curating your restaurant menu.'}
          </p>
          <button
            type="button"
            onClick={() => {
              reset({
                name: '',
                price: '' as unknown as number,
                description: '',
                isVeg: true,
              });
              setSelectedFile(null);
              setImagePreview('');
              setFileError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Dish</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setItemToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Delete Menu Item
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Confirm permanent dish removal
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-zinc-900 dark:text-white">
                "{itemToDelete.name}"
              </strong>{' '}
              from your menu? Customers will no longer be able to view or order this item.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingItem ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeletingItem ? 'Deleting...' : 'Delete Dish'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add New Dish Modal — 2 Columns on md+ screens, compact and zero-scroll design */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white">
                    Add New Menu Item
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Add a new specialty dish to {seller.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body: 2-Column Grid on md+ eliminates all scroll */}
            <form onSubmit={handleSubmit(onAddMenuItem)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left Column: Photo Upload Dropzone + Veg/Non-Veg Toggle */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Dish Photo <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative h-44 sm:h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden group ${
                        fileError
                          ? 'border-red-500 bg-red-500/5'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-orange-500 hover:bg-orange-500/5'
                      }`}
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Dish Preview"
                            className="w-full h-full object-cover object-center"
                          />
                          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="w-6 h-6 mb-1 text-orange-400 animate-bounce" />
                            <span className="text-xs font-bold">Replace Dish Photo</span>
                            <span className="text-[10px] text-zinc-300">PNG, JPG, or WebP up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={isSavingItem}
                              className="hidden"
                            />
                          </label>
                        </>
                      ) : (
                        <label className="h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-orange-500/5 transition-colors">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs ${
                              fileError
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-orange-500/10 text-orange-500'
                            }`}
                          >
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            Upload Dish Photo
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            PNG, JPG, or WebP up to 5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSavingItem}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {fileError && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fileError}</span>
                      </p>
                    )}
                  </div>

                  {/* Dietary Classification */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Dietary Classification
                    </label>
                    <div className="flex items-center gap-2 h-10">
                      <button
                        type="button"
                        onClick={() => setValue('isVeg', true)}
                        className={`flex-1 h-full rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isVeg
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        🌱 Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('isVeg', false)}
                        className={`flex-1 h-full rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          !isVeg
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        🍗 Non-Veg
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Name, Price, Description */}
                <div className="space-y-3.5">
                  {/* Dish Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Dish Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Crispy Butter Chicken"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white transition-all ${
                        errors.name
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500/40'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Price ({getCurrencySymbol()}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      {...register('price')}
                      placeholder="250"
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white transition-all ${
                        errors.price
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500/40'
                      }`}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.price.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      {...register('description')}
                      placeholder="Ingredients, preparation style, and portion notes..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white transition-all resize-none ${
                        errors.description
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-orange-500/40'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.description.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSavingItem}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingItem ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingItem ? 'Saving Dish...' : 'Save Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
