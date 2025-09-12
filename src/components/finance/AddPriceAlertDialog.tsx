import React, { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AddPriceAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPriceAlertDialog: React.FC<AddPriceAlertDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createPriceAlert, isCreatingAlert } = useFinance();
  const [formData, setFormData] = useState({
    symbol: '',
    asset_type: 'stock' as 'stock' | 'crypto' | 'etf' | 'mutual_fund',
    alert_type: 'above' as 'above' | 'below' | 'change_percent',
    target_value: '',
    notification_method: 'in_app' as 'in_app' | 'email' | 'both',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.target_value) {
      return;
    }

    createPriceAlert({
      ...formData,
      target_value: parseFloat(formData.target_value),
      is_active: true,
    });

    // Close dialog and reset form
    onOpenChange(false);
    setFormData({
      symbol: '',
      asset_type: 'stock',
      alert_type: 'above',
      target_value: '',
      notification_method: 'in_app',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Set up a price alert to be notified when a security reaches your target price.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_type">Type</Label>
              <Select
                value={formData.asset_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, asset_type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Alert Type</Label>
            <RadioGroup
              value={formData.alert_type}
              onValueChange={(value) =>
                setFormData({ ...formData, alert_type: value as any })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" />
                <Label htmlFor="above">Price goes above</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" />
                <Label htmlFor="below">Price goes below</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="change_percent" id="change_percent" />
                <Label htmlFor="change_percent">Price changes by %</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value">
              Target {formData.alert_type === 'change_percent' ? 'Percentage' : 'Price'} *
            </Label>
            <Input
              id="target_value"
              type="number"
              step={formData.alert_type === 'change_percent' ? '0.1' : '0.01'}
              placeholder={formData.alert_type === 'change_percent' ? '5.0' : '150.00'}
              value={formData.target_value}
              onChange={(e) =>
                setFormData({ ...formData, target_value: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Notification Method</Label>
            <RadioGroup
              value={formData.notification_method}
              onValueChange={(value) =>
                setFormData({ ...formData, notification_method: value as any })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in_app" id="in_app" />
                <Label htmlFor="in_app">In-app notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both in-app and email</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingAlert}>
              {isCreatingAlert ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};