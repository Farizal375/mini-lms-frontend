import { getAdminStats } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, EyeOff, Bookmark } from "lucide-react";

export const metadata = { title: "Admin Dashboard | MuzLib" };

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Kartu 1: Total User */}
        <StatsCard 
          title="Total User" 
          value={stats?.totalUsers || 0} 
          icon={<Users className="h-4 w-4 text-blue-600" />} 
        />
        
        {/* Kartu 2: Total Buku di DB */}
        <StatsCard 
          title="Buku Terdata" 
          value={stats?.totalBooks || 0} 
          icon={<BookOpen className="h-4 w-4 text-green-600" />} 
          desc="Buku yang pernah diakses/disimpan user"
        />

        {/* Kartu 3: Total Bookmark */}
        <StatsCard 
          title="Total Bookmark" 
          value={stats?.totalBookmarks || 0} 
          icon={<Bookmark className="h-4 w-4 text-purple-600" />} 
        />

        {/* Kartu 4: Featured */}
        <StatsCard 
          title="Buku Featured" 
          value={stats?.featuredBooks || 0} 
          icon={<Star className="h-4 w-4 text-yellow-500" />} 
        />
      </div>
    </div>
  );
}

// Komponen Kecil untuk Kartu
function StatsCard({ title, value, icon, desc }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
      </CardContent>
    </Card>
  );
}