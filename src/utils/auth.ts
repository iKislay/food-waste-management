interface User {
  email: string;
  password: string;
  name: string;
}

interface UsersData {
  users: User[];
}

import usersData from '@/data/users.json';
const typedUsersData = usersData as UsersData;

export function authenticateUser(email: string, password: string) {
  const user = typedUsersData.users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    return user;
  }
  return null;
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
