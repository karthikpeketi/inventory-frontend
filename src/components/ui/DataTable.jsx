import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";

const DataTable = ({
	columns,
	data,
	keyField,
	onRowClick,
	actions, // { header: 'Actions', render: (item) => jsx }
	// Server-side sorting props
	onSort,
	sortBy,
	sortDirection,
	loading = false,
	styles = {},
}) => {
	// Handle server-side sorting if onSort is provided, otherwise use client-side sorting
	const [clientSortConfig, setClientSortConfig] = useState({
		key: null,
		direction: null,
	});

	const handleSort = (key) => {
		// Use sortBy from column if available, otherwise use the key directly
		if (onSort) {
			// Server-side sorting
			let direction = "asc";
			if (sortBy === key) {
				if (sortDirection === "asc") {
					direction = "desc";
				} else if (sortDirection === "desc") {
					direction = null; // Clear sorting
				}
			}
			onSort(direction ? key : null, direction);
		} else {
			// Client-side sorting (fallback)
			let direction = "asc";
			if (clientSortConfig.key === key) {
				if (clientSortConfig.direction === "asc") {
					direction = "desc";
				} else if (clientSortConfig.direction === "desc") {
					direction = null;
				}
			}
			setClientSortConfig({ key: direction ? key : null, direction });
		}
	};

	const getSortedData = () => {
		// If using server-side sorting, return data as-is (already sorted by server)
		if (onSort) {
			return data;
		}

		// Client-side sorting fallback
		if (!clientSortConfig.key || !clientSortConfig.direction) return data;
		return [...data].sort((a, b) => {
			const aValue = a[clientSortConfig.key];
			const bValue = b[clientSortConfig.key];
			if (aValue === bValue) return 0;
			return clientSortConfig.direction === "asc"
				? aValue < bValue
					? -1
					: 1
				: aValue > bValue
				? -1
				: 1;
		});
	};

	const getSortIcon = (column) => {
		if (!column.sortable) return null;

		// Use server-side sort state if available, otherwise use client-side state
		const currentSortKey = onSort ? sortBy : clientSortConfig.key;
		const currentSortDirection = onSort
			? sortDirection
			: clientSortConfig.direction;

		// Check if the current sort key matches column's sortBy, sortKey, or accessor
		const columnSortKey = column.sortBy || column.sortKey || column.accessor;
		const isCurrentSortColumn =
			currentSortKey === columnSortKey ||
			(typeof columnSortKey === "string" && currentSortKey === columnSortKey);

		if (isCurrentSortColumn) {
			return currentSortDirection === "asc" ? (
				<ChevronUp className="ml-1 h-4 w-4" />
			) : (
				<ChevronDown className="ml-1 h-4 w-4" />
			);
		}
		return <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />;
	};

	const renderCellContent = (item, column) => {
		if (typeof column.accessor === "function") return column.accessor(item);
		return item[column.accessor];
	};

	// Handle row click with event propagation control
	const handleRowClick = (e, item) => {
		// Only trigger onRowClick if the click was directly on the row or a cell
		// and not on a button, dropdown, or other interactive element
		if (onRowClick && e.target === e.currentTarget) {
			onRowClick(item);
		}
	};

	const sortedData = getSortedData();

	return (
		<div className="w-full overflow-hidden relative" style={{ isolation: 'isolate' }}>
			<div className="relative rounded-t-3xl shadow-[0_0_30px_rgba(0,0,0,0.10)] border border-gray-200 overflow-hidden bg-white">
				{loading && (
					<div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-1">
						<motion.div
							className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					</div>
				)}

				<div className="overflow-x-auto h-full relative">
					<div 
						className={`${styles.tableMaxHeight} overflow-y-auto relative`}
						style={{
							scrollBehavior: 'smooth',
							// Add padding top to prevent content from going under sticky header
							paddingTop: '1px',
							marginTop: '-1px', // Compensate for the padding
						}}
					>
					<table className="min-w-full table-fixed border-collapse">
							<thead className="sticky top-0 z-30 bg-white shadow-sm">
								<tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
									{columns.map((column, index) => (
										<th
											key={index}
											className="text-left font-semibold text-gray-700 px-6 py-4 w-[150px] text-sm"
										>
											{column.sortable ? (
												<Button
													variant="ghost"
													size="sm"
													className="h-8 p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none border-0 focus:border-0 active:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 !border-none !outline-none"
													disableOutline={true}
													onClick={() => {
														const sortKey = column.sortBy || column.sortKey || column.accessor;
														if (typeof sortKey === "string") {
															handleSort(sortKey);
														}
													}}
												>
													<span className="flex items-center">
														{column.header}
														{getSortIcon(column)}
													</span>
												</Button>
											) : (
												column.header
											)}
										</th>
									))}
									{actions && (
										<th className="text-left px-6 py-4 w-[120px] text-sm font-semibold text-gray-700">
											<span className="flex items-center">
												{/* Actions title removed - functionality preserved */}
											</span>
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{sortedData.length > 0 ? (
									sortedData.map((item, index) => (
										<motion.tr
											key={
												item[keyField] !== undefined
													? String(item[keyField])
													: `row-${Math.random().toString(36).substr(2, 9)}`
											}
											onClick={(e) => handleRowClick(e, item)}
											className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
								onRowClick ? "cursor-pointer" : ""
							}`}
								initial={{ opacity: 0, y: 5 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ 
									duration: 0.2, 
									delay: index * 0.03,
									ease: 'easeOut'
								}}
									style={{
										position: 'relative',
										zIndex: 1, // Base z-index for rows
									}}
										>
											{columns.map((column, colIndex) => (
												<td
													key={colIndex}
													className="px-6 py-4 w-[150px] text-gray-900"
													onClick={(e) => {
														// If the cell contains interactive elements, don't propagate the click
														const hasInteractiveElements =
															e.currentTarget.querySelector("button") ||
															e.currentTarget.querySelector("a") ||
															e.currentTarget.querySelector(
																'[role="button"]'
															) ||
															e.currentTarget.querySelector("input");

														if (hasInteractiveElements) {
															e.stopPropagation();
														}
													}}
												>
													{renderCellContent(item, column)}
												</td>
											))}
											{actions && (
												<td
													className="px-6 py-4 w-[120px]"
													onClick={(e) => e.stopPropagation()} // Always prevent row click in actions column
												>
													{actions.render(item)}
												</td>
											)}
										</motion.tr>
									))
								) : (
									<tr>
										<td
											colSpan={columns.length + (actions ? 1 : 0)}
											className="py-16 text-center text-gray-500"
										>
											<div className="flex flex-col items-center space-y-2">
												<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
													<ChevronsUpDown className="h-8 w-8 text-gray-400" />
												</div>
												<p className="font-medium">No data available</p>
												<p className="text-sm text-gray-400">
													Data will appear here when available
												</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DataTable;