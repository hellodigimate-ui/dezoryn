import type { AIGenerateType } from '../components/admin/AdminAIAssistantModal';

export interface openAIModalDetail {
  type?: AIGenerateType;
  topic?: string;
  onInsert?: (fieldType: string, value: any) => void;
}

export const openAdminAIAssistant = (detail?: openAIModalDetail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-admin-ai-assistant', { detail }));
  }
};
