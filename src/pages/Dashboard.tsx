import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shirt, Users, AlertCircle, Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

interface DashboardStats {
  totalAtletas: number;
  totalUniformes: number;
  atribuicoesPendentes: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAtletas: 0,
    totalUniformes: 0,
    atribuicoesPendentes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [atletasCount, uniformesCount, pendingCount] = await Promise.all([
        supabase.from('atletas').select('id', { count: 'exact' }),
        supabase.from('uniformes').select('id', { count: 'exact' }),
        supabase.from('atribuicoes_uniformes')
          .select('id', { count: 'exact' })
          .eq('situacao', 'agendado'),
      ]);

      setStats({
        totalAtletas: atletasCount.count || 0,
        totalUniformes: uniformesCount.count || 0,
        atribuicoesPendentes: pendingCount.count || 0,
      });
    };

    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const [atletas, uniformes] = await Promise.all([
        supabase.from('atletas').select('*'),
        supabase.from('uniformes').select('*'),
      ]);

      const wb = utils.book_new();
      const atletasWS = utils.json_to_sheet(atletas.data || []);
      const uniformesWS = utils.json_to_sheet(uniformes.data || []);
      
      utils.book_append_sheet(wb, atletasWS, 'Atletas');
      utils.book_append_sheet(wb, uniformesWS, 'Uniformes');
      
      writeFile(wb, 'relatorio_uniformes_atletas.xlsx');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Atletas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAtletas}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Uniformes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUniformes}</p>
            </div>
            <Shirt className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atribuições Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.atribuicoesPendentes}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;