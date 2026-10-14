import { Toaster } from 'sonner';
import { useTheme } from "./use-theme";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={theme as "dark" | "light"}
        position="bottom-left"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontSize: '12px',
            padding: '7px 24px 7px 11px',
            minHeight: '34px',
            maxWidth: '220px',
            borderRadius: '10px',
          },
        }}
      />
    </>
  );
};

