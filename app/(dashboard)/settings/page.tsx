"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Users, Building2, Database, ShieldCheck, Download, Loader2, X, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ToastProvider";

function SettingsContent() {
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form data
    const [deptName, setDeptName] = useState("");
    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "DEPT_OFFICER",
        departmentId: ""
    });

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const [usersRes, deptsRes] = await Promise.all([
                fetch('/api/settings/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/settings/departments', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (usersRes.ok && deptsRes.ok) {
                const usersData = await usersRes.json();
                const deptsData = await deptsRes.json();
                setUsers(usersData.users || []);
                setDepartments(deptsData.departments || []);
            } else {
                showToast("Only SUPER_ADMINs can access settings", "error");
                router.push('/');
            }
        } catch (error) {
            console.error("Settings fetch error:", error);
            showToast("Failed to load settings data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleAddDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/settings/departments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: deptName })
            });

            if (res.ok) {
                showToast("Department created successfully", "success");
                setDeptName("");
                setShowDeptModal(false);
                fetchData();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to create department", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const token = localStorage.getItem('token');

        const payload = {
            ...userForm,
            departmentId: userForm.departmentId === "none" ? null : userForm.departmentId
        };

        try {
            const res = await fetch('/api/settings/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast("User added successfully", "success");
                setUserForm({ name: "", email: "", password: "", role: "DEPT_OFFICER", departmentId: "" });
                setShowUserModal(false);
                fetchData();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to add user", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportBackup = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        showToast("Generating secure backup... this may take a moment", "info");
        try {
            const res = await fetch('/api/settings/backup', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `assetnode-backup-${new Date().toISOString().split('T')[0]}.db`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showToast("Database dump exported successfully", "success");
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to export backup", "error");
            }
        } catch (error) {
            console.error("Backup export error:", error);
            showToast("Error generating backup", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading system configurations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">System Administration</h2>
                <p className="text-gray-500 mt-1">Configure global parameters, manage users, and backup local data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)] bg-[var(--background)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" /> Authorized Personnel
                            </h3>
                            <button
                                onClick={() => setShowUserModal(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            >
                                + Add User
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] text-gray-500">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">Role</th>
                                        <th className="pb-3 font-semibold">Department</th>
                                        <th className="pb-3 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-gray-500 text-xs">No users found.</td>
                                        </tr>
                                    ) : users.map(u => (
                                        <tr key={u.id} className="group hover:bg-[var(--accent)]/10 transition-colors">
                                            <td className="py-4">
                                                <p className="font-medium text-[var(--foreground)]">{u.name}</p>
                                                <p className="text-[10px] text-gray-500">{u.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'SUPER_ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        u.role === 'AUDITOR' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-400">{u.deptName || 'System Wide'}</td>
                                            <td className="py-4 text-right">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)] bg-[var(--background)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-500" /> Departments & Locations
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {departments.map(d => (
                                <div key={d.id} className="p-3 border border-[var(--border)] rounded-xl bg-gradient-to-br from-[var(--background)] to-[var(--accent)] group hover:border-emerald-500/30 transition-colors">
                                    <p className="font-bold text-sm text-[var(--foreground)]">{d.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest text-emerald-500/60 font-mono">NODE_CTX</p>
                                </div>
                            ))}
                            <button onClick={() => setShowDeptModal(true)} className="p-3 border-2 border-dashed border-[var(--border)] rounded-xl text-xs font-bold text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5 flex items-center justify-center">
                                + NEW DEPT
                            </button>
                        </div>
                    </div>
                </div>

                {/* System & Maintenance */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)] bg-gradient-to-br from-[var(--background)] to-[var(--accent)]">
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                            <Database className="w-5 h-5 text-amber-500" /> Database Health
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Storage Engine</span>
                                <span className="font-mono text-amber-500">better-sqlite3</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Sync Status</span>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">OFFLINE READY</span>
                            </div>
                            <button
                                onClick={handleExportBackup}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-xl text-xs tracking-widest uppercase font-black shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
                            >
                                <Download className="w-4 h-4" /> EXPORT SQLITE DUMP
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5">
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-rose-500">
                            <ShieldCheck className="w-5 h-5" /> Security Policy
                        </h3>
                        <p className="text-xs text-rose-500/60 leading-relaxed mb-4">
                            System is currently operating in "Local Trust" mode. Biometric-linked audit logs are enabled by default for all QR scan events.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 bg-rose-500/10 rounded-lg text-[10px] font-bold text-rose-500 border border-rose-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                Encryption: AES-256 Enabled
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Modal */}
            {showDeptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
                        <button onClick={() => setShowDeptModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Create Department</h3>
                        <form onSubmit={handleAddDepartment} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Name</label>
                                <input
                                    required
                                    autoFocus
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                    placeholder="e.g. Graphic Design"
                                />
                            </div>
                            <button
                                disabled={actionLoading || !deptName}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] disabled:shadow-none flex items-center justify-center"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "REGISTER DEPARTMENT"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 w-full max-w-md relative overflow-y-auto max-h-screen">
                        <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Provision Account</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                    <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Email / Username</label>
                                    <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="john@zou.ac.zw" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Access Password</label>
                                    <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="•••••••••" minLength={6} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Role Level</label>
                                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                        <option value="DEPT_OFFICER">Dept Officer</option>
                                        <option value="AUDITOR">Auditor</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Department Link</label>
                                    <select value={userForm.departmentId} onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                        <option value="none">System Wide (No Dept)</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {userForm.role === 'SUPER_ADMIN' && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-4 flex gap-3 text-rose-500 text-xs">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    WARNING: This grants complete system control over all assets, settings, and users.
                                </div>
                            )}

                            <button
                                disabled={actionLoading || !userForm.name || !userForm.password || !userForm.email}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] disabled:shadow-none mt-6 flex justify-center items-center"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "PROVISION ACCESS"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <SettingsContent />
        </Suspense>
    );
}
