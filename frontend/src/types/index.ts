// Frontend-specific types
export * from '../../../shared/types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
