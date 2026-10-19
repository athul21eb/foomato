import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  X,
  Loader2,
  Navigation,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { LocationModal } from '../../../components/ui/location-modal';
import {
  customerAddressFormSchema,
  type CustomerAddressFormValues,
} from '../schemas/customer.schema';
import type { CustomerAddress } from '../types/address.types';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomerAddress | null;
  onSubmit: (values: CustomerAddressFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(initialData);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerAddressFormValues>({
    resolver: zodResolver(customerAddressFormSchema),
    defaultValues: {
      mobile: '',
      formattedAddress: '',
      instructions: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const hasCoordinates =
    typeof latitude === 'number' && typeof longitude === 'number';

  // Sync initialData when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          mobile: initialData.mobile ? String(initialData.mobile) : '',
          formattedAddress: initialData.formattedAddress || '',
          instructions: initialData.instructions || '',
          latitude: initialData.location?.coordinates?.[1],
          longitude: initialData.location?.coordinates?.[0],
        });
      } else {
        reset({
          mobile: '',
          formattedAddress: '',
          instructions: '',
          latitude: undefined,
          longitude: undefined,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isMapModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting, isMapModalOpen]);

  if (!isOpen) return null;

  const handleLocationConfirm = (locationData: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => {
    if (locationData.address) {
      setValue('formattedAddress', locationData.address, {
        shouldValidate: true,
      });
    }
    if (locationData.latitude !== null && locationData.latitude !== undefined) {
      setValue('latitude', locationData.latitude, { shouldValidate: true });
    }
    if (
      locationData.longitude !== null &&
      locationData.longitude !== undefined
    ) {
      setValue('longitude', locationData.longitude, { shouldValidate: true });
    }
    setIsMapModalOpen(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
          {/* Top Brand Accent Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 shrink-0" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {isEdit ? 'Update Delivery Address' : 'Add New Address'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isEdit
                    ? 'Modify your existing address details and coordinates'
                    : 'Pin your location on the map and provide contact details'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4"
          >
            {/* Map Picker Action Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border border-orange-500/15 dark:border-orange-500/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Pin Location on Map
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hasCoordinates ? 'Change Pin' : 'Select on Map'}</span>
                </button>
              </div>

              {hasCoordinates ? (
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Pinned at Lat: {latitude?.toFixed(4)}, Lng:{' '}
                    {longitude?.toFixed(4)}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Select your exact delivery point on Google Maps for precise delivery.
                </p>
              )}

              {(errors.latitude || errors.longitude) && (
                <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Please select your location on the map
                </p>
              )}
            </div>

            {/* Formatted Address Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Address / Flat / Building / Street *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Flat 4B, Sky Towers, Infopark Phase 2, Kakkanad, Kochi"
                {...register('formattedAddress')}
                className={`w-full p-3 rounded-xl text-xs border outline-none transition-colors resize-none ${
                  errors.formattedAddress
                    ? 'border-red-500 bg-red-500/10'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-orange-500'
                }`}
              />
              {errors.formattedAddress && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.formattedAddress.message}
                </p>
              )}
            </div>

            {/* Mobile Contact Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contact Phone Number (10 digits) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9847012345"
                  {...register('mobile')}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border outline-none transition-colors font-medium ${
                    errors.mobile
                      ? 'border-red-500 bg-red-500/10'
                      : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Delivery Instructions Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Delivery / Gate / Door Instructions
                </label>
                <span className="text-[11px] text-zinc-400">Optional</span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-zinc-400">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Ring doorbell, leave package with security guard at gate"
                  {...register('instructions')}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border outline-none transition-colors resize-none ${
                    errors.instructions
                      ? 'border-red-500 bg-red-500/10'
                      : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.instructions && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.instructions.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEdit ? 'Update Address' : 'Save Address'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Maps Location Modal */}
      <LocationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleLocationConfirm}
        confirmButtonText="Confirm Delivery Location"
      />
    </>
  );
};
