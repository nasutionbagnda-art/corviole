/**
 * Opti'Noisy Pizzeria - Gestion des comptes utilisateurs
 */

class AuthManager {
  constructor() {
    this.usersKey = 'optinoisy_users';
    this.sessionKey = 'optinoisy_current_user';
    this.initDefaultUsers();
  }

  initDefaultUsers() {
    if (!localStorage.getItem(this.usersKey)) {
      const defaultUsers = [
        {
          id: 'user_demo',
          firstName: 'Alexandre',
          lastName: 'Dupont',
          email: 'etudiant@mmi.fr',
          phone: '06 12 34 56 78',
          address: '4 Rue de l\'Université, 78140 Vélizy-Villacoublay',
          password: 'password123',
          orders: [
            {
              id: 'CMD-9021',
              date: '2026-10-06T19:30:00',
              items: [
                { name: 'Margherita', sizeName: 'Moyenne (31 cm)', quantity: 1, price: 13.50 },
                { name: 'Salade César', sizeName: 'Standard', quantity: 1, price: 7.90 }
              ],
              total: 21.40,
              status: 'Livrée'
            }
          ]
        }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
    }
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    } catch (e) {
      return [];
    }
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.sessionKey));
    } catch (e) {
      return null;
    }
  }

  register(userData) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'Un compte existe déjà avec cette adresse email.' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address || '',
      password: userData.password,
      orders: []
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser, message: 'Compte créé avec succès !' };
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    this.setCurrentUser(user);
    return { success: true, user, message: `Bienvenue, ${user.firstName} !` };
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
  }

  setCurrentUser(user) {
    // Ne pas stocker le mot de passe dans la session active
    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(this.sessionKey, JSON.stringify(safeUser));
    window.dispatchEvent(new CustomEvent('authChanged', { detail: safeUser }));
  }

  updateProfile(updateData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: 'Aucun utilisateur connecté.' };

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updateData };
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      this.setCurrentUser(users[idx]);
      return { success: true, message: 'Profil mis à jour !' };
    }
    return { success: false, message: 'Erreur lors de la mise à jour.' };
  }

  addOrderToHistory(order) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx > -1) {
      if (!users[idx].orders) users[idx].orders = [];
      users[idx].orders.unshift(order);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      this.setCurrentUser(users[idx]);
    }
  }
}

window.authManager = new AuthManager();
