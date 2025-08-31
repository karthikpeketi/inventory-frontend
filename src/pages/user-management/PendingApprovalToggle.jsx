import React from 'react';
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";

const PendingApprovalToggle = ({ checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="show-pending-approval"
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor="show-pending-approval" className="cursor-pointer">
        Show pending approval
      </Label>
    </div>
  );
};

export default PendingApprovalToggle;