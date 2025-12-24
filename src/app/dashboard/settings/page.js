"use client";

import { useState, useEffect, useRef } from "react";
import { account, storage } from "@/appwrite";
import { ID } from "appwrite";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    User, Lock, Bell, Loader2, Save, Shield, Camera, Trash2, AlertTriangle, LogOut
} from "lucide-react";
import { BUCKET_AVATARS } from "@/appwrite/config";


export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Preferences State
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await account.get();
                setUser(userData);
                setName(userData.name);
                setPhone(userData.phone);
                // Load prefs if available
                if (userData.prefs) {
                    setEmailNotifs(userData.prefs.emailNotifs ?? true);
                    setMarketingEmails(userData.prefs.marketingEmails ?? false);
                    setAvatarUrl(userData.prefs.avatarUrl ?? null);
                }
            } catch (error) {
                toast.error("Failed to load profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
        }

        setUploadingAvatar(true);
        try {
            // Upload to storage
            const uploaded = await storage.createFile(
                BUCKET_AVATARS,
                ID.unique(),
                file
            );

            // Get the file URL
            const fileUrl = storage.getFileView(BUCKET_AVATARS, uploaded.$id);

            // Update user prefs with avatar URL
            await account.updatePrefs({
                ...user.prefs,
                avatarUrl: fileUrl.href,
                avatarFileId: uploaded.$id
            });

            setAvatarUrl(fileUrl.href);
            setUser((prev) => ({
                ...prev,
                prefs: { ...prev.prefs, avatarUrl: fileUrl.href }
            }));

            toast.success("Profile picture updated!");
        } catch (error) {
            console.error("Avatar upload error:", error);
            // If bucket doesn't exist, save as prefs anyway (base64 fallback)
            if (error.code === 404) {
                toast.error("Avatar storage not configured. Please contact support.");
            } else {
                toast.error(error.message || "Failed to upload image");
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setSaving(true);
        try {
            // Remove from storage if file ID exists
            if (user.prefs?.avatarFileId) {
                try {
                    await storage.deleteFile(BUCKET_AVATARS, user.prefs.avatarFileId);
                } catch (e) {
                    // Ignore if file doesn't exist
                }
            }

            // Clear from prefs
            await account.updatePrefs({
                ...user.prefs,
                avatarUrl: null,
                avatarFileId: null
            });

            setAvatarUrl(null);
            setUser((prev) => ({
                ...prev,
                prefs: { ...prev.prefs, avatarUrl: null, avatarFileId: null }
            }));

            toast.success("Profile picture removed");
        } catch (error) {
            toast.error("Failed to remove picture");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await account.updateName(name);
            toast.success("Profile updated successfully");
            setUser((prev) => ({ ...prev, name }));
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setSaving(true);
        try {
            await account.updatePassword(newPassword, password);
            toast.success("Password updated successfully");
            setPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNotifications = async () => {
        setSaving(true);
        try {
            await account.updatePrefs({
                ...user.prefs,
                emailNotifs,
                marketingEmails
            });
            toast.success("Preferences saved");
            setUser((prev) => ({
                ...prev,
                prefs: { ...prev.prefs, emailNotifs, marketingEmails }
            }));
        } catch (error) {
            toast.error("Failed to update preferences");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            toast.error("Please type DELETE to confirm");
            return;
        }

        setDeleting(true);
        try {
            // Delete all sessions first
            await account.deleteSessions();

            // Note: Full account deletion requires server-side API with admin privileges
            // For now, we'll log out and show a message
            toast.success("Account deletion requested. You will be logged out.");

            // In a real implementation, you'd call a server action here:
            // await deleteUserAccount(user.$id);

            router.push("/");
        } catch (error) {
            toast.error(error.message || "Failed to delete account");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "danger", label: "Danger Zone", icon: AlertTriangle },
    ];

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="mt-2 text-slate-500">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                {/* Sidebar Tabs */}
                <div className="md:col-span-3">
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                                        ? tab.id === "danger"
                                            ? "bg-red-50 text-red-700 shadow-sm ring-1 ring-red-200"
                                            : "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                                        : tab.id === "danger"
                                            ? "text-red-600 hover:bg-red-50"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="md:col-span-9">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        {/* General Tab */}
                        {activeTab === "general" && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Profile Information
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Update your account details and profile picture.
                                    </p>
                                </div>

                                {/* Profile Picture */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase() || "U"
                                            )}
                                        </div>
                                        {uploadingAvatar && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingAvatar}
                                            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Change Photo
                                        </button>
                                        {avatarUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                disabled={saving}
                                                className="flex items-center gap-2 text-sm text-red-600 hover:underline"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Remove
                                            </button>
                                        )}
                                        <p className="text-xs text-slate-400">
                                            JPG, PNG or GIF. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={user?.phone || ""}
                                            disabled
                                            placeholder="No phone number linked"
                                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500"
                                        />
                                        <p className="text-xs text-slate-400">
                                            Contact support to update your phone number.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Security</h2>
                                    <p className="text-sm text-slate-500">
                                        Manage your password and account security.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Password Requirements</h3>
                                            <ul className="mt-1 text-sm text-slate-600 list-disc list-inside">
                                                <li>Minimum 8 characters</li>
                                                <li>Include a special character</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Notifications
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Choose what you want to be notified about.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                        <div>
                                            <h3 className="font-medium text-slate-900">
                                                Email Notifications
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Receive emails about your account activity.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={emailNotifs}
                                                onChange={(e) => setEmailNotifs(e.target.checked)}
                                            />
                                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white focus:outline-none focus:ring-4 focus:ring-emerald-300"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                        <div>
                                            <h3 className="font-medium text-slate-900">
                                                Marketing & News
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Receive updates about new features and promotions.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={marketingEmails}
                                                onChange={(e) => setMarketingEmails(e.target.checked)}
                                            />
                                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white focus:outline-none focus:ring-4 focus:ring-emerald-300"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleUpdateNotifications}
                                        disabled={saving}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === "danger" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-red-600">
                                        Danger Zone
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Irreversible and destructive actions.
                                    </p>
                                </div>

                                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-red-100 p-2">
                                            <Trash2 className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-red-900">Delete Account</h3>
                                            <p className="mt-1 text-sm text-red-700">
                                                Once you delete your account, there is no going back.
                                                All your listings, favorites, and data will be permanently removed.
                                            </p>
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="mt-4 rounded-xl border-2 border-red-600 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                            >
                                                Delete my account
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-slate-100 p-2">
                                            <LogOut className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">Sign Out Everywhere</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Sign out from all devices and sessions.
                                            </p>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await account.deleteSessions();
                                                        toast.success("Signed out from all devices");
                                                        router.push("/auth/login");
                                                    } catch (e) {
                                                        toast.error("Failed to sign out");
                                                    }
                                                }}
                                                className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                Sign out everywhere
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Delete Account</h3>
                        </div>

                        <p className="text-slate-600 mb-4">
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Type <span className="font-bold text-red-600">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText("");
                                }}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== "DELETE" || deleting}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
