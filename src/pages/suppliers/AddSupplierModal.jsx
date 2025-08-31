import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import { supplierService } from "../../api";

const AddSupplierModal = ({ isOpen = false, onOpenChange, supplierToEdit = null, onSupplierAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Supplier name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Supplier name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Supplier name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(value.trim())) {
          newErrors.name = 'Supplier name contains invalid characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'contactPerson':
        if (value.trim().length > 50) {
          newErrors.contactPerson = 'Contact person name must not exceed 50 characters';
        } else if (value.trim() && !/^[a-zA-Z\s\-'.]+$/.test(value.trim())) {
          newErrors.contactPerson = 'Contact person name contains invalid characters';
        } else {
          delete newErrors.contactPerson;
        }
        break;

      case 'email':
        if (value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            newErrors.email = 'Please enter a valid email address';
          } else if (value.trim().length > 100) {
            newErrors.email = 'Email must not exceed 100 characters';
          } else {
            delete newErrors.email;
          }
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value.trim()) {
          // Remove all non-digit characters for validation
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 10) {
            newErrors.phone = 'Phone number must be at least 10 digits';
          } else if (digitsOnly.length > 10) {
            newErrors.phone = 'Phone number must not exceed 10 digits';
          } else if (!/^[\d\s\-\+\(\)\.]+$/.test(value.trim())) {
            newErrors.phone = 'Phone number contains invalid characters';
          } else {
            delete newErrors.phone;
          }
        } else {
          delete newErrors.phone;
        }
        break;

      case 'address':
        if (value.trim() && value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else if (value.trim().length > 200) {
          newErrors.address = 'Address must not exceed 200 characters';
        } else {
          delete newErrors.address;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name || "",
        contactPerson: supplierToEdit.contactPerson || "",
        email: supplierToEdit.email || "",
        phone: supplierToEdit.phone || "",
        address: supplierToEdit.address || ""
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: ""
      });
    }
    // Clear errors when modal opens/closes or when editing different supplier
    setErrors({});
    setIsSubmitting(false);
  }, [supplierToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toastUtils.error(toast, "Validation Error", "Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Trim all string values before submission
      const trimmedData = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      if (supplierToEdit) {
        await supplierService.updateSupplier(supplierToEdit.id, trimmedData);
        toastUtils.patterns.crud.updateSuccess(toast, "Supplier");
      } else {
        await supplierService.addSupplier(trimmedData);
        toastUtils.patterns.crud.createSuccess(toast, "Supplier");
      }
      onSupplierAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Supplier operation error:', error);
      
      // Handle specific error messages from the server
      let errorMessage = supplierToEdit ? "Failed to update supplier." : "Failed to add supplier.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toastUtils.error(toast, "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button onClick={() => onOpenChange(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{supplierToEdit ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>
              {supplierToEdit ? "Update the supplier details below." : "Enter the details of the new supplier below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  className={errors.contactPerson ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.contactPerson && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactPerson}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting 
                  ? (supplierToEdit ? "Updating..." : "Adding...") 
                  : (supplierToEdit ? "Update Supplier" : "Add Supplier")
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddSupplierModal;