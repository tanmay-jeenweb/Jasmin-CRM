import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateUserByAdmin } from "../../../api/authApi";

export default function EditUserModal({ isOpen, onClose, user, userTypes = [], onUserUpdated }) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        mobNo: "",
        role: "user",
        userTypeId: "",
        newPassword: "",
        confirmPassword: "",
        deviceVerificationRequired: true,
        active: true
    });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                mobNo: user.mob_no || "",
                role: user.role || "user",
                userTypeId: user.user_type_id ? String(user.user_type_id) : "",
                newPassword: "",
                confirmPassword: "",
                deviceVerificationRequired: user.device_verification_required !== 0 && user.device_verification_required !== false,
                active: user.active !== 0 && user.active !== false
            });
            setShowPassword(false);
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Full Name is required.");
            return;
        }
        if (!formData.username.trim()) {
            toast.error("Username is required.");
            return;
        }
        if (!formData.email.trim()) {
            toast.error("Email Address is required.");
            return;
        }

        if (formData.newPassword) {
            if (formData.newPassword.length < 6) {
                toast.error("Password must be at least 6 characters long.");
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error("Confirm password does not match new password.");
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                mobNo: formData.mobNo?.trim() || null,
                role: formData.role,
                userTypeId: formData.userTypeId ? parseInt(formData.userTypeId, 10) : null,
                deviceVerificationRequired: formData.deviceVerificationRequired,
                active: formData.active
            };

            if (formData.newPassword && formData.newPassword.trim()) {
                payload.password = formData.newPassword.trim();
            }

            const res = await updateUserByAdmin(user.id, payload);
            toast.success(res.data?.message || "User settings updated successfully");

            // Update current user in localStorage if editing own account
            try {
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                if (currentUser.id === user.id) {
                    const updatedCurrentUser = {
                        ...currentUser,
                        name: payload.name,
                        username: payload.username,
                        email: payload.email,
                        role: payload.role,
                        user_type_id: payload.userTypeId
                    };
                    localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
                    window.dispatchEvent(new Event("auth-change"));
                }
            } catch (err) {
                console.error("Error updating local storage user:", err);
            }

            if (onUserUpdated) {
                onUserUpdated();
            }
            onClose();
        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error(error.response?.data?.message || "Failed to update user settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-[#6804a1] tracking-tight">
                        Edit settings for {user.name || "User"} ({user.username || ""})
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                        title="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
                    {/* 2-Column Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                FULL NAME
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors"
                                placeholder="Admin User"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                USERNAME
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors"
                                placeholder="admin"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                EMAIL ADDRESS
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors"
                                placeholder="admin@erp.com"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                MOBILE NUMBER
                            </label>
                            <input
                                type="text"
                                value={formData.mobNo}
                                onChange={(e) => setFormData({ ...formData, mobNo: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors"
                                placeholder="1234567899"
                            />
                        </div>

                        {/* User Role */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                USER ROLE
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors capitalize"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="office staff">Office Staff</option>
                                <option value="super admin">Super Admin</option>
                            </select>
                        </div>

                        {/* User Type Group */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                USER TYPE GROUP
                            </label>
                            <select
                                value={formData.userTypeId}
                                onChange={(e) => setFormData({ ...formData, userTypeId: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors"
                            >
                                <option value="">None (No Permissions Group)</option>
                                {userTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* New Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase">
                                    NEW PASSWORD
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors font-mono placeholder:font-sans placeholder:text-slate-400"
                                placeholder="New password (leave empty to keep current)"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                                CONFIRM PASSWORD
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6804a1]/20 focus:border-[#6804a1] transition-colors font-mono placeholder:font-sans placeholder:text-slate-400"
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.deviceVerificationRequired}
                                onChange={(e) => setFormData({ ...formData, deviceVerificationRequired: e.target.checked })}
                                className="h-4 w-4 text-[#6804a1] accent-[#6804a1] border-slate-300 rounded focus:ring-[#6804a1]"
                            />
                            <span className="text-sm font-medium text-slate-700">
                                Device Verification Required
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="h-4 w-4 text-[#6804a1] accent-[#6804a1] border-slate-300 rounded focus:ring-[#6804a1]"
                            />
                            <span className="text-sm font-medium text-slate-700">
                                Account Active
                            </span>
                        </label>
                    </div>

                    {/* Footer / Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-lg bg-[#6804a1] hover:bg-[#52037e] text-white font-semibold text-sm transition-colors shadow-sm hover:shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
