import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { renderRoutes } from "./routes/index.jsx";

import "./index.css";
import useOnlineStatus from "./hooks/useOnlineStatus";
import OfflineFallback from "./components/layout/OfflineFallback";

const App = () => {
	const isOnline = useOnlineStatus(); // Use custom hook to check online status
	return (
		!isOnline ? (
			<OfflineFallback />
		) : (
			<TooltipProvider>
				<BrowserRouter>
					<AuthProvider>
						<Toaster />
						<Routes>
							{renderRoutes()}
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</TooltipProvider>
		)
	);
};

export default App;
