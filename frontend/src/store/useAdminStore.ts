import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AdminState {
  apiKey: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setApiKey: (key: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set) => ({
        apiKey: null,
        isAuthenticated: false,
        
        setApiKey: (key) => set({ 
          apiKey: key, 
          isAuthenticated: true 
        }),
        
        logout: () => set({ 
          apiKey: null, 
          isAuthenticated: false 
        }),
      }),
      {
        name: 'pca-hijab-admin',
        partialize: (state) => ({
          apiKey: state.apiKey,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
);