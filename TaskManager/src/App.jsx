import React, { useState, useEffect } from 'react';
import './App.css';

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Título:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Descrição:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Status:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em andamento</option>
                    <option value="concluída">Concluída</option>
                </select>
            </div>
            <button type="submit">Salvar</button>
            {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
        </form>
    );
};

// Componente de Listagem de Tarefas
const TarefaList = ({ tarefas, onAtualizarStatus, onDelete }) => {
    return (
        <div>
            <h2>Lista de Tarefas</h2>
            <ul>
                {tarefas.map((tarefa) => (
                    <li key={tarefa.id}>
                        <h3>{tarefa.title}</h3>
                        <p>{tarefa.description}</p>
                        <p>Status: {tarefa.status}</p>
                        {tarefa.status !== 'concluída' && (
                            <button onClick={() => onAtualizarStatus(tarefa)}>
                                {tarefa.status === 'pendente' ? 'Iniciar' : 'Concluir'}
                            </button>
                        )}
                        <button onClick={() => onDelete(tarefa.id)}>Excluir</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Componente Principal da Aplicação
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
        <div className="App">
            <h1>Gerenciador de Tarefas</h1>
            <TarefaForm
                tarefa={tarefaEditando}
                onSubmit={handleSubmit}
                onCancel={() => setTarefaEditando(null)}
            />
            <TarefaList
                tarefas={tarefas}
                onAtualizarStatus={atualizarStatus}
                onDelete={excluirTarefa}
            />
        </div>
    );
};

export default App;