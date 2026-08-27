import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DonorsPage from "./pages/DonorsPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2SuccessPage from "./pages/OAuth2SuccessPage";


function App() {
    const token = localStorage.getItem("token");
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={token ? (<Navigate to="/dashboard" replace />) : (<LoginPage />)}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
                <Route path="/reset-password" element={<ResetPasswordPage />}/>
                <Route path="/oauth2/success" element={<OAuth2SuccessPage />}/>
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />}/>
                    <Route path="/donors" element={<DonorsPage />}/>
                    <Route path="/expenses" element={<ExpensesPage />}/>
                    <Route path="/reports" element={<ReportsPage />}/>
                </Route>
                <Route path="/" element={<Navigate to= {token ? "/dashboard" : "/login"}replace/>}/>
                <Route path="*" element={<Navigate to={ token ? "/dashboard" : "/login"}replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}
export default App;