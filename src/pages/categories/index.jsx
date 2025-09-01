import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Filter, FolderOpen, Tags } from "lucide-react";
import { Button } from "../../components/ui/button";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SearchContainer from "../../components/ui/SearchContainer.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useToast, toastUtils } from "../../components/ui/use-toast";
import { useAuth } from "../../context/AuthContext";
import { categoryService } from "../../api";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import ExportButton from "../../components/ui/ExportButton.jsx";
import { useIsMobile } from "../../hooks/useMobile.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import Pagination from "../../components/ui/pagination.jsx";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER, DEFAULT_SORT_DIRECTION } from "../../constants/pagination.js";
import { USER_ROLES } from "../../constants/auth";

import AddCategoryModal from "./AddCategoryModal.jsx";
import EditCategoryModal from "./EditCategoryModal.jsx";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categories, setCategories] = useState([]);

  // State for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Server-side sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);

  // Pagination state
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Effect to handle URL search parameter changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchQuery(urlSearchTerm);
      setPageNumber(0); // Reset to first page when search changes
      
      // Clear the URL parameter after processing to avoid conflicts
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('search');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // State for API calls
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const fetchCategoriesApi = async (pageNumber, pageSize, sortBy, sortDirection, searchQuery) => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const result = await categoryService.getCategories(pageNumber, pageSize, sortBy, sortDirection, searchQuery);
      return result;
    } catch (err) {
      setCategoriesError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Function to fetch categories with pagination, sorting, and filtering
  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchCategoriesApi(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchQuery
      );
      setCategories(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      toastUtils.patterns.crud.category.loadFailed(toast, error.message || "An error occurred while fetching categories.");
    }
  }, [pageNumber, pageSize, sortBy, sortDirection, searchQuery, toast]);

  // Define columns for the categories table
  const columns = [
    {
      header: 'Category Name',
      accessor: 'name',
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Description',
      accessor: 'description',
      sortable: true,
      sortKey: 'description',
    },
    {
      header: 'Created At',
      accessor: 'createdAtFormatted',
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      header: '',
      accessor: (category) => {
        // For Non-Admin Users: Show only view button
        if (user?.role !== USER_ROLES.ADMIN) {
          return (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewCategory(category)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 py-1"
            >
              View
            </Button>
          );
        }
        
        // For Admin Users: Show direct action buttons
        return (
          <div className="flex items-center space-x-1 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditCategory(category)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteCategory(category)}
              className="border-red-500 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
            >
              Delete
            </Button>
          </div>
        );
      }
    },
  ];

  // Fetch categories when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, pageNumber, pageSize, sortBy, sortDirection, searchQuery]);

  // Handle sort change
  const handleSort = (newSortBy, newDirection) => {
    let newSortDirection = newDirection;
    if (!newDirection) {
      newSortDirection = 'asc';
      if (sortBy === newSortBy) {
        newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      }
    }
    
    // Find the column with the matching sortKey or accessor to get the correct backend field name
    const column = columns.find(col => 
      col.sortKey === newSortBy || 
      col.accessor === newSortBy ||
      (typeof col.accessor === 'string' && col.accessor === newSortBy)
    );
    
    // Use the column's sortKey if available, otherwise use the newSortBy value
    const backendSortField = column?.sortKey || newSortBy;
    
    setSortBy(backendSortField);
    setSortDirection(newSortDirection);
    setPageNumber(0); // Reset to first page on new sort
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPageNumber(0); // Reset to first page when page size changes
  };
  
  // Handle search with the SearchInput component
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setPageNumber(0); // Reset to first page when search changes
  }, []);

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  // Function to open the delete confirmation dialog
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmDialogOpen(true);
  };

  // Function to handle the category deletion confirmation
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete.id);

      // Update local state
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));

      toastUtils.patterns.crud.category.deleted(toast, categoryToDelete.name);
    } catch (error) {
      toastUtils.patterns.crud.category.deleteFailed(toast, error.message || "Unable to delete category.");
    } finally {
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleAddCategorySuccess = (newCategory) => {
    // Refresh the categories list
    fetchCategories();
    
    toastUtils.patterns.crud.category.added(toast, newCategory.name);
    
    setIsAddCategoryOpen(false);
  };

  const handleEditCategorySuccess = (updatedCategory) => {
    // Update the local state
    setCategories(categories.map(c => 
      c.id === updatedCategory.id ? updatedCategory : c
    ));
    
    toastUtils.patterns.crud.category.updated(toast, updatedCategory.name);
    
    setIsEditCategoryOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div 
      className="flex flex-col h-[100%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-10 flex items-center justify-between mb-4 h-min"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <PageHeader
          title="Categories"
          description="Manage product categories"
          icon={<Tags />}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
        />
        
        <div className="action-buttons-container">
          <div className="action-button-search">
            <SearchContainer 
              placeholder="Search categories..."
              onSearch={handleSearch}
              initialValue={searchQuery}
              delay={300}
            />
          </div>
          
          <ExportButton 
            data={categories} 
            filename="categories-export" 
            label="Export"
            variant="outline"
            size="sm"
            className="action-button-export"
          />
          
          {[USER_ROLES.ADMIN, USER_ROLES.STAFF].includes(user?.role) && (
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              className="action-button-add bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Category</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table or Mobile Cards */}
      {isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesLoading ? (
            <p>Loading categories...</p>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="w-full">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{category.description}</p>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="link" className="w-full text-left p-0 justify-start h-auto mt-2">
                        See More
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <p>Created: {category.createdAtFormatted}</p>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCategory(category)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 py-1"
                  >
                    View
                  </Button>
                  {user?.role === USER_ROLES.ADMIN && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 py-1"
                    >
                      Edit
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="relative flex-grow min-h-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.10)]">
          <DataTable
            columns={columns}
            data={categories}
            keyField="id"
            isLoading={categoriesLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            emptyMessage="No categories found"
            styles={{tableMaxHeight: 'max-h-[calc(100vh-64px-56px-52px)]'}}
          />
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={handleAddCategorySuccess}
      />

      {/* Edit Category Modal */}
      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditCategoryOpen}
          onClose={() => {
            setIsEditCategoryOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onSuccess={handleEditCategorySuccess}
          readOnly={user?.role !== USER_ROLES.ADMIN}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title={`Are you sure you want to delete ${categoryToDelete?.name}?`}
        description="This action cannot be undone. The category will be permanently deleted."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setCategoryToDelete(null);
        }}
        confirmText="Delete"
        isConfirming={false}
      />
    </div>
  );
};

export default Categories;
