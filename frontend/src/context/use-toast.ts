import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (msg: string) => toast(msg),
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg),
  };
};

export { toast };
