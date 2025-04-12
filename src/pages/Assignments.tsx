import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  cpf: string;
}

interface Uniform {
  id: string;
  type: string;
  size: string;
  number: number;
  status: 'available' | 'assigned' | 'maintenance';
}

interface Assignment {
  id: string;
  athlete_id: string;
  uniform_id: string;
  pickup_date: string;
  return_date: string | null;
  status: 'scheduled' | 'picked_up' | 'returned';
  athlete: Athlete;
  uniform: Uniform;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [uniformTypes, setUniformTypes] = useState<string[]>([]);
  const [availableUniforms, setAvailableUniforms] = useState<Uniform[]>([]);
  const [formData, setFormData] = useState({
    athlete_id: '',
    uniform_type: '',
    uniform_id: '',
    pickup_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchAssignments();
    fetchAthletes();
    fetchUniformTypes();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('uniform_assignments')
        .select(`
          *,
          athlete:athletes(*),
          uniform:uniforms(*)
        `)
        .order('pickup_date', { ascending: false });

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
        .from('athletes')
        .select('id, name, sport, cpf')
        .order('name');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    }
  };

  const fetchUniformTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('uniforms')
        .select('type')
        .order('type');

      if (error) throw error;
      const types = [...new Set(data?.map(u => u.type) || [])];
      setUniformTypes(types);
    } catch (error) {
      console.error('Erro ao buscar tipos de uniforme:', error);
    }
  };

  const fetchAvailableUniforms = async (type: string) => {
    try {
      const { data, error } = await supabase
        .from('uniforms')
        .select('*')
        .eq('type', type)
        .eq('status', 'available')
        .order('number');

      if (error) throw error;
      setAvailableUniforms(data || []);
      setFormData(prev => ({ ...prev, uniform_id: '' }));
    } catch (error) {
      console.error('Erro ao buscar uniformes disponíveis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.athlete_id || !formData.uniform_id || !formData.pickup_date) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Iniciar uma transação
      // 1. Criar a atribuição
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('uniform_assignments')
        .insert([{
          athlete_id: formData.athlete_id,
          uniform_id: formData.uniform_id,
          pickup_date: formData.pickup_date,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // 2. Atualizar o status do uniforme
      const { error: uniformError } = await supabase
        .from('uniforms')
        .update({ status: 'assigned' })
        .eq('id', formData.uniform_id);

      if (uniformError) throw uniformError;

      setShowForm(false);
      setFormData({
        athlete_id: '',
        uniform_type: '',
        uniform_id: '',
        pickup_date: format(new Date(), 'yyyy-MM-dd'),
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
                  value={formData.athlete_id}
                  onChange={(e) => setFormData({ ...formData, athlete_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Selecione um atleta</option>
                  {athletes.map(athlete => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.name} - {athlete.sport} (CPF: {athlete.cpf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo do Uniforme</label>
                <select
                  value={formData.uniform_type}
                  onChange={(e) => {
                    setFormData({ ...formData, uniform_type: e.target.value, uniform_id: '' });
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
                    value={formData.uniform_id}
                    onChange={(e) => setFormData({ ...formData, uniform_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Selecione um uniforme</option>
                    {availableUniforms.map(uniform => (
                      <option key={uniform.id} value={uniform.id}>
                        Número {uniform.number} - Tamanho {uniform.size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Retirada</label>
                <input
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
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
                      {assignment.athlete.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.athlete.sport}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.uniform.type} - Nº {assignment.uniform.number}
                    </div>
                    <div className="text-sm text-gray-500">
                      Tamanho {assignment.uniform.size}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(assignment.pickup_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      assignment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status === 'scheduled' ? 'Agendado' :
                       assignment.status === 'picked_up' ? 'Retirado' :
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