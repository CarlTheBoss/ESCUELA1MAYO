'use server';

import { cookies } from 'next/headers';

export async function login(username: string, pass: string) {
  const validUsername = process.env.APP_USERNAME;
  const validPassword = process.env.APP_PASSWORD;

  console.log('Intento de login:', { 
    enviado: username, 
    esperado: validUsername,
    coincide: username === validUsername && pass === validPassword 
  });

  if (username === validUsername && pass === validPassword) {
    // Establecer cookie de sesión
    (await cookies()).set('auth_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });
    return { success: true };
  }

  return { success: false };
}

export async function logout() {
  (await cookies()).delete('auth_session');
}
