'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6'
    }}>
      <div className="glass" style={{
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        borderRadius: 'var(--radius)',
        background: 'white'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: 'var(--primary)',
            marginBottom: '0.5rem'
          }}>
            Escuela 1 de Mayo
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Usuario</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="form-group">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: 'var(--radius)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
