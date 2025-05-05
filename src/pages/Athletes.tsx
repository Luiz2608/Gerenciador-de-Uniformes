import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Search, X, Upload } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Atleta {
  id: string;
  nome: string;
  cpf: string | null;
  sport: string;
  phone: string | null;
  course: string | null;
  photo_url: string | null;
  created_at: string;
}

const SPORTS = ['Basquete', 'Futsal', 'Handebol', 'Vôlei'];
const MAX_PHOTO_SIZE_MB = 2;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
    photo_url: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cpfError, setCpfError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atletas')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
      toast.error('Erro ao carregar atletas');
    } finally {
      setLoading(false);
    }
  };

  const validateCPF = (cpf: string): string => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    if (cleanCPF.length !== 11) return 'CPF deve conter 11 dígitos';
    if (/^(\d)\1{10}$/.test(cleanCPF)) return 'CPF inválido';

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) return 'CPF inválido';

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) return 'CPF inválido';

    return '';
  };

  const checkDuplicateCPF = async (cpf: string): Promise<boolean> => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    const { data, error } = await supabase
      .from('atletas')
      .select('id')
      .eq('cpf', cleanCPF);

    if (error) throw error;
    return (data?.length || 0) > 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPEG, PNG ou WEBP');
      e.target.value = ''; // Limpa o input
      return;
    }
    
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      toast.error(`A foto deve ter no máximo ${MAX_PHOTO_SIZE_MB}MB`);
      e.target.value = ''; // Limpa o input
      return;
    }
    
    setPhotoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `athlete-photos/${fileName}`;

        // Verifica se o bucket existe
        const { error: bucketError } = await supabase.storage.getBucket('athletes');
        if (bucketError) throw bucketError;

        const { error: uploadError } = await supabase.storage
          .from('athletes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          if (uploadError.message.includes('already exists')) {
            // Se o arquivo já existe, tenta com um nome diferente
            const uniqueFileName = `${Date.now()}-${file.name}`;
            const uniqueFilePath = `athlete-photos/${uniqueFileName}`;
            
            const { error: retryError } = await supabase.storage
              .from('athletes')
              .upload(uniqueFilePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
              });
            
            if (retryError) throw retryError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('athletes')
              .getPublicUrl(uniqueFilePath);
            
            return resolve(publicUrl);
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('athletes')
          .getPublicUrl(filePath);

        resolve(publicUrl);
      } catch (error) {
        console.error('Erro no upload:', error);
        reject(error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf || !formData.sport || !formData.phone || !formData.course) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const cpfValidationError = validateCPF(formData.cpf);
    if (cpfValidationError) {
      setCpfError(cpfValidationError);
      return;
    }
    
    if (!editingAthlete) {
      try {
        const isDuplicate = await checkDuplicateCPF(formData.cpf);
        if (isDuplicate) {
          setCpfError('CPF já cadastrado');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        toast.error('Erro ao verificar CPF');
        return;
      }
    }
    
    setLoading(true);
    setUploadProgress(0);

    try {
      let photoUrl = formData.photo_url;
      
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(photoFile);
          setUploadProgress(100);
        } catch (uploadError) {
          console.error('Erro no upload da foto:', uploadError);
          toast.warn('Erro ao enviar a foto. Salvando sem imagem...');
          photoUrl = null;
        }
      } else if (editingAthlete) {
        photoUrl = editingAthlete.photo_url;
      }

      const athleteData = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/[^\d]/g, ''),
        sport: formData.sport,
        phone: formData.phone.replace(/[^\d]/g, ''),
        course: formData.course,
        photo_url: photoUrl,
      };

      if (editingAthlete) {
        const { error } = await supabase
          .from('atletas')
          .update(athleteData)
          .eq('id', editingAthlete.id);
        
        if (error) throw error;
        toast.success('Atleta atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('atletas')
          .insert([athleteData]);
        
        if (error) throw error;
        toast.success('Atleta cadastrado com sucesso!');
      }

      resetForm();
      fetchAthletes();
    } catch (error) {
      console.error('Erro ao salvar atleta:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar atleta');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      sport: '',
      phone: '',
      course: '',
      photo_url: '',
    });
    setPhotoFile(null);
    setShowForm(false);
    setEditingAthlete(null);
    setCpfError('');
  };

  const handleEdit = (athlete: Atleta) => {
    setEditingAthlete(athlete);
    setFormData({
      nome: athlete.nome,
      cpf: athlete.cpf || '',
      sport: athlete.sport,
      phone: athlete.phone || '',
      course: athlete.course || '',
      photo_url: athlete.photo_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este atleta?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('atletas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Atleta excluído com sucesso!');
      fetchAthletes();
    } catch (error) {
      console.error('Erro ao excluir atleta:', error);
      toast.error('Erro ao excluir atleta');
    } finally {
      setLoading(false);
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
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (athlete.cpf || '').includes(searchTerm) ||
    athlete.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <ToastContainer position="top-right" autoClose={5000} />
      
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">
                {editingAthlete ? 'Editar Atleta' : 'Novo Atleta'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF *</label>
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
                      placeholder="000.000.000-00"
                    />
                    {cpfError && (
                      <p className="mt-1 text-sm text-red-600">{cpfError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                      maxLength={15}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Esporte *</label>
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
                    <label className="block text-sm font-medium text-gray-700">Curso *</label>
                    <input
                      type="text"
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto (opcional)</label>
                <div className="flex items-center space-x-4">
                  {formData.photo_url ? (
                    <div className="relative group">
                      <img
                        src={formData.photo_url}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, photo_url: '' });
                          setPhotoFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <span className="text-gray-400 text-xs text-center">Sem foto</span>
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Clique para upload</span>
                    <span className="text-xs text-gray-400">(JPEG/PNG, máx. 2MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                  </label>
                </div>
                
                {photoFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Foto selecionada: {photoFile.name} ({Math.round(photoFile.size / 1024)}KB)
                  </p>
                )}
                
                {uploadProgress !== null && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingAthlete ? 'Atualizar Atleta' : 'Cadastrar Atleta'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !showForm ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando atletas...</p>
          </div>
        ) : (
          <>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAthletes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'Nenhum atleta encontrado para esta busca' : 'Nenhum atleta cadastrado'}
                    </td>
                  </tr>
                ) : (
                  filteredAthletes.map((athlete) => (
                    <tr key={athlete.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(athlete)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(athlete.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Athletes;