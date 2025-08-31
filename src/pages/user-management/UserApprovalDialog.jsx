import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDate, isValidDate } from '../../lib/utils';

/**
 * Dialog for approving a user registration
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the dialog is open
 * @param {Function} props.setIsOpen Function to set the open state
 * @param {Object} props.selectedUser The user to approve
 * @param {Function} props.handleConfirm Function to handle approval confirmation
 * @param {Function} props.handleReject Function to handle approval rejection
 * @param {boolean} props.operationLoading Whether an operation is in progress
 * @returns {JSX.Element} Dialog component
 */
const UserApprovalDialog = ({
  isOpen,
  setIsOpen,
  selectedUser,
  handleConfirm,
  handleReject,
  operationLoading,
}) => {
  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve User Registration</DialogTitle>
          <DialogDescription>
            This user has registered and is waiting for admin approval.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Name:</span>
              <span className="col-span-2">{selectedUser.firstName} {selectedUser.lastName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Email:</span>
              <span className="col-span-2">{selectedUser.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Role:</span>
              <span className="col-span-2">{selectedUser.role}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Registered:</span>
              <span className="col-span-2">
                {selectedUser.createdAt}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={operationLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={operationLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {operationLoading ? "Approving..." : "Approve"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserApprovalDialog;