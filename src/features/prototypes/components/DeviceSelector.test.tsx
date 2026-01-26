import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { DeviceSelector, DEVICE_PRESETS } from './DeviceSelector';
import userEvent from '@testing-library/user-event';

describe('DeviceSelector', () => {
  const mockOnDeviceChange = vi.fn();

  describe('Device Buttons (AC 2)', () => {
    it('should render all device options (desktop, tablet, mobile)', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]}
          onDeviceChange={mockOnDeviceChange}
        />
      );

      expect(screen.getByRole('button', { name: /desktop/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tablet/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mobile/i })).toBeInTheDocument();
    });

    it('should show icons for each device', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]}
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      // Each button should have an SVG icon (from lucide-react)
      buttons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Active Device Indicator (AC 2, 3)', () => {
    it('should highlight selected device', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]} // Desktop
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const desktopButton = screen.getByRole('button', { name: /desktop/i });
      expect(desktopButton).toHaveClass('btn-primary');
    });

    it('should not highlight non-selected devices', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]} // Desktop
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const tabletButton = screen.getByRole('button', { name: /tablet/i });
      const mobileButton = screen.getByRole('button', { name: /mobile/i });
      
      expect(tabletButton).not.toHaveClass('btn-primary');
      expect(mobileButton).not.toHaveClass('btn-primary');
    });

    it('should set aria-pressed attribute correctly', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]} // Desktop
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const desktopButton = screen.getByRole('button', { name: /desktop/i });
      expect(desktopButton).toHaveAttribute('aria-pressed', 'true');

      const tabletButton = screen.getByRole('button', { name: /tablet/i });
      expect(tabletButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Device Selection (AC 2)', () => {
    it('should call onDeviceChange when device is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]} // Desktop
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const tabletButton = screen.getByRole('button', { name: /tablet/i });
      await user.click(tabletButton);

      expect(mockOnDeviceChange).toHaveBeenCalledWith(DEVICE_PRESETS[1]); // Tablet
    });

    it('should call onDeviceChange with correct device preset', async () => {
      const user = userEvent.setup();
      
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]}
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const mobileButton = screen.getByRole('button', { name: /mobile/i });
      await user.click(mobileButton);

      expect(mockOnDeviceChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mobile',
          width: 375,
          height: 667,
        })
      );
    });
  });

  describe('Touch-Friendly Design (AC 8)', () => {
    it('should have minimum 44px touch target size', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]}
          onDeviceChange={mockOnDeviceChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels', () => {
      render(
        <DeviceSelector
          selectedDevice={DEVICE_PRESETS[0]}
          onDeviceChange={mockOnDeviceChange}
        />
      );

      expect(screen.getByLabelText(/view in desktop mode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/view in tablet mode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/view in mobile mode/i)).toBeInTheDocument();
    });
  });

  describe('DEVICE_PRESETS constant', () => {
    it('should export device presets with correct dimensions', () => {
      expect(DEVICE_PRESETS).toHaveLength(3);
      
      expect(DEVICE_PRESETS[0]).toEqual({
        id: 'desktop',
        label: 'Desktop',
        width: 1920,
        height: 1080,
      });

      expect(DEVICE_PRESETS[1]).toEqual({
        id: 'tablet',
        label: 'Tablet',
        width: 768,
        height: 1024,
      });

      expect(DEVICE_PRESETS[2]).toEqual({
        id: 'mobile',
        label: 'Mobile',
        width: 375,
        height: 667,
      });
    });
  });
});
