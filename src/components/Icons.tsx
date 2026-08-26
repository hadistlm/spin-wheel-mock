import React from 'react';
import {
  Coffee,
  Gift,
  Percent,
  Ticket,
  Sparkles,
  Award,
  Zap,
  Frown,
  Home,
  Smartphone,
  ShoppingBag,
  DollarSign,
  LucideProps,
} from 'lucide-react';

interface SegmentIconProps extends LucideProps {
  name: string;
}

export const SegmentIcon: React.FC<SegmentIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'coffee':
      return <Coffee {...props} />;
    case 'gift':
      return <Gift {...props} />;
    case 'percent':
      return <Percent {...props} />;
    case 'ticket':
      return <Ticket {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'award':
      return <Award {...props} />;
    case 'zap':
      return <Zap {...props} />;
    case 'frown':
      return <Frown {...props} />;
    case 'home':
      return <Home {...props} />;
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'shopping-bag':
      return <ShoppingBag {...props} />;
    case 'dollar-sign':
      return <DollarSign {...props} />;
    default:
      return <Sparkles {...props} />;
  }
};
