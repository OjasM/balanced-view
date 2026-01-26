import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AzureSettings {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState<AzureSettings>({
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    apiVersion: '2024-02-15-preview',
  });

  useEffect(() => {
    const saved = localStorage.getItem('azureSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('azureSettings', JSON.stringify(settings));
    onClose();
  };

  const handleChange = (field: keyof AzureSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Azure OpenAI Settings</h2>
          <button onClick={onClose} className="btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="input-search text-sm"
              placeholder="Enter your Azure API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Endpoint
            </label>
            <input
              type="text"
              value={settings.endpoint}
              onChange={(e) => handleChange('endpoint', e.target.value)}
              className="input-search text-sm"
              placeholder="https://my-resource.openai.azure.com/"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Deployment Name
            </label>
            <input
              type="text"
              value={settings.deploymentName}
              onChange={(e) => handleChange('deploymentName', e.target.value)}
              className="input-search text-sm"
              placeholder="gpt-4o"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              API Version
            </label>
            <input
              type="text"
              value={settings.apiVersion}
              onChange={(e) => handleChange('apiVersion', e.target.value)}
              className="input-search text-sm"
              placeholder="2024-02-15-preview"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ghost border border-border rounded-xl py-3">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
