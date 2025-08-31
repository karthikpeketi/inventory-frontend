import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/button";
import { USER_STATUS, getUserState } from "../../constants/userStatus";
import { useAuth } from "../../context/AuthContext";

const UserTable = ({
  users,
  sortBy,
  sortDirection,
  isLoading,
  onSort,
  onDelete,
  onApprove,
  onReactivate,
  onSendActivation
}) => {
  const { isAdmin } = useAuth();
  // DataTable columns configuration
  const columns = [
    { 
      header: "Name", 
      accessor: "firstName", 
      sortable: true, 
      sortKey: "firstName",
      accessorFn: (user) => `${user.firstName} ${user.lastName}` 
    },
    { 
      header: "Email", 
      accessor: "email", 
      sortable: true,
      sortKey: "email" 
    },
    { 
      header: "Role", 
      accessor: "role", 
      sortable: true,
      sortKey: "role",
      accessorFn: (user) => <StatusBadge status={isAdmin ? "success" : "default"} text={user.role} /> 
    },
    { 
      header: "Status", 
      sortable: true,
      sortKey: "isActive",
      accessor: (user) => {
          const userState = getUserState(user);
          
          switch (userState) {
            case "ACTIVE":
              return <StatusBadge status="success" text="Active" />;
            case "PENDING_APPROVAL":
              return <StatusBadge status="warning" text="Pending Approval" />;
            case "PENDING_ACTIVATION":
              return <StatusBadge status="info" text="Pending Activation" />;
            case "DEACTIVATED":
              return <StatusBadge status="danger" text="Deactivated" />;
            case "REJECTED":
              return <StatusBadge status="danger" text="Rejected" />;
            default:
              return <StatusBadge status="default" text="Inactive" />;
          }
      }
    },
    {
      header: '',
      accessor: (user) => {
        const userState = getUserState(user);
        
        return (
          <div className="flex space-x-2 justify-center">
            {/* Pending Approval - Show Approve and Reject buttons */}
            {userState === "PENDING_APPROVAL" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onApprove(user)}
                  title="Approve user registration"
                  className="border-green-500 text-green-600 hover:bg-green-50 px-2 py-1 text-xs"
                >
                  <span>Approve</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(user)}
                  title="Reject user registration"
                  className="border-red-500 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
                >
                  <span>Reject</span>
                </Button>
              </>
            )}
            
            {/* Pending Activation - Show info button and Send Activation Email button */}
            {userState === "PENDING_ACTIVATION" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  title="User needs to activate their account"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 px-2 py-1 text-xs"
                >
                  <span>Pending</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSendActivation(user)}
                  title="Send activation email to user"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
                >
                  <span>Send Email</span>
                </Button>
              </>
            )}
            
            {/* Deactivated - Show Reactivate button */}
            {userState === "DEACTIVATED" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onReactivate(user)}
                title="Reactivate user"
                className="border-green-500 text-green-600 hover:bg-green-50 px-2 py-1 text-xs"
              >
                <span>Reactivate</span>
              </Button>
            )}
            
            {/* Active - Show Delete/Deactivate button */}
            {userState === "ACTIVE" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(user)}
                disabled={user.role === "ADMIN"}
                title={user.role === "ADMIN" ? "Admin users cannot be deactivated" : "Deactivate user"}
                className={user.role === "ADMIN" ? "opacity-50 cursor-not-allowed border-red-500 text-red-600 px-2 py-1 text-xs" : "border-red-500 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"}
              >
                <span>Delete</span>
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      keyField="id"
      onSort={onSort}
      sortBy={sortBy}
      sortDirection={sortDirection}
      loading={isLoading}
      styles={{tableMaxHeight: 'max-h-[calc(100vh-64px-56px-52px)]'}}
      emptyMessage="No users found"
    />
  );
};

export default UserTable;
