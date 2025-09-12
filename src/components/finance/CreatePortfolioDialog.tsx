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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePortfolioDialog: React.FC<CreatePortfolioDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createPortfolio, isCreatingPortfolio } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    createPortfolio({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      is_default: formData.is_default,
    });

    // Close dialog and reset form
    onOpenChange(false);
    setFormData({
      name: '',
      description: '',
      is_default: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
          <DialogDescription>
            Create a new portfolio to organize your investments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name *</Label>
            <Input
              id="name"
              placeholder="My Portfolio"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of this portfolio..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_default: checked as boolean })
              }
            />
            <Label htmlFor="is_default">Set as default portfolio</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingPortfolio}>
              {isCreatingPortfolio ? 'Creating...' : 'Create Portfolio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};