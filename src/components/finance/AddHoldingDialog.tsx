import React, { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddHoldingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId?: string;
}

export const AddHoldingDialog: React.FC<AddHoldingDialogProps> = ({
  open,
  onOpenChange,
  portfolioId,
}) => {
  const { addHolding, portfolios, isAddingHolding } = useFinance();
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    asset_type: "stock" as "stock" | "crypto" | "etf" | "mutual_fund",
    quantity: "",
    avg_cost_per_unit: "",
    purchase_date: "",
    notes: "",
    portfolio_id: portfolioId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.portfolio_id ||
      !formData.symbol ||
      !formData.quantity ||
      !formData.avg_cost_per_unit
    ) {
      return;
    }

    addHolding({
      ...formData,
      quantity: parseFloat(formData.quantity),
      avg_cost_per_unit: parseFloat(formData.avg_cost_per_unit),
      purchase_date: formData.purchase_date || undefined,
    });

    // Close dialog and reset form
    onOpenChange(false);
    setFormData({
      symbol: "",
      name: "",
      asset_type: "stock",
      quantity: "",
      avg_cost_per_unit: "",
      purchase_date: "",
      notes: "",
      portfolio_id: portfolioId || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
          <DialogDescription>
            Add a new investment holding to your portfolio.
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
                  setFormData({
                    ...formData,
                    symbol: e.target.value.toUpperCase(),
                  })
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

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Apple Inc."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio *</Label>
            <Select
              value={formData.portfolio_id}
              onValueChange={(value) =>
                setFormData({ ...formData, portfolio_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg_cost">Avg Cost *</Label>
              <Input
                id="avg_cost"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={formData.avg_cost_per_unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    avg_cost_per_unit: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) =>
                setFormData({ ...formData, purchase_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingHolding}>
              {isAddingHolding ? "Adding..." : "Add Holding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
