import { getAllUsersAction } from "@/actions/admin-user-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminUserActions, CreateUserDialog } from "./admin-user-actions-ui";
import { Users, Plus } from "lucide-react";

export const metadata = { title: "Daftar User | Admin MuzLib" };

export default async function AdminUsersPage() {
  const response = await getAllUsersAction();
  const users: any[] = response.success ? (response.data ?? []) : [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Manajemen User</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {users.length} User Terdaftar
          </Badge>
          <CreateUserDialog />
        </div>
      </div>

      {/* Error state */}
      {response.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          ⚠️ Error: {response.error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {users.length > 0 ? (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-4">Nama & Email</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-center">Role</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 hidden md:table-cell">Terdaftar</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    {/* Nama & Email */}
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name || user.email.split("@")[0]}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-xs">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          User
                        </Badge>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-slate-500 hidden md:table-cell text-xs">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      <AdminUserActions
                        userId={user.id}
                        userName={user.name || user.email.split("@")[0]}
                        userEmail={user.email}
                        currentRole={user.role}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p>Belum ada user yang terdaftar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
