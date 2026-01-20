"import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

const AdminModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setIsLoading(true)
    try {
      await onLogin(password)
    } finally {
      setIsLoading(false)
      setPassword('')
    }
  }

  return (
    <div className=\"modal-overlay\" onClick={onClose}>
      <div className=\"modal-content\" onClick={(e) => e.stopPropagation()}>
        <div className=\"flex items-center gap-3 mb-4\">
          <div className=\"p-2 rounded-lg\" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Lock className=\"text-blue-500\" size={20} />
          </div>
          <div>
            <h2 className=\"text-xl font-semibold text-white\">Admin Access</h2>
            <p className=\"text-sm text-zinc-500\">Enter password to enable edit mode</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className=\"space-y-4\">
          <div className=\"relative\">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=\"Enter password\"
              className=\"admin-input pr-12\"
              autoFocus
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
            <button type=\"button\" onClick={onClose} className=\"btn-secondary flex-1\">
              Cancel
            </button>
            <button type=\"submit\" disabled={!password.trim() || isLoading} className=\"btn-primary flex-1\">
              {isLoading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminModal
"
