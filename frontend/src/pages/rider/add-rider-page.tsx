import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UploadCloud,
  MapPin,
  LocateFixed,
  Phone,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetMyRiderQuery,
  useCreateRiderMutation,
  useUploadRiderImageMutation,
} from '../../features/rider/api/rider.api';
import {
  createRiderSchema,
  type CreateRiderFormData,
} from '../../features/rider/schemas/rider.schema';
import { LocationModal } from '../../components/ui/location-modal';
import { getErrorMessage } from '../../lib/utils';
import { FadeInUp, ScaleIn, SlideInBottom } from '../../lib/animations';

export const AddRiderPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: existingRider, isLoading: isCheckingRider } = useGetMyRiderQuery();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [createRider, { isLoading: isCreating }] = useCreateRiderMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadRiderImageMutation();

  // Redirect if rider profile already exists
  useEffect(() => {
    if (!isCheckingRider && existingRider) {
      navigate('/rider', { replace: true });
    }
  }, [existingRider, isCheckingRider, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateRiderFormData>({
    resolver: zodResolver(createRiderSchema),
    defaultValues: {
      phoneNumber: '',
      aadharNumber: '',
      drivingLicenseNumber: '',
      formattedAddress: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const formattedAddress = useWatch({ control, name: 'formattedAddress' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setValue('latitude', locationData.latitude, { shouldValidate: true });
      setValue('longitude', locationData.longitude, { shouldValidate: true });
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
        setValue('latitude', position.coords.latitude, { shouldValidate: true });
        setValue('longitude', position.coords.longitude, { shouldValidate: true });
        setValue(
          'formattedAddress',
          `GPS Coordinates (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          { shouldValidate: true },
        );
        toast.success('Current location detected successfully!');
      },
      (error) => {
        setIsDetectingGps(false);
        toast.error(`GPS Error: ${error.message}. Please select location on map.`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmit = async (data: CreateRiderFormData) => {
    if (!selectedFile) {
      setFileError('Please upload your photo to complete onboarding');
      toast.error('Profile photo is required');
      return;
    }

    try {
      // 1. Upload photo to Utils service
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'foomato/rider');
      const uploadResult = await uploadImage(formData).unwrap();

      // 2. Register Rider Profile
      await createRider({
        riderName: data.riderName.trim(),
        picture: uploadResult.url,
        phoneNumber: data.phoneNumber.trim(),
        aadharNumber: data.aadharNumber.trim(),
        drivingLicenseNumber: data.drivingLicenseNumber.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        formattedAddress: data.formattedAddress?.trim() || undefined,
      }).unwrap();

      toast.success('Rider profile created successfully! Welcome to the fleet.');
      navigate('/rider', { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to create rider profile'));
    }
  };

  const isSubmitting = isUploading || isCreating;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Header & Breadcrumb */}
      <SlideInBottom className="mb-8">
        <button
          onClick={() => navigate('/rider')}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-orange-500 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rider Portal</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Create Rider Profile
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Join the Foomato delivery fleet. Provide your details and documents for verification.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>Fast-track Onboarding</span>
          </div>
        </div>
      </SlideInBottom>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Photo Upload & Instructions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <FadeInUp delay={0.05}>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                  Profile Photo <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  Upload a clear, front-facing selfie or portrait. This will be shown to customers when you deliver orders.
                </p>

                <div className="relative group">
                  <div
                    className={`relative w-full aspect-square max-w-70 mx-auto rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center overflow-hidden ${
                      imagePreview
                        ? 'border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40'
                        : fileError
                        ? 'border-rose-500/50 bg-rose-50/20 dark:bg-rose-950/10'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-500/50 bg-zinc-50/50 dark:bg-zinc-800/20'
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={imagePreview}
                          alt="Rider Preview"
                          className="w-full h-full object-cover rounded-xl shadow-inner"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-semibold">
                          Click to change
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          Click or drag photo here
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          JPG, PNG, or WebP up to 5MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {fileError && (
                  <p className="text-xs font-medium text-rose-500 mt-3 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>
            </FadeInUp>

            {/* Quick Checklist Card */}
            <FadeInUp delay={0.1}>
              <div className="bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-3">
                <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Rider Verification Checklist
                </h4>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Valid 12-digit Indian Aadhaar card for KYC verification.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Permanent Driving License for 2-wheeler or light vehicle.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Active smartphone with GPS geolocation enabled.</span>
                </div>
              </div>
            </FadeInUp>
          </div>

          {/* RIGHT COLUMN: Form Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <FadeInUp delay={0.08}>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  Personal & Document Details
                </h3>

                {/* Rider Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      {...register('riderName')}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. John Doe"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.riderName
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.riderName && (
                    <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.riderName.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 text-sm font-semibold">
                      <Phone className="w-4 h-4 mr-1 text-zinc-400" />
                      +91
                    </div>
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      maxLength={10}
                      disabled={isSubmitting}
                      placeholder="9876543210"
                      className={`w-full pl-16 pr-4 py-3 rounded-xl border text-sm font-medium bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.phoneNumber
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Aadhaar Card Number (12 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      {...register('aadharNumber')}
                      type="text"
                      maxLength={14}
                      disabled={isSubmitting}
                      placeholder="1234 5678 9012"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-mono bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.aadharNumber
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.aadharNumber && (
                    <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.aadharNumber.message}
                    </p>
                  )}
                </div>

                {/* Driving License Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Driving License Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      {...register('drivingLicenseNumber')}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="DL-1420110012345"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-mono uppercase bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.drivingLicenseNumber
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.drivingLicenseNumber && (
                    <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.drivingLicenseNumber.message}
                    </p>
                  )}
                </div>

                {/* Operating Base Location */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Operating Base Location <span className="text-rose-500">*</span>
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
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 ${
                          errors.latitude || errors.longitude
                            ? 'border-rose-500'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      Pick on Map
                    </button>
                  </div>

                  {(errors.latitude || errors.longitude) && (
                    <p className="text-xs font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please select your service location on the map or via GPS
                    </p>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/rider')}
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <ScaleIn>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {isUploading ? 'Uploading Photo...' : 'Registering Profile...'}
                          </span>
                        </>
                      ) : (
                        <span>Complete Registration</span>
                      )}
                    </button>
                  </ScaleIn>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </form>

      {/* Map Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        confirmButtonText="Set Rider Base Location"
        onConfirm={handleLocationConfirm}
      />
    </div>
  );
};

export default AddRiderPage;
