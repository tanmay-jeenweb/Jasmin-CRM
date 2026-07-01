import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DeviceRegistration from "./pages/DeviceRegistration";
import PendingApproval from "./pages/PendingApproval";

import UserHome from "./pages/user/UserHome";
import Inquiries from "./pages/user/Inquiries";
import CreateInquiry from "./pages/user/CreateInquiry";
import InProcessFranchise from "./pages/user/InProcessFranchise";
import CreateInProcessFranchise from "./pages/user/CreateInProcessFranchise";
import InProcessFranchiseDetails from "./pages/user/InProcessFranchiseDetails";
import Franchise from "./pages/user/Franchise";
import FranchiseDetails from "./pages/user/FranchiseDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserGroupMaster from "./pages/admin/user/UserGroupMaster";
import CreateUser from "./pages/admin/user/CreateUser";
import CreateUserType from "./pages/admin/user/CreateUserType";
import LabelMaster from "./pages/admin/LabelMaster";
import InquirySourceMaster from "./pages/admin/InquirySourceMaster";
import CompanyBrandMaster from "./pages/admin/CompanyBrandMaster";
import DocumentMaster from "./pages/admin/DocumentMaster";
import TeamRoleMaster from "./pages/admin/TeamRoleMaster";
import CallOutcomeMaster from "./pages/admin/CallOutcomeMaster";
import MobileBrandMaster from "./pages/admin/MobileBrandMaster";
import BankMaster from "./pages/admin/BankMaster";
import FinanceMachineMaster from "./pages/admin/FinanceMachineMaster";
import StoreDetailsApproval from "./pages/admin/StoreDetailsApproval";
import DepositStockApproval from "./pages/admin/DepositStockApproval";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {

    return (
        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/device-registration"
                element={<DeviceRegistration />}
            />

            <Route
                path="/pending-approval"
                element={<PendingApproval />}
            />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/user/home"
                    element={<UserHome />}
                />
                <Route
                    path="/user/inquiries"
                    element={<Inquiries />}
                />
                <Route
                    path="/user/inquiries/create"
                    element={<CreateInquiry />}
                />
                <Route
                    path="/user/in-process-franchises"
                    element={<InProcessFranchise />}
                />
                <Route
                    path="/user/franchises"
                    element={<Franchise />}
                />
                <Route
                    path="/user/in-process-franchises/create"
                    element={<CreateInProcessFranchise />}
                />
                <Route
                    path="/user/in-process-franchises/:id"
                    element={<InProcessFranchiseDetails />}
                />
                <Route
                    path="/user/franchises/:id"
                    element={<FranchiseDetails />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />
            </Route>

            <Route element={<ProtectedRoute requiredMaster="store_details_approval" requiredAction="read" />}>
                <Route
                    path="/admin/store-details-approval"
                    element={<StoreDetailsApproval />}
                />
            </Route>

            <Route element={<ProtectedRoute requiredMaster="deposit_stock_approval" requiredAction="read" />}>
                <Route
                    path="/admin/deposit-stock-approval"
                    element={<DepositStockApproval />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route
                    path="/admin/users/create"
                    element={<CreateUser />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="read" />}>
                <Route
                    path="/admin/user-types"
                    element={<UserGroupMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="write" />}>
                <Route
                    path="/admin/user-types/create"
                    element={<CreateUserType />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="label_master" requiredAction="read" />}>
                <Route
                    path="/admin/labels"
                    element={<LabelMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="inquiry_source_master" requiredAction="read" />}>
                <Route
                    path="/admin/inquiry-sources"
                    element={<InquirySourceMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="company_brand_master" requiredAction="read" />}>
                <Route
                    path="/admin/company-brands"
                    element={<CompanyBrandMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="document_master" requiredAction="read" />}>
                <Route
                    path="/admin/documents"
                    element={<DocumentMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="team_role_master" requiredAction="read" />}>
                <Route
                    path="/admin/team-roles"
                    element={<TeamRoleMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="call_outcome_master" requiredAction="read" />}>
                <Route
                    path="/admin/call-outcomes"
                    element={<CallOutcomeMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="mobile_brand_master" requiredAction="read" />}>
                <Route
                    path="/admin/mobile-brands"
                    element={<MobileBrandMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="bank_master" requiredAction="read" />}>
                <Route
                    path="/admin/banks"
                    element={<BankMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="finance_machine_master" requiredAction="read" />}>
                <Route
                    path="/admin/finance-machines"
                    element={<FinanceMachineMaster />}
                />
            </Route>

        </Routes>
    );
}