import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Atleta {
  id: string;
  nome: string;
  sport: string;
  cpf: string;
}

interface Uniforme {
  id: string;
  tipo: string;
  tamanho: string;
  numero: number;
  situacao: 'disponivel' | 'atribuido' | 'manutencao';
}

interface Atribuicao {
  id: string;
  atleta_id: string;
  uniforme_id: string;
  data_retirada: string;
  data_devolucao: string | null;
  situacao: 'agendado' | 'retirado' | 'devolvido';
  atleta: Atleta;
  uniforme: Uniforme;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Atribuicao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<Atleta[]>([]);
  const [uniformTypes, setUniformTypes] = useState<string[]>([]);
  const [availableUniforms, setAvailableUniforms] = useState<Uniforme[]>([]);
  const [formData, setFormData] = useState({
    atleta_id: '',
    uniform_type: '',
    uniforme_id: '',
    data_retirada: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchAssignments();
    fetchAthletes();
    fetchUniformTypes();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('atribuicoes_uniformes')
        .select(`
          *,
          atleta:atletas(*),
          uniforme:uniformes(*)
        `)
        .order('data_retirada', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Erro ao buscar atribuições:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('atletas')
        .select('id, nome, sport, cpf')
        .order('nome');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    }
  };

  const fetchUniformTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('uniformes')
        .select('tipo')
        .order('tipo');

      if (error) throw error;
      const types = [...new Set(data?.map(u => u.tipo) || [])];
      setUniformTypes(types);
    } catch (error) {
      console.error('Erro ao buscar tipos de uniforme:', error);
    }
  };

  const fetchAvailableUniforms = async (tipo: string) => {
    try {
      const { data, error } = await supabase
        .from('uniformes')
        .select('*')
        .eq('tipo', tipo)
        .eq('situacao', 'disponivel')
        .order('numero');

      if (error) throw error;
      setAvailableUniforms(data || []);
      setFormData(prev => ({ ...prev, uniforme_id: '' }));
    } catch (error) {
      console.error('Erro ao buscar uniformes disponíveis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.atleta_id || !formData.uniforme_id || !formData.data_retirada) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('atribuicoes_uniformes')
        .insert([{
          atleta_id: formData.atleta_id,
          uniforme_id: formData.uniforme_id,
          data_retirada: formData.data_retirada,
          situacao: 'agendado'
        }])
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      const { error: uniformError } = await supabase
        .from('uniformes')
        .update({ situacao: 'atribuido' })
        .eq('id', formData.uniforme_id);

      if (uniformError) throw uniformError;

      setShowForm(false);
      setFormData({
        atleta_id: '',
        uniform_type: '',
        uniforme_id: '',
        data_retirada: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchAssignments();
    } catch (error) {
      console.error('Erro ao criar atribuição:', error);
      alert('Erro ao criar atribuição. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atribuições</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Atribuição
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Nova Atribuição</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Atleta</label>
                <select
                  value={formData.atleta_id}
                  onChange={(e) => setFormData({ ...formData, atleta_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Selecione um atleta</option>
                  {athletes.map(athlete => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.nome} - {athlete.sport} (CPF: {athlete.cpf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo do Uniforme</label>
                <select
                  value={formData.uniform_type}
                  onChange={(e) => {
                    setFormData({ ...formData, uniform_type: e.target.value, uniforme_id: '' });
                    if (e.target.value) {
                      fetchAvailableUniforms(e.target.value);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Selecione um modelo</option>
                  {uniformTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {formData.uniform_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uniforme</label>
                  <select
                    value={formData.uniforme_id}
                    onChange={(e) => setFormData({ ...formData, uniforme_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Selecione um uniforme</option>
                    {availableUniforms.map(uniform => (
                      <option key={uniform.id} value={uniform.id}>
                        Número {uniform.numero} - Tamanho {uniform.tamanho}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Retirada</label>
                <input
                  type="date"
                  value={formData.data_retirada}
                  onChange={(e) => setFormData({ ...formData, data_retirada: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atleta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uniforme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Retirada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma atribuição encontrada
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.atleta.nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.atleta.sport}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.uniforme.tipo} - Nº {assignment.uniforme.numero}
                    </div>
                    <div className="text-sm text-gray-500">
                      Tamanho {assignment.uniforme.tamanho}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(assignment.data_retirada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      assignment.situacao === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.situacao === 'retirado' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.situacao === 'agendado' ? 'Agendado' :
                       assignment.situacao === 'retirado' ? 'Retirado' :
                       'Devolvido'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments;