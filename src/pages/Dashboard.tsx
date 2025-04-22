import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shirt, Users, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalAthletes: number;
  totalUniforms: number;
  pendingAssignments: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAthletes: 0,
    totalUniforms: 0,
    pendingAssignments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [athletesCount, uniformsCount, pendingCount] = await Promise.all([
        supabase.from('athletes').select('id', { count: 'exact' }),
        supabase.from('uniforms').select('id', { count: 'exact' }),
        supabase.from('uniform_assignments').select('id', { count: 'exact' }).eq('status', 'scheduled'),
      ]);

      setStats({
        totalAthletes: athletesCount.count || 0,
        totalUniforms: uniformsCount.count || 0,
        pendingAssignments: pendingCount.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Atletas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAthletes}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Uniformes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUniforms}</p>
            </div>
            <Shirt className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atribuições Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingAssignments}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;