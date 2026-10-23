import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  CheckCircle2,
  Plus,
  Phone,
  FileText,
} from 'lucide-react';
import type { CustomerAddress } from '../../customer/types/address.types';
import {
  modalOverlayVariants,
  modalContentVariants,
  staggerContainerVariants,
  staggerItemVariants,
  springSnappy,
} from '../../../lib/motion';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: CustomerAddress) => void;
}

export const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>Select Delivery Address</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Choose where you want your food delivered
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={springSnappy}
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Saved Addresses List */}
            <motion.div
              variants={staggerContainerVariants}
              initial="initial"
              animate="animate"
              className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar"
            >
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address.id;

                return (
                  <motion.div
                    key={address.id}
                    variants={staggerItemVariants}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      onSelectAddress(address);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-colors cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-orange-500/40 bg-zinc-50/50 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                            Delivery Address
                          </span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Default
                            </span>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      <p className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                        {address.formattedAddress}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91 {address.mobile}</span>
                      </div>

                      {address.instructions && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 italic">
                          <FileText className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">&quot;{address.instructions}&quot;</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Footer: Add new address button */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/address', { state: { returnTo: '/checkout' } });
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Manage or Add New Address</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
