
import type { PaymentStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, AlertTriangle, type Icon } from 'lucide-react';

interface CustomerStatusBadgeProps {
  status: PaymentStatus;
}

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  const statusConfig: Record<PaymentStatus, { bgColor: string, textColor: string, icon: Icon, label: string }> = {
    'Pagado': { bgColor: 'bg-green-500', textColor: 'text-white', icon: CheckCircle2, label: 'Pagado' },
    'Pendiente': { bgColor: 'bg-orange-500', textColor: 'text-white', icon: AlertCircle, label: 'Pendiente' },
    'Vencido': { bgColor: 'bg-red-700', textColor: 'text-white', icon: XCircle, label: 'Vencido' },
    'Próximo a vencer': { bgColor: 'bg-yellow-500', textColor: 'text-black', icon: AlertTriangle, label: 'Próximo a vencer' },
  };

  const { bgColor, textColor, icon: IconComponent, label } = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 border-transparent text-xs font-medium", 
        bgColor, 
        textColor
      )} 
      title={label}
    >
      <IconComponent className="h-4 w-4" />
      <span>{label}</span>
    </Badge>
  );
}
