import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shirt, AlertCircle, X, Eye, Plus, Upload } from 'lucide-react';

interface Uniforme {
  id: string;
  tipo: string;
  tamanho: string;
  situacao: 'disponivel' | 'atribuido' | 'manutencao';
  numero: number;
  atleta?: string;
  condicao: string;
}

interface ModeloUniforme {
  tipo: string;
  image: string;
}

interface UniformeStats {
  total: number;
  disponiveis: number;
  atribuidos: number;
  manutencao: number;
}

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
const CONDICOES = ['Novo', 'Bom', 'Regular', 'Ruim'];

const UniformCard = ({ 
  tipo, 
  stats, 
  image, 
  uniformes,
  onViewDetails,
  onAddUniform 
}: { 
  tipo: string; 
  stats: UniformeStats; 
  image: string;
  uniformes: Uniforme[];
  onViewDetails: (tipo: string, uniformes: Uniforme[]) => void;
  onAddUniform: (tipo: string) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img 
          src={image} 
          alt={`Uniforme ${tipo}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h3 className="text-xl font-semibold text-white">Uniforme {tipo}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Disponíveis:</span>
            <span className="font-semibold text-green-600">{stats.disponiveis}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Em Uso:</span>
            <span className="font-semibold text-blue-600">{stats.atribuidos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Manutenção:</span>
            <span className="font-semibold text-yellow-600">{stats.manutencao}</span>
          </div>
        </div>

        {stats.manutencao > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              {stats.manutencao} uniforme(s) em manutenção
            </span>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <button
            onClick={() => onViewDetails(tipo, uniformes)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Eye size={20} />
            Ver Detalhes
          </button>
          
          <button
            onClick={() => onAddUniform(tipo)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Plus size={20} />
            Adicionar Uniforme
          </button>
        </div>
      </div>
    </div>
  );
};

const UniformDetails = ({
  tipo,
  uniformes,
  onClose,
}: {
  tipo: string;
  uniformes: Uniforme[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detalhes do Uniforme {tipo}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atleta/Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condição
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uniformes.map((uniforme) => (
                <tr key={uniforme.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {uniforme.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniforme.situacao === 'disponivel' ? 'Disponível' : 
                     uniforme.situacao === 'atribuido' ? 'Em Uso' : 'Manutenção'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniforme.tamanho}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniforme.atleta || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniforme.condicao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NewUniformModel = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (model: ModeloUniforme) => void;
}) => {
  const [tipo, setTipo] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo || !image) return;

    setLoading(true);
    try {
      await onSave({ tipo, image });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      alert('Erro ao salvar o modelo de uniforme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Novo Modelo de Uniforme</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Modelo</label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              placeholder="https://exemplo.com/imagem.jpg"
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
  );
};

const NewUniform = ({
  tipo,
  onClose,
  onSave,
}: {
  tipo: string;
  onClose: () => void;
  onSave: (uniforme: Partial<Uniforme>) => void;
}) => {
  const [formData, setFormData] = useState({
    numero: '',
    tamanho: '',
    condicao: 'Novo',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tamanho || !formData.numero) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        tipo,
        situacao: 'disponivel',
        numero: parseInt(formData.numero),
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar uniforme:', error);
      alert('Erro ao salvar o uniforme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Novo Uniforme - {tipo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número</label>
            <input
              type="number"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              min="1"
              placeholder="Digite o número do uniforme"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tamanho</label>
            <select
              value={formData.tamanho}
              onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Selecione um tamanho</option>
              {TAMANHOS.map(tamanho => (
                <option key={tamanho} value={tamanho}>{tamanho}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Condição</label>
            <select
              value={formData.condicao}
              onChange={(e) => setFormData({ ...formData, condicao: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              {CONDICOES.map(condicao => (
                <option key={condicao} value={condicao}>{condicao}</option>
              ))}
            </select>
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
  );
};

const Uniforms = () => {
  const [uniformes, setUniformes] = useState<Uniforme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showNewModel, setShowNewModel] = useState(false);
  const [showNewUniform, setShowNewUniform] = useState<string | null>(null);
  const [uniformModels, setUniformModels] = useState<ModeloUniforme[]>([
    {
      tipo: 'PRETA 2023',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=300&h=300',
    },
    {
      tipo: 'BRANCA 2023',
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=300&h=300',
    },
    {
      tipo: 'TREINO',
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=300&h=300',
    },
  ]);

  useEffect(() => {
    fetchUniforms();
  }, []);

  const fetchUniforms = async () => {
    try {
      const { data, error } = await supabase
        .from('uniformes')
        .select('*');

      if (error) throw error;
      setUniformes(data || []);
    } catch (error) {
      console.error('Erro ao buscar uniformes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async (model: ModeloUniforme) => {
    setUniformModels([...uniformModels, model]);
  };

  const handleSaveUniform = async (uniforme: Partial<Uniforme>) => {
    try {
      const { data, error } = await supabase
        .from('uniformes')
        .insert([uniforme])
        .select();

      if (error) throw error;
      if (data) {
        setUniformes([...uniformes, data[0]]);
      }
    } catch (error) {
      console.error('Erro ao salvar uniforme:', error);
      throw error;
    }
  };

  const getUniformStats = (tipo: string): UniformeStats => {
    const tipoUniformes = uniformes.filter(u => u.tipo === tipo);
    return {
      total: tipoUniformes.length,
      disponiveis: tipoUniformes.filter(u => u.situacao === 'disponivel').length,
      atribuidos: tipoUniformes.filter(u => u.situacao === 'atribuido').length,
      manutencao: tipoUniformes.filter(u => u.situacao === 'manutencao').length,
    };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Uniformes</h1>
        <button
          onClick={() => setShowNewModel(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Modelo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando uniformes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniformModels.map(({ tipo, image }) => (
            <UniformCard
              key={tipo}
              tipo={tipo}
              image={image}
              stats={getUniformStats(tipo)}
              uniformes={uniformes.filter(u => u.tipo === tipo)}
              onViewDetails={(tipo) => setSelectedType(tipo)}
              onAddUniform={(tipo) => setShowNewUniform(tipo)}
            />
          ))}
        </div>
      )}

      {selectedType && (
        <UniformDetails
          tipo={selectedType}
          uniformes={uniformes.filter(u => u.tipo === selectedType)}
          onClose={() => setSelectedType(null)}
        />
      )}

      {showNewModel && (
        <NewUniformModel
          onClose={() => setShowNewModel(false)}
          onSave={handleSaveModel}
        />
      )}

      {showNewUniform && (
        <NewUniform
          tipo={showNewUniform}
          onClose={() => setShowNewUniform(null)}
          onSave={handleSaveUniform}
        />
      )}
    </div>
  );
};

export default Uniforms;