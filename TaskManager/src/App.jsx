import React, { useState, useEffect } from 'react';

// URL da API (substitua pela sua URL real)
const API_URL = 'https://3st1xsk3vd.execute-api.us-east-1.amazonaws.com/prod/GerenciarTarefas';

// Componente de Formulário de Tarefa
const TarefaForm = ({ tarefa, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(tarefa?.title || '');
    const [description, setDescription] = useState(tarefa?.description || '');
    const [status, setStatus] = useState(tarefa?.status || 'pendente');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tarefaData = { title, description, status };

        try {
            if (tarefa?.id) {
                // Atualizar tarefa existente
                await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: tarefa.id, ...tarefaData }), // Envia todos os campos
                });
            } else {
                // Criar nova tarefa
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tarefaData),
                });
            }
            onSubmit(); // Notifica o componente pai que a operação foi concluída
        } catch (error) {
            console.error('Erro ao salvar a tarefa:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full">
            <div className="mb-4">
                <label className="block text-gray-200 font-bold mb-2">Título:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200 font-bold mb-2">Descrição:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200 font-bold mb-2">Status:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
                >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em andamento</option>
                    <option value="concluída">Concluída</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Salvar
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

// Componente de Listagem de Tarefas
const TarefaList = ({ tarefas, onAtualizarStatus, onDelete }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-h-96 overflow-y-auto">
            <ul>
                {tarefas.map((tarefa) => (
                    <li key={tarefa.id} className="mb-4 p-4 border border-gray-600 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-200">{tarefa.title}</h3>
                        <p className="text-gray-300">{tarefa.description}</p>
                        <p className="text-gray-400">Status: {tarefa.status}</p>
                        <div className="mt-2 flex gap-2">
                            {tarefa.status !== 'concluída' && (
                                <button
                                    onClick={() => onAtualizarStatus(tarefa)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    {tarefa.status === 'pendente' ? 'Iniciar' : 'Concluir'}
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(tarefa.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const App = () => {
    const [tarefas, setTarefas] = useState([]);
    const [tarefaEditando, setTarefaEditando] = useState(null);

    // Carregar tarefas ao iniciar
    useEffect(() => {
        carregarTarefas();
    }, []);

    // Função para carregar tarefas
    const carregarTarefas = async () => {
        try {
            const response = await fetch(API_URL, { method: 'GET' });
            const data = await response.json();
            setTarefas(data);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    };

    // Função para atualizar o status da tarefa
    const atualizarStatus = async (tarefa) => {
        try {
            let novoStatus;
            if (tarefa.status === 'pendente') {
                novoStatus = 'em andamento';
            } else if (tarefa.status === 'em andamento') {
                novoStatus = 'concluída';
            }

            // Atualiza apenas o status no back-end
            await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tarefa.id, status: novoStatus }), // Envia apenas o ID e o novo status
            });

            // Recarrega as tarefas após a atualização
            await carregarTarefas();
        } catch (error) {
            console.error('Erro ao atualizar status da tarefa:', error);
        }
    };

    // Função para excluir uma tarefa
    const excluirTarefa = async (id) => {
        try {
            await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            setTarefas(tarefas.filter((t) => t.id !== id)); // Atualiza o estado local
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = async () => {
        await carregarTarefas(); // Recarrega as tarefas após criar/atualizar
        setTarefaEditando(null); // Limpa o formulário de edição
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-200">Gerenciador de Tarefas</h1>
                <div className="flex justify-center gap-8">
                    {/* Seção do Formulário */}
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-200">Criar Tarefa</h2>
                        <TarefaForm
                            tarefa={tarefaEditando}
                            onSubmit={handleSubmit}
                            onCancel={() => setTarefaEditando(null)}
                        />
                    </div>

                    {/* Seção da Lista de Tarefas */}
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-200">Lista de Tarefas</h2>
                        <TarefaList
                            tarefas={tarefas}
                            onAtualizarStatus={atualizarStatus}
                            onDelete={excluirTarefa}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;