import {
	ChevronsLeft,
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
} from "lucide-react";
import { Button } from "./button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { cn } from "../../lib/utils";

const Pagination = ({
	pageNumber,
	pageSize,
	totalPages,
	totalElements,
	onPageChange,
	onPageSizeChange,
}) => {
	return (
		<div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between space-x-4 py-4 px-8 rounded-b-3xl">
			<div className="flex items-center space-x-4 text-sm text-gray-600">
				<span className="font-medium">Rows per page:</span>
				<Select
					onValueChange={onPageSizeChange}
					defaultValue={pageSize.toString()}
				>
					<SelectTrigger className="w-[80px] h-10 text-sm border-gray-300 bg-white rounded-xl shadow-sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="5">5</SelectItem>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="15">15</SelectItem>
						<SelectItem value="20">20</SelectItem>
					</SelectContent>
				</Select>
				<span className="ml-2 text-gray-500">
					Showing{" "}
					<span className="font-medium text-gray-900">
						{pageNumber * pageSize + 1}–
						{Math.min(pageNumber * pageSize + pageSize, totalElements)}
					</span>{" "}
					of <span className="font-medium text-gray-900">{totalElements}</span>{" "}
					results
				</span>
			</div>
			<div className="flex items-center space-x-1">
				<Button
					variant="outline"
					onClick={() => onPageChange(0)}
					disabled={pageNumber === 0}
					className="px-3 py-2 min-w-[36px] h-9 rounded-xl"
					size="sm"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					onClick={() => onPageChange(pageNumber - 1)}
					disabled={pageNumber === 0}
					className="px-3 py-2 min-w-[36px] h-9 rounded-xl"
					size="sm"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				{totalPages <= 10 ? (
					// Show all pages if 10 or fewer
					[...Array(totalPages)].map((_, i) => (
						<Button
							key={i}
							variant={pageNumber === i ? "primary" : "outline"}
							className={cn(
								"px-3 py-2 min-w-[36px] h-9 rounded-xl font-medium flex items-center justify-center",
								pageNumber === i
									? "bg-gradient-to-r from-primary to-blue-600 text-white"
									: "border-gray-300 text-gray-700 hover:bg-gray-50"
							)}
							onClick={() => onPageChange(i)}
							size="sm"
						>
							{i + 1}
						</Button>
					))
				) : (
					// Show smart pagination with dots for more than 10 pages
					(() => {
						const pages = [];
						const currentPage = pageNumber;
						const totalPagesCount = totalPages;

						// Always show first page
						pages.push(
							<Button
								key={0}
								variant={currentPage === 0 ? "primary" : "outline"}
								className={cn(
									"px-3 py-2 min-w-[36px] h-9 rounded-xl font-medium flex items-center justify-center",
									currentPage === 0
										? "bg-gradient-to-r from-primary to-blue-600 text-white"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
								)}
								onClick={() => onPageChange(0)}
								size="sm"
							>
								1
							</Button>
						);

						// Add dots after first page if current page is far from start
						if (currentPage > 3) {
							pages.push(
								<span
									key="dots-start"
									className="px-2 py-2 text-gray-500 flex items-center justify-center min-w-[36px] h-9"
								>
									...
								</span>
							);
						}

						// Show pages around current page
						const startPage = Math.max(1, currentPage - 1);
						const endPage = Math.min(totalPagesCount - 2, currentPage + 1);

						for (let i = startPage; i <= endPage; i++) {
							if (i !== 0 && i !== totalPagesCount - 1) {
								pages.push(
									<Button
										key={i}
										variant={currentPage === i ? "primary" : "outline"}
										className={cn(
											"px-3 py-2 min-w-[36px] h-9 rounded-xl font-medium flex items-center justify-center",
											currentPage === i
												? "bg-gradient-to-r from-primary to-blue-600 text-white"
												: "border-gray-300 text-gray-700 hover:bg-gray-50"
										)}
										onClick={() => onPageChange(i)}
										size="sm"
									>
										{i + 1}
									</Button>
								);
							}
						}

						// Add dots before last page if current page is far from end
						if (currentPage < totalPagesCount - 4) {
							pages.push(
								<span
									key="dots-end"
									className="px-2 py-2 text-gray-500 flex items-center justify-center min-w-[36px] h-9"
								>
									...
								</span>
							);
						}

						// Always show last page (if more than 1 page)
						if (totalPagesCount > 1) {
							pages.push(
								<Button
									key={totalPagesCount - 1}
									variant={currentPage === totalPagesCount - 1 ? "primary" : "outline"}
									className={cn(
										"px-3 py-2 min-w-[36px] h-9 rounded-xl font-medium flex items-center justify-center",
										currentPage === totalPagesCount - 1
											? "bg-gradient-to-r from-primary to-blue-600 text-white"
											: "border-gray-300 text-gray-700 hover:bg-gray-50"
									)}
									onClick={() => onPageChange(totalPagesCount - 1)}
									size="sm"
								>
									{totalPagesCount}
								</Button>
							);
						}

						return pages;
					})()
				)}
				<Button
					variant="outline"
					onClick={() => onPageChange(pageNumber + 1)}
					disabled={pageNumber >= totalPages - 1}
					className="px-3 py-2 min-w-[36px] h-9 rounded-xl"
					size="sm"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					onClick={() => onPageChange(totalPages - 1)}
					disabled={pageNumber >= totalPages - 1}
					className="px-3 py-2 min-w-[36px] h-9 rounded-xl"
					size="sm"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default Pagination;
