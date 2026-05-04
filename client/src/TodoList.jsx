import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';

const TodoList = ({ setIsAuthenticated }) => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      if (err.message === 'REFRESH_FAILED' || err.message.includes('No access token')) {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    try {
      const todo = await createTodo(newTitle);
      setTodos([todo, ...todos]);
      setNewTitle('');
    } catch (err) {
      if (err.message === 'REFRESH_FAILED') {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setError(err.message);
      }
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedTodo = await updateTodo(id, { completed: !currentStatus });
      setTodos(todos.map(t => t._id === id ? updatedTodo : t));
    } catch (err) {
      if (err.message === 'REFRESH_FAILED') {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setError(err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      if (err.message === 'REFRESH_FAILED') {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '650px', width: '100%' }}>
      <div className="todo-header">
        <h2>My Tasks</h2>
        <button 
          className="btn-secondary" 
          style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
          onClick={() => navigate('/profile')}
        >
          &larr; Back to Profile
        </button>
      </div>
      
      {error && <div className="error-text">{error}</div>}
      
      <form onSubmit={handleCreate} className="todo-input-group">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done today?"
        />
        <button type="submit" style={{ width: '120px' }}>Add Task</button>
      </form>

      <div className="todo-list-container">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading your secure tasks...</p>
        ) : todos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <svg style={{ width: '48px', height: '48px', marginBottom: '1rem', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <p>You're all caught up! Add a task above.</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <input 
                  type="checkbox" 
                  className="custom-checkbox"
                  checked={todo.completed} 
                  onChange={() => handleToggle(todo._id, todo.completed)}
                />
                <span className="todo-title">
                  {todo.title}
                </span>
              </div>
              <button 
                className="btn-icon" 
                onClick={() => handleDelete(todo._id)}
                title="Delete task"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
