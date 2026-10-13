import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateSellerMutation,
  useGetMySellerQuery,
  useUploadImageMutation,
} from '../../features/seller/api/seller.api';
import {
  Store,
  Upload,
  Loader2,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ArrowLeft,
  Navigation,
  Compass,
  CheckCircle2,
  Star,
  Clock,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { LocationModal } from '../../components/ui/location-modal';

interface FormErrors {
  file?: string;
  name?: string;
  description?: string;
  phone?: string;
  formattedAddress?: string;
}

export const AddSellerPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: existingSeller, isLoading: isCheckingSeller } =
    useGetMySellerQuery();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(12.9716); // Default Bangalore
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [createSeller, { isLoading: isCreating }] = useCreateSellerMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  // If seller profile is already created, redirect to seller dashboard
  useEffect(() => {
    if (!isCheckingSeller && existingSeller) {
      navigate('/seller', { replace: true });
    }
  }, [existingSeller, isCheckingSeller, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: 'Image size must be less than 5MB',
        }));
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, file: undefined }));
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
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
    }
    const fullAddress =
      locationData.address ||
      [locationData.city, locationData.state, locationData.zipCode]
        .filter(Boolean)
        .join(', ');
    if (fullAddress) {
      setFormattedAddress(fullAddress);
      setErrors((prev) => ({ ...prev, formattedAddress: undefined }));
    }
    toast.success('Store location selected via map!');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please upload a store banner or logo photo';
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Restaurant name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Restaurant name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Restaurant name cannot exceed 100 characters';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = 'Store description & specialities are required';
    } else if (trimmedDesc.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    } else if (trimmedDesc.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Contact phone number is required';
    } else {
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^[0-9+\-\s()]+$/.test(trimmedPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    const trimmedAddress = formattedAddress.trim();
    if (!trimmedAddress) {
      newErrors.formattedAddress =
        'Store address is required (use location picker or enter address)';
    } else if (trimmedAddress.length < 3) {
      newErrors.formattedAddress = 'Store address must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting');
      return;
    }

    try {
      // 1. Upload image to Utils service (port 5002)
      const formData = new FormData();
      formData.append('file', selectedFile!);
      const uploadResult = await uploadImage(formData).unwrap();

      // 2. Create Seller profile in Seller service (port 5001)
      await createSeller({
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim(),
        image: uploadResult.url,
        autoLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          formattedAddress: formattedAddress.trim(),
        },
        isOpen: true,
      }).unwrap();

      toast.success('Congratulations! Your store is now live on Foomato.');
      navigate('/seller', { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to create seller profile'));
    }
  };

  const isSubmitting = isUploading || isCreating;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <button
            onClick={() => navigate('/seller')}
            type="button"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-orange-500 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seller Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Register Your Restaurant & Kitchen
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Sparkles className="w-3 h-3" />
              Onboarding
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Fill in your store details to join the Foomato network and receive live orders.
          </p>
        </div>
      </div>

      {/* Main Responsive Form Layout: Full horizontal allocation on md+ */}
      <form noValidate onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (md:col-span-5 lg:col-span-5): Image upload & Real-time Live Preview */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-6">
            {/* Banner Upload Box */}
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-orange-500" />
                  Store Banner & Photo <span className="text-red-500">*</span>
                </label>
              </div>

              <div
                className={`relative h-56 sm:h-64 rounded-2xl border-2 border-dashed overflow-hidden group transition-all ${
                  errors.file
                    ? 'border-red-500 dark:border-red-500 bg-red-500/5'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30'
                }`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Store Preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-8 h-8 mb-1.5 text-orange-400 animate-bounce" />
                      <span className="text-xs font-bold">Replace Store Photo</span>
                      <span className="text-[10px] text-zinc-300 mt-0.5">JPG, PNG, WebP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  <label className="h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-orange-500/5 transition-colors">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md ${
                        errors.file
                          ? 'bg-red-500/10 text-red-500 shadow-red-500/10'
                          : 'bg-orange-500/10 text-orange-500 shadow-orange-500/10'
                      }`}
                    >
                      <Upload className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Upload Store Banner Photo
                    </span>
                    <span className="text-xs text-zinc-400 mt-1 max-w-xs">
                      PNG, JPG, or WebP up to 5MB. Showcase your kitchen or storefront.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Validation Error Message for File */}
              {errors.file && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-2 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.file}</span>
                </p>
              )}
            </div>

            {/* Live Customer-Facing Card Preview */}
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  Live Customer Preview
                </span>
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ready to Publish
                </span>
              </div>

              {/* Simulated Restaurant Card */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 overflow-hidden shadow-sm">
                <div className="relative h-28 bg-gradient-to-r from-orange-500/20 to-amber-500/20 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Store className="w-10 h-10 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Open Now
                  </span>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>5.0</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white line-clamp-1">
                    {name.trim() || 'Your Restaurant Name'}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {description.trim() || 'Your menu highlights and specialities will appear here for diners.'}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/80">
                    <span className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      {formattedAddress.trim() || 'Store Location'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 font-medium text-emerald-500">
                      <Clock className="w-3 h-3" />
                      20-30m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (md:col-span-7 lg:col-span-7): Form fields & LocationModal trigger */}
          <div className="md:col-span-7 lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-zinc-500/10 pb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                  Restaurant Profile & Geolocation
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Accurate coordinates ensure riders find your pickup point immediately.
                </p>
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Restaurant / Kitchen Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="e.g. Biryani Blues & Kebabs"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all font-medium ${
                      errors.name
                        ? 'border-red-500 bg-red-500/5 focus:ring-red-500/40 text-red-900 dark:text-red-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 focus:ring-orange-500/40'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Description & Specialities <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {description.length}/500
                  </span>
                </div>
                <div className="relative">
                  <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) {
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }));
                      }
                    }}
                    rows={3}
                    placeholder="Fresh wood-fired sourdough pizzas, artisanal pasta, and homemade desserts..."
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all resize-none font-medium ${
                      errors.description
                        ? 'border-red-500 bg-red-500/5 focus:ring-red-500/40 text-red-900 dark:text-red-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 focus:ring-orange-500/40'
                    }`}
                  />
                </div>
                {errors.description && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Contact Phone (10 digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all font-medium ${
                      errors.phone
                        ? 'border-red-500 bg-red-500/5 focus:ring-red-500/40 text-red-900 dark:text-red-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 focus:ring-orange-500/40'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* LOCATION PICKER SECTION (Uses LocationModal) */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition-all ${
                  errors.formattedAddress
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      Store Location & GPS Coordinates <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Pinpoint your store using browser GPS or city search.
                    </p>
                  </div>

                  {/* Button to open LocationModal */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Choose Location on Map</span>
                  </button>
                </div>

                {/* Formatted Address Text Field */}
                <div>
                  <input
                    type="text"
                    value={formattedAddress}
                    onChange={(e) => {
                      setFormattedAddress(e.target.value);
                      if (errors.formattedAddress) {
                        setErrors((prev) => ({
                          ...prev,
                          formattedAddress: undefined,
                        }));
                      }
                    }}
                    placeholder="Click 'Choose Location on Map' or type your street address..."
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all font-medium ${
                      errors.formattedAddress
                        ? 'border-red-500 bg-red-500/5 focus:ring-red-500/40 text-red-900 dark:text-red-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 focus:ring-orange-500/40'
                    }`}
                  />
                  {errors.formattedAddress && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.formattedAddress}</span>
                    </p>
                  )}
                </div>

                {/* Coordinates Display Chips */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">
                    <Navigation className="w-3 h-3 text-orange-500" />
                    <span>Lat: {latitude.toFixed(4)}° N</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">
                    <Navigation className="w-3 h-3 text-amber-500" />
                    <span>Lon: {longitude.toFixed(4)}° E</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    GeoJSON Point Active
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-99 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {isUploading
                          ? 'Uploading Store Banner...'
                          : 'Registering Your Store on Foomato...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5" />
                      <span>Launch My Foomato Store</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Location Modal for Selecting Coordinates & Address */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        confirmButtonText="Set Store Location"
        onConfirm={handleLocationConfirm}
      />
    </div>
  );
};

export default AddSellerPage;
