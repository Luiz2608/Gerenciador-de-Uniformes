import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shirt, AlertCircle, X, Eye } from 'lucide-react';

interface Uniform {
  id: string;
  type: string;
  size: string;
  status: 'available' | 'assigned' | 'maintenance';
  number?: string;
  athlete?: string;
  condition?: string;
}

interface UniformStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
}

interface UniformTypeDetails {
  type: string;
  image: string;
}

const UNIFORM_TYPES: UniformTypeDetails[] = [
  {
    type: 'PRETA 2023',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=300&h=300',
  },
  {
    type: 'BRANCA 2023',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=300&h=300',
  },
  {
    type: 'TREINO',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=300&h=300',
  },
];

const UniformCard = ({ 
  type, 
  stats, 
  image, 
  uniforms,
  onViewDetails 
}: { 
  type: string; 
  stats: UniformStats; 
  image: string;
  uniforms: Uniform[];
  onViewDetails: (type: string, uniforms: Uniform[]) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img 
          src={image} 
          alt={`Uniforme ${type}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h3 className="text-xl font-semibold text-white">Uniforme {type}</h3>
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
            <span className="font-semibold text-green-600">{stats.available}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Em Uso:</span>
            <span className="font-semibold text-blue-600">{stats.assigned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Manutenção:</span>
            <span className="font-semibold text-yellow-600">{stats.maintenance}</span>
          </div>
        </div>

        {stats.maintenance > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              {stats.maintenance} uniforme(s) em manutenção
            </span>
          </div>
        )}

        <button
          onClick={() => onViewDetails(type, uniforms)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Eye size={20} />
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

const UniformDetails = ({
  type,
  uniforms,
  onClose,
}: {
  type: string;
  uniforms: Uniform[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detalhes do Uniforme {type}</h2>
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
              {uniforms.map((uniform, index) => (
                <tr key={uniform.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniform.status === 'available' ? 'Disponível' : 
                     uniform.status === 'assigned' ? 'Em Uso' : 'Manutenção'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniform.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniform.athlete || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uniform.condition || 'Bom'}
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

const Uniforms = () => {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetchUniforms();
  }, []);

  const fetchUniforms = async () => {
    try {
      const { data, error } = await supabase
        .from('uniforms')
        .select('*');

      if (error) throw error;
      setUniforms(data || []);
    } catch (error) {
      console.error('Erro ao buscar uniformes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniformStats = (type: string): UniformStats => {
    const typeUniforms = uniforms.filter(u => u.type === type);
    return {
      total: typeUniforms.length,
      available: typeUniforms.filter(u => u.status === 'available').length,
      assigned: typeUniforms.filter(u => u.status === 'assigned').length,
      maintenance: typeUniforms.filter(u => u.status === 'maintenance').length,
    };
  };

  const handleViewDetails = (type: string, uniforms: Uniform[]) => {
    setSelectedType(type);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Uniformes</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando uniformes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIFORM_TYPES.map(({ type, image }) => (
            <UniformCard
              key={type}
              type={type}
              image={image}
              stats={getUniformStats(type)}
              uniforms={uniforms.filter(u => u.type === type)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {selectedType && (
        <UniformDetails
          type={selectedType}
          uniforms={uniforms.filter(u => u.type === selectedType)}
          onClose={() => setSelectedType(null)}
        />
      )}
    </div>
  );
};

export default Uniforms;