import { useState } from 'react'
import { useAuth } from '@/stores/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToastStore } from '@/components/ui/Toast'

export default function MyProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToastStore()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      error('New passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Profile updated successfully')
      setIsEditing(false)
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err) {
      error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and security settings."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile', href: '/profile' }]}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="flex flex-col items-center text-center p-6">
            <div className="relative w-24 h-24 mb-4">
              <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {user?.email}
            </p>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              {user?.role}
            </div>
            {user?.department && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {user.department} Department
              </p>
            )}
          </Card>
        </div>

        {/* Right column: Form */}
        <div className="md:col-span-2 space-y-6">
          <form id="profile-form" onSubmit={handleSubmit}>
            <Card title="Personal Information" className="mb-6">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </Card>

            <Card title="Change Password">
              <div className="p-4 space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? 'Enter current password' : '••••••••'}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? 'Enter new password' : '••••••••'}
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? 'Confirm new password' : '••••••••'}
                  />
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
