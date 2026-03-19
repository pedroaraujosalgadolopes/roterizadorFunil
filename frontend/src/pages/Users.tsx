import { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, toggleUserAtivo, type UserRecord } from '../api/auth';
import { useAppStore } from '../store/useAppStore';
import { Plus, Pencil, UserCheck, UserX, X, Save, Shield, User } from 'lucide-react';

const EMPTY_FORM = { nome: '', username: '', password: '', role: 'user' as 'admin' | 'user' };

export default function Users() {
  const { addToast } = useAppStore();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: UserRecord | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setUsers(await fetchUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, editing: null });
  };

  const openEdit = (u: UserRecord) => {
    setForm({ nome: u.nome, username: u.username, password: '', role: u.role });
    setModal({ open: true, editing: u });
  };

  const handleSave = async () => {
    if (!form.nome || !form.username) return;
    if (!modal.editing && !form.password) return;
    setSaving(true);
    try {
      if (modal.editing) {
        const updated = await updateUser(modal.editing.id, {
          nome: form.nome,
          username: form.username,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
        addToast('success', 'Usuário atualizado');
      } else {
        const created = await createUser(form);
        setUsers((prev) => [created, ...prev]);
        addToast('success', 'Usuário criado');
      }
      setModal({ open: false, editing: null });
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (u: UserRecord) => {
    try {
      const res = await toggleUserAtivo(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ativo: res.ativo } : x)));
      addToast('info', res.ativo ? 'Usuário reativado' : 'Usuário desativado');
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os acessos ao sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-cpfl-blue hover:bg-cpfl-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cpfl-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/60 text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className="px-5 py-3 text-left">Nome</th>
                <th className="px-5 py-3 text-left">Usuário</th>
                <th className="px-5 py-3 text-left">Perfil</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-800/30 transition-colors ${!u.ativo ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3 text-gray-100 font-medium">{u.nome}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{u.username}</td>
                  <td className="px-5 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-cpfl-yellow/10 text-cpfl-yellow border border-cpfl-yellow/30">
                        <Shield size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">
                        <User size={11} /> Usuário
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.ativo ? (
                      <span className="text-xs text-green-400">Ativo</span>
                    ) : (
                      <span className="text-xs text-gray-600">Inativo</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-gray-500 hover:text-cpfl-blue transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleAtivo(u)}
                        className={`transition-colors ${u.ativo ? 'text-gray-500 hover:text-red-400' : 'text-gray-600 hover:text-green-400'}`}
                        title={u.ativo ? 'Desativar' : 'Reativar'}
                      >
                        {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setModal({ open: false, editing: null })}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-gray-100">
                {modal.editing ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-500 hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-cpfl-blue"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Usuário</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-cpfl-blue"
                  placeholder="joao.silva"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Senha {modal.editing && <span className="text-gray-600">(deixe em branco para não alterar)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-cpfl-blue"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Perfil</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-cpfl-blue"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-5 border-t border-gray-800">
              <button
                onClick={() => setModal({ open: false, editing: null })}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nome || !form.username || (!modal.editing && !form.password)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cpfl-blue hover:bg-cpfl-blue/90 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                <Save size={14} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
