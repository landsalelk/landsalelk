interface ErrorAlertProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert = ({ title, message, onRetry }: ErrorAlertProps) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">{title}</strong>
    <span className="block sm:inline">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Retry
      </button>
    )}
  </div>
);
