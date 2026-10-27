import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RiderProfile } from '../types/rider.types';
import { useModalScrollLock } from '../../../lib/use-modal-scroll-lock';
import {
  useUpdateRiderMutation,
  useUploadRiderImageMutation,
} from '../api/rider.api';
import {
  updateRiderSchema,
  type UpdateRiderFormData,
} from '../schemas/rider.schema';
import { LocationModal } from '../../../components/ui/location-modal';
import { getErrorMessage } from '../../../lib/utils';
import {
  X,
  UploadCloud,
  Loader2,
  Bike,
  User,
  Phone,
  CreditCard,
  FileText,
  MapPin,
  LocateFixed,
  CheckCircle2,
  ShieldCheck,
  Lock,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface RiderEditModalProps {
  rider: RiderProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const RiderEditModal: React.FC<RiderEditModalProps> = ({
  rider,
  isOpen,
  onClose,
}) => {
  const isVerified = rider.isVerified;
  const [lng, lat] = rider.location?.coordinates || [0, 0];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(rider.picture || '');
  const [fileError, setFileError] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [updateRider, { isLoading: isUpdating }] = useUpdateRiderMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadRiderImageMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateRiderFormData>({
    resolver: zodResolver(updateRiderSchema),
    defaultValues: {
      riderName: rider.riderName || '',
      phoneNumber: rider.phoneNumber || '',
      aadharNumber: rider.aadharNumber || '',
      drivingLicenseNumber: rider.drivingLicenseNumber || '',
      latitude: lat,
      longitude: lng,
      formattedAddress:
        lat !== 0 && lng !== 0
          ? `Service Zone (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          : '',
    },
  });

  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const formattedAddress = useWatch({ control, name: 'formattedAddress' });

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isVerified) return;
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError('Please select a valid image file (JPG, PNG, WebP)');
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Photo size must be less than 5MB');
        toast.error('Photo size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileError('');
    }
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
      setValue('latitude', locationData.latitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('longitude', locationData.longitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    const fullAddress =
      locationData.address ||
      [locationData.city, locationData.state, locationData.zipCode]
        .filter(Boolean)
        .join(', ');
    if (fullAddress) {
      setValue('formattedAddress', fullAddress, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setIsLocationModalOpen(false);
  };

  const detectBrowserLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGps(false);
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setValue('latitude', newLat, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('longitude', newLng, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(
          'formattedAddress',
          `GPS Coordinates (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`,
          { shouldValidate: true, shouldDirty: true },
        );
        toast.success('Live GPS coordinates acquired successfully!');
      },
      (error) => {
        setIsDetectingGps(false);
        toast.error(`GPS Error: ${error.message}. Please pick location on map.`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleModalClose = () => {
    reset();
    setSelectedFile(null);
    setImagePreview(rider.picture || '');
    setFileError('');
    onClose();
  };

  const onSubmit = async (data: UpdateRiderFormData) => {
    try {
      let finalPictureUrl = rider.picture;

      // If pending verification and a new photo was chosen, upload to Cloudinary (foomato/rider)
      if (!isVerified && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'foomato/rider');
        const uploadRes = await uploadImage(formData).unwrap();
        finalPictureUrl = uploadRes.url;
      }

      if (isVerified) {
        // Verified riders can only update location
        await updateRider({
          latitude: data.latitude,
          longitude: data.longitude,
        }).unwrap();
        toast.success('Service location updated successfully!');
      } else {
        // Pending riders can update everything
        await updateRider({
          riderName: data.riderName?.trim(),
          picture: finalPictureUrl,
          phoneNumber: data.phoneNumber?.trim(),
          aadharNumber: data.aadharNumber?.trim(),
          drivingLicenseNumber: data.drivingLicenseNumber?.trim(),
          latitude: data.latitude,
          longitude: data.longitude,
        }).unwrap();
        toast.success('Courier profile updated successfully!');
      }

      handleModalClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update courier profile'));
    }
  };

  const isSubmitting = isUpdating || isUploading || isDetectingGps;
  const hasChanges = isDirty || !!selectedFile;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={handleModalClose}
      />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Gradient Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500 shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {isVerified ? 'Update Service Location' : 'Edit Courier Profile'}
                </h3>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="w-3 h-3" />
                    Pending Review
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isVerified
                  ? 'Your legal documents are verified. You can modify your operating zone.'
                  : 'Review or correct your details while KYC verification is pending'}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        {isVerified ? (
          <div className="px-5 sm:px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <Lock className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Verified Profile:</strong> Name, phone, photo, Aadhaar, and License are locked for security. You can update your service location below.
            </span>
          </div>
        ) : (
          <div className="px-5 sm:px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Pending Review Stage:</strong> You can edit any details or upload a new photo before compliance approves your account.
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6"
        >
          {/* PHOTO UPLOAD CARD (Like Add-Rider Form) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Box */}
              <div className="relative group shrink-0">
                <div
                  className={`relative w-28 h-28 rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden ${
                    isVerified
                      ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-85'
                      : imagePreview
                      ? 'border-dashed border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer'
                      : 'border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500/50 cursor-pointer'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={imagePreview}
                        alt="Rider Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {!isVerified && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-white text-[11px] font-semibold">
                          <UploadCloud className="w-5 h-5 mb-0.5" />
                          <span>Change</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <UploadCloud className="w-6 h-6 text-orange-500 mb-1" />
                      <span className="text-[10px] text-zinc-500">Upload Photo</span>
                    </div>
                  )}

                  {!isVerified && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  )}
                </div>

                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-900 text-emerald-400 border border-white dark:border-zinc-800 shadow-xs">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Text Description */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Profile Photo
                  </h4>
                  {isVerified && (
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      (Locked)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isVerified
                    ? 'Verified courier photo cannot be modified. Customers and dispatchers see this badge.'
                    : 'Clear front-facing selfie. Click the image to choose a new photo from your device.'}
                </p>
                {fileError && (
                  <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fileError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* IDENTITY & KYC INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Courier Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  Full Courier Name {!isVerified && <span className="text-rose-500">*</span>}
                </span>
                {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  {...register('riderName')}
                  type="text"
                  disabled={isVerified || isSubmitting}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                    isVerified
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                      : errors.riderName
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                      : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                  }`}
                />
              </div>
              {errors.riderName && !isVerified && (
                <p className="text-xs font-medium text-rose-500 mt-1">
                  {errors.riderName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  Phone Number {!isVerified && <span className="text-rose-500">*</span>}
                </span>
                {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  +91
                </div>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  maxLength={10}
                  disabled={isVerified || isSubmitting}
                  placeholder="9876543210"
                  className={`w-full pl-14 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                    isVerified
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                      : errors.phoneNumber
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                      : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                  }`}
                />
              </div>
              {errors.phoneNumber && !isVerified && (
                <p className="text-xs font-medium text-rose-500 mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Driving License */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  Driving License {!isVerified && <span className="text-rose-500">*</span>}
                </span>
                {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  {...register('drivingLicenseNumber')}
                  type="text"
                  disabled={isVerified || isSubmitting}
                  placeholder="DL-0420110012345"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                    isVerified
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                      : errors.drivingLicenseNumber
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                      : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                  }`}
                />
              </div>
              {errors.drivingLicenseNumber && !isVerified && (
                <p className="text-xs font-medium text-rose-500 mt-1">
                  {errors.drivingLicenseNumber.message}
                </p>
              )}
            </div>

            {/* Aadhaar Number */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  Aadhaar Card (12 Digits) {!isVerified && <span className="text-rose-500">*</span>}
                </span>
                {isVerified && <Lock className="w-3 h-3 text-zinc-400" />}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  {...register('aadharNumber')}
                  type="text"
                  maxLength={14}
                  disabled={isVerified || isSubmitting}
                  placeholder="1234 5678 9012"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                    isVerified
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                      : errors.aadharNumber
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                      : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white'
                  }`}
                />
              </div>
              {errors.aadharNumber && !isVerified && (
                <p className="text-xs font-medium text-rose-500 mt-1">
                  {errors.aadharNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* OPERATING BASE LOCATION (Active in Both Pending & Verified) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Operating Base Location</span>
                <span className="text-emerald-500 font-semibold text-[10px] ml-1">
                  (Editable Anytime)
                </span>
              </label>

              <button
                type="button"
                onClick={detectBrowserLocation}
                disabled={isDetectingGps || isSubmitting}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Detect Live GPS</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={
                    formattedAddress ||
                    (latitude && longitude
                      ? `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                      : '')
                  }
                  placeholder="Click 'Pick on Map' or 'Detect Live GPS'"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
              >
                Pick on Map
              </button>
            </div>

            {latitude && longitude ? (
              <p className="text-[11px] text-zinc-500 font-mono">
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            ) : null}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-end gap-3">
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
              disabled={isSubmitting || !hasChanges}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-linear-to-r from-orange-500 via-amber-500 to-red-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isUploading
                      ? 'Uploading Photo...'
                      : isUpdating
                      ? 'Saving Profile...'
                      : 'Detecting Location...'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isVerified ? 'Update Location' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Map Location Modal */}
      {isLocationModalOpen && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onConfirm={handleLocationConfirm}
          confirmButtonText="Set Operating Location"
        />
      )}
    </div>,
    document.body,
  );
};
