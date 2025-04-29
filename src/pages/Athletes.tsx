import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Search, X, Upload } from 'lucide-react';

interface Atleta {
  id: string;
  nome: string;
  cpf: string | null;
  sport: string;
  phone: string | null;
  course: string | null;
  photo_url: string | null;
  uniform_number: number | null;
  created_at: string;
}

const SPORTS = ['Basquete', 'Futsal', 'Handebol', 'Vôlei'];

const Athletes = () => {
  const [athletes, setAthletes] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Atleta | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    sport: '',
    phone: '',
    course: '',
    uniform_number: '',
    photo_url: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('atletas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    if (cleanCPF.length !== 11) {
      return 'CPF deve conter 11 dígitos';
    }

    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return 'CPF inválido';
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) {
      return 'CPF inválido';
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) {
      return 'CPF inválido';
    }

    return '';
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `athlete-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('athletes')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('athletes')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cpfValidationError = validateCPF(formData.cpf);
    if (cpfValidationError) {
      setCpfError(cpfValidationError);
      return;
    }
    setCpfError('');

    if (!formData.sport) {
      alert('Por favor, selecione um esporte');
      return;
    }
    
    setLoading(true);

    try {
      let photoUrl = formData.photo_url;
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const athleteData = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/[^\d]/g, ''),
        sport: formData.sport,
        phone: formData.phone,
        course: formData.course,
        uniform_number: formData.uniform_number ? parseInt(formData.uniform_number) : null,
        photo_url: photoUrl,
      };

      let error;

      if (editingAthlete) {
        const { error: updateError } = await supabase
          .from('atletas')
          .update(athleteData)
          .eq('id', editingAthlete.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('atletas')
          .insert([athleteData]);
        error = insertError;
      }

      if (error) throw error;

      setFormData({
        nome: '',
        cpf: '',
        sport: '',
        phone: '',
        course: '',
        uniform_number: '',
        photo_url: '',
      });
      setPhotoFile(null);
      setShowForm(false);
      setEditingAthlete(null);
      fetchAthletes();
    } catch (error) {
      console.error('Erro ao salvar atleta:', error);
      alert('Erro ao salvar atleta. Verifique se o CPF já não está cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (athlete: Atleta) => {
    setEditingAthlete(athlete);
    setFormData({
      nome: athlete.nome,
      cpf: athlete.cpf || '',
      sport: athlete.sport,
      phone: athlete.phone || '',
      course: athlete.course || '',
      uniform_number: athlete.uniform_number?.toString() || '',
      photo_url: athlete.photo_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este atleta?')) return;

    try {
      const { error } = await supabase
        .from('atletas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAthletes();
    } catch (error) {
      console.error('Erro ao excluir atleta:', error);
    }
  };

  const formatCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return '-';
    const numbers = cpf.replace(/[^\d]/g, '');
    if (numbers.length !== 11) return cpf;
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string | null | undefined): string => {
    if (!phone) return '-';
    const numbers = phone.replace(/[^\d]/g, '');
    if (numbers.length !== 11) return phone;
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (athlete.cpf || '').includes(searchTerm) ||
    athlete.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (athlete.uniform_number?.toString() || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atletas</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAthlete(null);
            setFormData({
              nome: '',
              cpf: '',
              sport: '',
              phone: '',
              course: '',
              uniform_number: '',
              photo_url: '',
            });
            setPhotoFile(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Atleta
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar atletas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingAthlete ? 'Editar Atleta' : 'Novo Atleta'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAthlete(null);
                  setCpfError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setFormData({ ...formData, cpf: formatted });
                        setCpfError('');
                      }}
                      maxLength={14}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        cpfError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {cpfError && (
                      <p className="mt-1 text-sm text-red-600">{cpfError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                      maxLength={15}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Esporte</label>
                    <select
                      required
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um esporte</option>
                      {SPORTS.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Curso</label>
                    <input
                      type="text"
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número do Uniforme</label>
                    <input
                      type="number"
                      value={formData.uniform_number}
                      onChange={(e) => setFormData({ ...formData, uniform_number: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                <div className="flex items-center space-x-4">
                  {formData.photo_url && (
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-100">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Clique para upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
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
                Foto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Esporte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Nenhum atleta encontrado
                </td>
              </tr>
            ) : (
              filteredAthletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {athlete.photo_url ? (
                      <img
                        src={athlete.photo_url}
                        alt={athlete.nome}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {athlete.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{athlete.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatCPF(athlete.cpf)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{athlete.sport}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{athlete.course || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {athlete.uniform_number || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(athlete)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(athlete.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
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

export default Athletes;