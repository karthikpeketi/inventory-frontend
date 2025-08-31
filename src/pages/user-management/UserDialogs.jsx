import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";
import UserForm from "./UserForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export const CreateUserDialog = ({
  isOpen,
  setIsOpen,
  formData,
  handleChange,
  handleSubmit,
  operationLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. They will receive an email with login instructions.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          operationLoading={operationLoading}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export const DeactivateUserDialog = ({
  isOpen,
  setIsOpen,
  selectedUser,
  handleConfirm,
  operationLoading
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Are you sure?"
      description={`This will deactivate the user ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email}).
      The user will no longer be able to access the system, but their data will be preserved.`}
      onConfirm={handleConfirm}
      onCancel={() => setIsOpen(false)}
      confirmText={
        <>
          {operationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Deactivate
        </>
      }
      cancelText="Cancel"
    />
  );
};

export const ReactivateUserDialog = ({
  isOpen,
  setIsOpen,
  selectedUser,
  handleConfirm,
  operationLoading
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Reactivate User"
      description={`This user is currently inactive. Do you want to activate ${selectedUser?.firstName} ${selectedUser?.lastName} (${selectedUser?.email}) before editing?
      After reactivation, you'll be able to edit their information.`}
      onConfirm={handleConfirm}
      onCancel={() => setIsOpen(false)}
      confirmText={
        <>
          {operationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" />
          Yes, Activate User
        </>
      }
      cancelText="Cancel"
    />
  );
};