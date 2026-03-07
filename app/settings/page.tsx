import db from '@/lib/db';
import { Settings, Users, Building2, Database, ShieldCheck, Download } from 'lucide-react';

export default async function SettingsPage() {
    const departments = db.prepare("SELECT * FROM Department").all() as any[];
    const users = db.prepare("SELECT u.*, d.name as deptName FROM User u LEFT JOIN Department d ON u.departmentId = d.id").all() as any[];

    return (
        <div className="space-y-6">
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
                            <button className="px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold border border-blue-500/20">
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
                                    {users.map(u => (
                                        <tr key={u.id} className="group">
                                            <td className="py-4">
                                                <p className="font-medium text-[var(--foreground)]">{u.name}</p>
                                                <p className="text-[10px] text-gray-500">{u.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className="px-2 py-0.5 bg-[var(--accent)] rounded text-[10px] font-bold text-gray-400">
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-400">{u.deptName || 'System'}</td>
                                            <td className="py-4 text-right">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
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
                                <div key={d.id} className="p-3 border border-[var(--border)] rounded-xl bg-[var(--accent)]/30 group hover:border-emerald-500/30 transition-colors">
                                    <p className="font-bold text-sm text-[var(--foreground)]">{d.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">Campus Node</p>
                                </div>
                            ))}
                            <button className="p-3 border-2 border-dashed border-[var(--border)] rounded-xl text-xs font-bold text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
                                + NEW DEPT
                            </button>
                        </div>
                    </div>
                </div>

                {/* System & Maintenance */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)] bg-[var(--background)]">
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
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">OFFLINE READY</span>
                            </div>
                            <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4">
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
                            <div className="flex items-center gap-3 p-2 bg-rose-500/10 rounded-lg text-[10px] font-bold text-rose-500 border border-rose-500/20 uppercase">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                Encryption: AES-256 Enabled
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
