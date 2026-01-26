import { Monitor, Tablet, Smartphone } from 'lucide-react';

export interface DevicePreset {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  width: number;
  height: number;
}

// Device viewport presets following UX Design Specification - AC 2, Task 5
export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    width: 1920,
    height: 1080,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    height: 1024,
  },
  {
    id: 'mobile',
    label: 'Mobile',
    width: 375,
    height: 667,
  },
];

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

interface DeviceSelectorProps {
  selectedDevice: DevicePreset;
  onDeviceChange: (device: DevicePreset) => void;
  className?: string;
}

export function DeviceSelector({ 
  selectedDevice, 
  onDeviceChange, 
  className = '' 
}: DeviceSelectorProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {DEVICE_PRESETS.map((device) => {
        const Icon = DEVICE_ICONS[device.id];
        const isSelected = selectedDevice.id === device.id;
        
        return (
          <button
            key={device.id}
            onClick={() => onDeviceChange(device)}
            className={`
              btn btn-sm gap-2 min-h-[44px] min-w-[44px]
              ${isSelected ? 'btn-primary' : 'btn-ghost'}
            `}
            aria-label={`View in ${device.label} mode`}
            aria-pressed={isSelected}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{device.label}</span>
          </button>
        );
      })}
    </div>
  );
}
