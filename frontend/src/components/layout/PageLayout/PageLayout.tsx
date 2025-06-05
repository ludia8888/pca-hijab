import { cn } from '@/utils/cn';

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageLayout = ({
  children,
  header,
  footer,
  className,
  noPadding = false,
}: PageLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {header}
      
      <main 
        className={cn(
          'flex-1',
          !noPadding && 'px-4 py-6 tablet:py-8',
          className
        )}
      >
        {children}
      </main>
      
      {footer}
    </div>
  );
};