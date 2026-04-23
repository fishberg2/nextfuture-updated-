import { User } from '../types';

const USER_KEY = 'nsf_user';
const SESSION_KEY = 'nsf_session';

export const signUp = (name: string, email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existing = localStorage.getItem(USER_KEY);
      if (existing) {
        const users: User[] = JSON.parse(existing);
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }
      }

      const newUser: User = {
        name,
        email,
        passwordHash: btoa(password), // Mock encryption
        confirmed: false
      };

      const users = existing ? JSON.parse(existing) : [];
      users.push(newUser);
      localStorage.setItem(USER_KEY, JSON.stringify(users));
      resolve(newUser);
    }, 800);
  });
};

export const logIn = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existing = localStorage.getItem(USER_KEY);
      if (!existing) {
        reject(new Error('User not found'));
        return;
      }
      const users: User[] = JSON.parse(existing);
      const user = users.find(u => u.email === email && u.passwordHash === btoa(password));
      
      if (!user) {
        reject(new Error('Invalid credentials'));
        return;
      }
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      resolve(user);
    }, 800);
  });
};

export const logOut = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};
