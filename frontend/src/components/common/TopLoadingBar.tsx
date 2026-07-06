import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function TopLoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-100 z-50">
      <div className="h-full bg-blue-600 animate-pulse w-full" />
    </div>
  );
}