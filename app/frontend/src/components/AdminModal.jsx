"import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsLoading(true);
    try {
      await onLogin(password);
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=\"sm:max-w-md bg-zinc-950 border-zinc-800\">
        <DialogHeader>
          <DialogTitle className=\"flex items-center gap-3 text-xl\">
            <div className=\"p-2 rounded-lg bg-blue-500/10\">
              <Lock className=\"text-blue-500\" size={20} />
            </div>
            <span>Admin Access</span>
          </DialogTitle>
          <DialogDescription className=\"text-zinc-500\">
            Enter your password to enable edit mode
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className=\"space-y-6 mt-4\">
          <div className=\"relative\">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=\"Enter password\"
              className=\"admin-input pr-12\"
              autoFocus
              data-testid=\"admin-password-input\"
            />
            <button
              type=\"button\"
              onClick={() => setShowPassword(!showPassword)}
              className=\"absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors\"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className=\"flex gap-3\">
            <button
              type=\"button\"
              onClick={onClose}
              className=\"btn-secondary flex-1\"
              data-testid=\"cancel-login-btn\"
            >
              Cancel
            </button>
            <button
              type=\"submit\"
              disabled={!password.trim() || isLoading}
              className=\"btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed\"
              data-testid=\"submit-login-btn\"
            >
              {isLoading ? (
                <span className=\"flex items-center justify-center gap-2\">
                  <svg className=\"spinner w-4 h-4\" viewBox=\"0 0 24 24\">
                    <circle
                      className=\"opacity-25\"
                      cx=\"12\"
                      cy=\"12\"
                      r=\"10\"
                      stroke=\"currentColor\"
                      strokeWidth=\"4\"
                      fill=\"none\"
                    />
                    <path
                      className=\"opacity-75\"
                      fill=\"currentColor\"
                      d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z\"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Unlock'
              )}
            </button>
          </div>
        </form>
        
        <p className=\"text-xs text-zinc-600 text-center mt-2\">
          Default password: mapmaker2024
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AdminModal;
"
