import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const SellStockModal = ({ isSellModalOpen, setIsSellModalOpen, selectedProduct, sellQuantity, handleQuantityChange, handleConfirmSell, handleClearSell, incrementQuantity, decrementQuantity, stockOutLoading, getProductLoading }) => {
  const { isAdmin } = useAuth();
  return (
    <Dialog open={isSellModalOpen} onOpenChange={setIsSellModalOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isAdmin ? 'Stock Out' : 'Sell Product'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {selectedProduct && (
              <>
                Product: <strong className="text-gray-800 dark:text-gray-100">{selectedProduct.name}</strong>
                <br />
                Available Stock: <strong className="text-gray-800 dark:text-gray-100">{selectedProduct.quantity}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-200">Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={sellQuantity === '' ? false : sellQuantity <= 1}
                  className="p-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={sellQuantity}
                  onChange={handleQuantityChange}
                  max={selectedProduct.quantity}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={sellQuantity === '' ? false : sellQuantity >= selectedProduct.quantity}
                  className="p-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleConfirmSell}
                  className="px-5 py-2 text-base"
                  disabled={stockOutLoading || getProductLoading}
                >
                  {stockOutLoading || getProductLoading ? 'Processing...' : 'OK'}
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleClearSell}
                  className="px-5 py-2 text-base border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-50"
                  disabled={stockOutLoading || getProductLoading}
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellStockModal;
