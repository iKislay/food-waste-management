import { getUserByEmail, createUser } from './db/actions';

interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export async function authenticateUser(email: string): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);
    if (user) {
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error during authentication:', error);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
}

export function getCurrentUser() {
  const email = localStorage.getItem('userEmail');
  const name = localStorage.getItem('userName');
  return email ? { email, name } : null;
}

export async function registerUser(email: string, name: string): Promise<User | null> {
  try {
    const user = await createUser(email, name);
    if (user) {
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error during registration:', error);
    return null;
  }
}
