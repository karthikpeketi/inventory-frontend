import React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2 } from "lucide-react";
import { USER_ROLES } from "../../constants/auth";

const UserForm = ({
  formData,
  handleChange,
  handleSubmit,
  isEdit = false,
  operationLoading,
  onCancel
}) => {
  const idPrefix = isEdit ? "edit-" : "";
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}firstName`}>First Name</Label>
            <Input
              id={`${idPrefix}firstName`}
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}lastName`}>Last Name</Label>
            <Input
              id={`${idPrefix}lastName`}
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}email`}>Email</Label>
          <Input
            id={`${idPrefix}email`}
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            readOnly={isEdit} // Make email read-only in edit mode
          />
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          )}
        </div>
        {/* Password field removed for admin-created users - they will set it via activation link */}
        {/* Information about activation email */}
        {!isEdit && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              An activation email will be sent to the user with instructions to set their password.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}role`}>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange("role", value)}
            disabled={isEdit && formData.role === USER_ROLES.ADMIN}
          >
            <SelectTrigger id={`${idPrefix}role`}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_ROLES.ADMIN}>Administrator</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
            </SelectContent>
          </Select>
          {isEdit && formData.role === USER_ROLES.ADMIN && (
            <p className="text-xs text-gray-500 mt-1">Admin role cannot be changed</p>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={operationLoading}>
          {operationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;