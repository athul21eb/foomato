import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Seller } from '../types/seller.types';
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
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [updateSeller, { isLoading: isUpdating }] = useUpdateSellerMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateSellerFormValues>({
    resolver: zodResolver(updateSellerSchema),
    defaultValues: {
      name: seller.name,
      description: seller.description || '',
      phone: seller.phone,
      formattedAddress: seller.autoLocation?.formattedAddress || '',
    },
  });

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
    onClose();
  };

  const onSubmit = async (data: UpdateSellerFormValues) => {
    try {
      let finalImageUrl = seller.image;

      // If a new file was selected, upload to Utils service (Cloudinary)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
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
          coordinates: seller.autoLocation?.coordinates || [0, 0],
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Edit Store Details
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Update restaurant brand, contact, and location details
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* Image Upload Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Store Banner & Logo
            </label>
            <div className="relative h-44 rounded-2xl overflow-hidden border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 group">
              <img
                src={previewImage}
                alt="Store preview"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75"
              />
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 mb-1 text-orange-400" />
                <span className="text-xs font-semibold">
                  Change Store Banner
                </span>
                <span className="text-[10px] text-zinc-300">
                  PNG, JPG, WebP up to 5MB
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
                    : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40'
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
                    : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40'
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Phone & Address in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40'
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
                  placeholder="Koramangala 4th Block, Bangalore"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-sm focus:outline-hidden focus:ring-2 transition-all ${
                    errors.formattedAddress
                      ? 'border-red-500/80 focus:ring-red-500/30 text-red-600 dark:text-red-400'
                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/40'
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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isDirty && !selectedFile)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isUploading ? 'Uploading Image...' : 'Saving Changes...'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
