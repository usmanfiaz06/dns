import { useState } from 'react';
import { UserPlus, Trash2, Mail, Clock, CheckCircle, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { currentUser, invitedUsers, teamMembers, inviteUser, removeInvite, removeMember } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const result = inviteUser(email);
    if (result.success) {
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to invite user');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500 mt-1">Invite team members to access and manage invoices</p>
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Invite a Team Member</h2>
        <p className="text-sm text-gray-500 mb-5">They'll receive access to view and manage invoices</p>

        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="flex-1 relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="colleague@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm"
          >
            <UserPlus size={16} />
            Invite
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
      </div>

      {/* Current User */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
          <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{currentUser?.name}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium">
            <Shield size={12} />
            {currentUser?.role === 'owner' ? 'Owner' : 'Member'}
          </div>
        </div>
      </div>

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Joined {formatDate(member.createdAt)}</span>
                  {currentUser?.role === 'owner' && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.name} from the team?`)) {
                          removeMember(member.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {invitedUsers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Pending Invites</h2>
          </div>
          <div className="space-y-3">
            {invitedUsers.map(invite => (
              <div key={invite.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{invite.email}</p>
                  <p className="text-xs text-gray-400">Invited {formatDate(invite.invitedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {invite.status === 'accepted' ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle size={14} /> Accepted
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-xs font-medium bg-yellow-50 px-2.5 py-1 rounded-lg">Pending</span>
                  )}
                  <button
                    onClick={() => removeInvite(invite.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamMembers.length === 0 && invitedUsers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No team members yet</h3>
          <p className="text-sm text-gray-500">Invite colleagues to collaborate on invoices</p>
        </div>
      )}
    </div>
  );
}
