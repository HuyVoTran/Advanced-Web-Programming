import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, XCircle, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface ErrorStateProps {
  type?: 'general' | 'network' | 'notfound' | 'server';
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'general',
  title,
  message,
  onRetry,
  showRetry = true,
}) => {
  const errorConfig = {
    general: {
      icon: AlertTriangle,
      defaultTitle: 'Đã có lỗi xảy ra',
      defaultMessage: 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.',
    },
    network: {
      icon: WifiOff,
      defaultTitle: 'Không có kết nối mạng',
      defaultMessage: 'Vui lòng kiểm tra kết nối internet của bạn và thử lại.',
    },
    notfound: {
      icon: XCircle,
      defaultTitle: 'Không tìm thấy',
      defaultMessage: 'Nội dung bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    },
    server: {
      icon: ServerCrash,
      defaultTitle: 'Lỗi máy chủ',
      defaultMessage: 'Hệ thống đang gặp sự cố. Chúng tôi đang khắc phục, vui lòng thử lại sau.',
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6 p-6 bg-red-50 rounded-full"
      >
        <Icon className="w-12 h-12 text-red-500" strokeWidth={1.5} />
      </motion.div>

      <h3 className="text-2xl font-light tracking-wide mb-2">
        {displayTitle}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">
        {displayMessage}
      </p>

      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          Thử lại
        </Button>
      )}
    </motion.div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <ErrorState 
            type="general"
            onRetry={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
