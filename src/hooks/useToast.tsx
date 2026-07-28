import {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {ToastType} from '../components/common/AppToast';
import {AppToast} from '../components/common/AppToast';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

const DEFAULT_STATE: ToastState = {
  visible: false,
  message: '',
  type: 'info',
  title: undefined,
  duration: 3500,
};

interface ToastContextValue {
  toast: ToastState;
  showToast: (
    message: string,
    type?: ToastType,
    options?: {title?: string; duration?: number},
  ) => void;
  hideToast: () => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [toast, setToast] = useState<ToastState>(DEFAULT_STATE);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: {title?: string; duration?: number},
    ) => {
      setToast({
        visible: true,
        message,
        type,
        title: options?.title,
        duration: options?.duration ?? 3500,
      });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({...prev, visible: false}));
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => showToast(message, 'success', {title}),
    [showToast],
  );

  const showError = useCallback(
    (message: string, title?: string) => showToast(message, 'error', {title}),
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', {title}),
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => showToast(message, 'info', {title}),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        toast,
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}>
      {children}
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        title={toast.title}
        duration={toast.duration}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
