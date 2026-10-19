import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Phone,
  FileText,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Star,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetMyAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} from '../../../slices/address/addressApiSlice';
import type { CustomerAddress } from '../types/address.types';
import type { CustomerAddressFormValues } from '../schemas/customer.schema';
import { AddressFormModal } from './address-form-modal';
import { DeleteAddressModal } from './delete-address-modal';

interface AddressManagerProps {
  className?: string;
  showHeader?: boolean;
}

const MAX_ADDRESSES = 5;

export const AddressManager: React.FC<AddressManagerProps> = ({
  className = '',
  showHeader = true,
}) => {
  const { data, isLoading, isError, refetch } = useGetMyAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );
  const [addressToDelete, setAddressToDelete] =
    useState<CustomerAddress | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const addresses: CustomerAddress[] = data || [];
  const isLimitReached = addresses.length >= MAX_ADDRESSES;

  const handleOpenCreateModal = () => {
    if (isLimitReached) {
      toast.error(
        `You have reached the maximum limit of ${MAX_ADDRESSES} saved addresses. Please delete an address to add a new one.`,
      );
      return;
    }
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: CustomerAddressFormValues) => {
    try {
      const payload = {
        mobile: Number(values.mobile),
        formattedAddress: values.formattedAddress.trim(),
        instructions: values.instructions?.trim() || undefined,
        location: {
          type: 'Point' as const,
          coordinates: [values.longitude, values.latitude] as [number, number],
        },
      };

      if (editingAddress) {
        await updateAddress({
          id: editingAddress.id,
          data: payload,
        }).unwrap();
        toast.success('Address updated successfully');
      } else {
        await addAddress(payload).unwrap();
        toast.success('New address added to your account');
      }

      setIsFormModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string } };
      toast.error(
        errObj?.data?.message || 'Failed to save address. Please try again.',
      );
    }
  };

  const handleSetDefault = async (address: CustomerAddress) => {
    if (address.isDefault || isSettingDefault) return;

    try {
      setSettingDefaultId(address.id);
      await setDefaultAddress(address.id).unwrap();
      toast.success('Default delivery address updated');
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string } };
      toast.error(
        errObj?.data?.message || 'Failed to set default address. Please try again.',
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddress(addressToDelete.id).unwrap();
      toast.success('Address removed successfully');
      setAddressToDelete(null);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string } };
      toast.error(
        errObj?.data?.message || 'Failed to delete address. Please try again.',
      );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Saved Delivery Addresses
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {addresses.length}/{MAX_ADDRESSES}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Manage your delivery locations for faster checkout (up to {MAX_ADDRESSES} saved addresses).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            disabled={isLimitReached}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto ${
              isLimitReached
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 active:scale-95 cursor-pointer'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>
      )}

      {/* Limit Reached Warning Banner */}
      {isLimitReached && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              You have reached your limit of <strong>{MAX_ADDRESSES} saved addresses</strong>. To add a new location, please remove an unused address.
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
              <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-8 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Unable to load addresses
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            We encountered a problem loading your saved delivery addresses. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="p-10 sm:p-14 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
              No saved addresses found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Add your home, office, or custom locations to enjoy hassle-free doorstep food deliveries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      )}

      {/* Address Grid */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const lat = address.location?.coordinates?.[1];
            const lng = address.location?.coordinates?.[0];
            const isTargetSetting = settingDefaultId === address.id;

            return (
              <div
                key={address.id}
                className={`group relative p-5 rounded-3xl bg-white dark:bg-zinc-900/80 border transition-all flex flex-col justify-between ${
                  address.isDefault
                    ? 'border-orange-500/60 ring-2 ring-orange-500/15 shadow-sm shadow-orange-500/5'
                    : 'border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-orange-500/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header & Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Delivery Address
                      </span>

                      {/* Default Address Badge */}
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(address)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors cursor-pointer"
                        title="Edit address"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressToDelete(address)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Formatted Address */}
                  <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2">
                    {address.formattedAddress}
                  </p>

                  {/* Contact Phone */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>+91 {address.mobile}</span>
                  </div>

                  {/* Delivery Instructions */}
                  {address.instructions && (
                    <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 italic">
                        &quot;{address.instructions}&quot;
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Default Switcher & Map Coordinates Badge */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <div>
                    {!address.isDefault ? (
                      <button
                        type="button"
                        disabled={isSettingDefault}
                        onClick={() => handleSetDefault(address)}
                        className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
                      >
                        {isTargetSetting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Setting default...</span>
                          </>
                        ) : (
                          <>
                            <Star className="w-3.5 h-3.5" />
                            <span>Set as Default</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-medium">
                        Primary Destination
                      </span>
                    )}
                  </div>

                  {lat !== undefined && lng !== undefined && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                      <Navigation className="w-3 h-3 text-emerald-500 shrink-0" />
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <AddressFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSubmit={handleFormSubmit}
        isSubmitting={isAdding || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAddressModal
        isOpen={Boolean(addressToDelete)}
        address={addressToDelete}
        onCancel={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
