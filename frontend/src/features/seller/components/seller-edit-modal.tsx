import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Seller } from '../types/seller.types';
import { useModalScrollLock } from '../../../lib/use-modal-scroll-lock';
import {
  useUpdateSellerMutation,
  useUploadImageMutation,
} from '../api/seller.api';
import {
  updateSellerSchema,
  type UpdateSellerFormValues,
} from '../schemas/seller.schema';
import { getErrorMessage } from '../../../lib/utils';
import {
  X,
  Upload,
  Loader2,
  Store,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import { LocationModal } from '../../../components/ui/location-modal';

interface SellerEditModalProps {
  seller: Seller;
  isOpen: boolean;
  onClose: () => void;
}

export const SellerEditModal: React.FC<SellerEditModalProps> = ({
  seller,
  isOpen,
  onClose,
}) => {
  const [previewImage, setPreviewImage] = useState(seller.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [coords, setCoords] = useState<[number, number]>(
    seller.autoLocation?.coordinates || [77.5946, 12.9716],
  );
  const [isLocationChanged, setIsLocationChanged] = useState(false);

  const [updateSeller, { isLoading: isUpdating }] = useUpdateSellerMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateSellerFormValues>({
    resolver: zodResolver(updateSellerSchema),
    defaultValues: {
      name: seller.name,
      description: seller.description || '',
      phone: String(seller.phone ?? ''),
      formattedAddress: seller.autoLocation?.formattedAddress || '',
    },
  });

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleModalClose = () => {
    reset();
    setSelectedFile(null);
    setPreviewImage(seller.image);
    setCoords(seller.autoLocation?.coordinates || [77.5946, 12.9716]);
    setIsLocationChanged(false);
    onClose();
  };

  const handleLocationConfirm = (locationData: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
  }) => {
    if (locationData.latitude !== null && locationData.longitude !== null) {
      setCoords([locationData.longitude, locationData.latitude]);
      setIsLocationChanged(true);
    }
    const fullAddress =
      locationData.address ||
      [locationData.city, locationData.state, locationData.zipCode]
        .filter(Boolean)
        .join(', ');
    if (fullAddress) {
      setValue('formattedAddress', fullAddress, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    setIsLocationModalOpen(false);
    toast.success('Store location updated from map!');
  };

  const onSubmit = async (data: UpdateSellerFormValues) => {
    // If no data was modified, skip server call
    const currentName = (seller.name || '').trim();
    const newName = data.name.trim();

    const currentDesc = (seller.description || '').trim();
    const newDesc = (data.description || '').trim();

    const currentPhone = String(seller.phone ?? '').trim();
    const newPhone = data.phone.trim();

    const currentAddress = (seller.autoLocation?.formattedAddress || '').trim();
    const newAddress = data.formattedAddress.trim();

    const hasNewImage = selectedFile !== null;
    const hasLocationCoordsChanged = isLocationChanged;

    const isDataUnchanged =
      currentName === newName &&
      currentDesc === newDesc &&
      currentPhone === newPhone &&
      currentAddress === newAddress &&
      !hasNewImage &&
      !hasLocationCoordsChanged;

    if (isDataUnchanged) {
      toast.info('No changes made to update');
      handleModalClose();
      return;
    }

    try {
      let finalImageUrl = seller.image;

      // If a new file was selected, upload to Utils service (Cloudinary)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'foomato/seller');
        const uploadRes = await uploadImage(formData).unwrap();
        finalImageUrl = uploadRes.url;
      }

      await updateSeller({
        name: data.name.trim(),
        description: data.description?.trim(),
        phone: data.phone.trim(),
        image: finalImageUrl,
        autoLocation: {
          type: seller.autoLocation?.type || 'Point',
          coordinates: coords,
          formattedAddress: data.formattedAddress.trim(),
        },
      }).unwrap();

      toast.success('Seller profile updated successfully');
      handleModalClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update seller profile'));
    }
  };

  const isSubmitting = isUploading || isUpdating;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleModalClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg md:max-w-4xl lg:max-w-5xl md:h-150 max-h-[92vh] rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        >
          {/* Top Decorative Gradient Accent */}
          <div className="h-1.5 w-full bg-linear-to-r from-orange-500 via-amber-500 to-red-500 shrink-0" />

          {/* Modal Header */}
          <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Edit Store Details
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Update restaurant brand, contact, and location details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body: 2 Columns on Desktop (Left: Media & Map, Right: Inputs & Actions), Stacked on Mobile */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-y-auto md:overflow-hidden"
          >
            {/* LEFT COLUMN: Media Preview & Coordinates Summary (5 cols on md/lg) */}
            <div className="md:col-span-5 p-4 sm:p-6 flex flex-col justify-between gap-4 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 min-h-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Banner Upload Card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Store Banner & Logo
                    </label>
                    <span className="text-[10px] text-zinc-400">Up to 5MB</span>
                  </div>
                  <div className="relative h-44 sm:h-48 md:h-52 rounded-2xl overflow-hidden border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/40 group shadow-inner">
                    <img
                      src={previewImage}
                      alt="Store preview"
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 backdrop-blur-md">
                        <Upload className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-xs font-bold">
                        {selectedFile ? 'Replace Banner Image' : 'Change Store Banner'}
                      </span>
                      <span className="text-[10px] text-zinc-300">
                        PNG, JPG, WebP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Location Pin & Map Card */}
                <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>Store Coordinates</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Change on Map</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 font-mono bg-zinc-100 dark:bg-zinc-900/60 p-2 rounded-xl">
                    <span>GPS: {coords[1].toFixed(4)}° N, {coords[0].toFixed(4)}° E</span>
                    {isLocationChanged ? (
                      <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wide">Updated</span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">Saved</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Helpful Tip */}
              <p className="text-[11px] text-zinc-400 leading-relaxed hidden md:block">
                💡 Accurate GPS coordinates and high-quality banners help customers find and trust your restaurant faster.
              </p>
            </div>

            {/* RIGHT COLUMN: Form Inputs & Action Buttons (7 cols on md/lg) */}
            <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between min-h-0 bg-white dark:bg-zinc-900 space-y-4">
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Store Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Store / Restaurant Name
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Royal Spice Kitchen"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-500/80 focus:ring-red-500/30 text-red-600 dark:text-red-400'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40 text-zinc-900 dark:text-white'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Description & Cuisines
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Authentic North Indian curries, tandoori grills, and fresh flatbreads..."
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-sm focus:outline-hidden focus:ring-2 transition-all resize-none ${
                        errors.description
                          ? 'border-red-500/80 focus:ring-red-500/30'
                          : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40 text-zinc-900 dark:text-white'
                      }`}
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Contact Phone & Formatted Address in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+91 9876543210"
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-sm focus:outline-hidden focus:ring-2 transition-all ${
                          errors.phone
                            ? 'border-red-500/80 focus:ring-red-500/30 text-red-600 dark:text-red-400'
                            : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40 text-zinc-900 dark:text-white'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Formatted Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register('formattedAddress')}
                        placeholder="Store address..."
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-sm focus:outline-hidden focus:ring-2 transition-all ${
                          errors.formattedAddress
                            ? 'border-red-500/80 focus:ring-red-500/30 text-red-600 dark:text-red-400'
                            : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40 text-zinc-900 dark:text-white'
                        }`}
                      />
                    </div>
                    {errors.formattedAddress && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.formattedAddress.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!isDirty && !selectedFile && !isLocationChanged)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-linear-to-r from-orange-500 via-amber-500 to-red-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {isUploading ? 'Uploading Image...' : 'Saving Changes...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Location Modal for Picking Coordinates & Address via Map */}
      {isLocationModalOpen && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onConfirm={handleLocationConfirm}
          confirmButtonText="Update Store Location"
        />
      )}
    </>,
    document.body
  );
};
