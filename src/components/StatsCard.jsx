import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  linkTo, 
  showArrowOnHover = false, 
  trend, 
  subtitle,
  color = 'default' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10';
      case 'danger':
        return 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10';
      default:
        return 'hover:bg-muted/50';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card
      className={`${linkTo ? 'cursor-pointer' : ''} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden ${getColorClasses()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-2 rounded-lg bg-background/50 border border-border/50 group-hover:border-primary/30 transition-all duration-300 ${getIconColor()}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          {showArrowOnHover && isHovered && (
            <ArrowRight className="h-4 w-4 text-primary animate-in slide-in-from-left-1 duration-200" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-3xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className={`h-3 w-3 ${trend.type === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={trend.type === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {trend.value}
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {linkTo && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Card>
  );
};
