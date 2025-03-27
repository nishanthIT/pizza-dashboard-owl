
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboItemSelector } from "@/components/combos/ComboItemSelector";

type PizzaSize = 'small' | 'medium' | 'large';

type ComboItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: PizzaSize;
};

type Combo = {
  id: string;
  name: string;
  description: string;
  image: string;
  items: ComboItem[];
  discount: number;
  totalPrice: number;
  finalPrice: number;
};

const Combos = () => {
  const { toast } = useToast();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCombo, setNewCombo] = useState<{
    name: string;
    description: string;
    image: File | null;
    items: ComboItem[];
    discount: number;
  }>({
    name: "",
    description: "",
    image: null,
    items: [],
    discount: 0,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCombo((prev) => ({ ...prev, image: file }));
    }
  };

  const calculateTotalPrice = (items: ComboItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleAddCombo = () => {
    if (!newCombo.name || !newCombo.image || newCombo.items.length === 0 || newCombo.discount < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: name, image, at least one item, and valid discount",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = calculateTotalPrice(newCombo.items);
    const finalPrice = totalPrice - (totalPrice * newCombo.discount) / 100;

    const combo: Combo = {
      id: crypto.randomUUID(),
      name: newCombo.name,
      description: newCombo.description,
      image: URL.createObjectURL(newCombo.image),
      items: newCombo.items,
      discount: newCombo.discount,
      totalPrice,
      finalPrice,
    };

    setCombos((prev) => [...prev, combo]);
    setNewCombo({ 
      name: "", 
      description: "", 
      image: null, 
      items: [], 
      discount: 0 
    });
    setIsDialogOpen(false);
    toast({ title: "Success", description: "Combo created successfully" });
  };

  const handleDeleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((combo) => combo.id !== id));
    toast({ title: "Success", description: "Combo deleted successfully" });
  };

  const handleAddItem = (item: Omit<ComboItem, "id" | "size">, size?: PizzaSize) => {
    const newItem = { 
      ...item, 
      id: crypto.randomUUID(),
      size
    };
    
    setNewCombo((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSizeChange = (id: string, size: PizzaSize) => {
    setNewCombo((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, size } : item
      ),
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Combos & Offers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Combo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Combo</DialogTitle>
              <DialogDescription>
                Create a new combo by selecting items and setting a discount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Combo Name</Label>
                <Input
                  id="name"
                  value={newCombo.name}
                  onChange={(e) =>
                    setNewCombo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Combo Description</Label>
                <Textarea
                  id="description"
                  placeholder="Example: Two large same pizzas with drinks"
                  value={newCombo.description}
                  onChange={(e) =>
                    setNewCombo((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="image">Combo Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newCombo.discount}
                  onChange={(e) =>
                    setNewCombo((prev) => ({
                      ...prev,
                      discount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label>Add Items to Combo</Label>
                <ComboItemSelector 
                  onAddItem={(item) => handleAddItem(item)} 
                  showSizeSelector={true}
                  onAddItemWithSize={(item, size) => handleAddItem(item, size)}
                />
                <div className="space-y-2">
                  {newCombo.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.size && (
                          <span className="text-sm text-gray-500">
                            Size: {item.size.charAt(0).toUpperCase() + item.size.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Qty: {item.quantity}</span>
                        {item.name.toLowerCase().includes('pizza') && (
                          <Select 
                            value={item.size || 'medium'} 
                            onValueChange={(value) => handleSizeChange(item.id, value as PizzaSize)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCombo} className="w-full">
                Create Combo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <Card key={combo.id}>
            <CardHeader>
              <img
                src={combo.image}
                alt={combo.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <CardTitle>{combo.name}</CardTitle>
              <CardDescription>
                {combo.description && (
                  <p className="mb-2">{combo.description}</p>
                )}
                {combo.discount}% off - Final Price: ${combo.finalPrice.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Items:</p>
                {combo.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} {item.size && `(${item.size})`} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Before Discount:</span>
                  <span>${combo.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => handleDeleteCombo(combo.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Combo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Combos;
