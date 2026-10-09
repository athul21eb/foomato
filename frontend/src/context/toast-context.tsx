import { Toaster } from 'sonner';
import { useTheme } from "./theme-context";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={theme as "dark" | "light"}
        position="bottom-right"
        richColors
        closeButton
      />
    </>
  );
};

