import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export const Icon = ({ icon: LucideIcon, size = 20, className = "" }: IconProps) => {
  return <LucideIcon size={size} className={className} />;
};
