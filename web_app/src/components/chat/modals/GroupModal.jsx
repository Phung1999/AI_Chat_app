import { useState } from 'react';
import { socketService } from '../../services/socket';
import useChatStore from '../../store/chatStore';

export function GroupModal({ isOpen, onClose, contacts, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length < 2 || isCreating) return;
    
    setIsCreating(true);
    const { createGroup } = useChatStore.getState();
    const conversation = await createGroup(groupName, selectedMembers);
    
    if (conversation) {
      onGroupCreated?.(conversation);
      onClose();
      setGroupName('');
      setSelectedMembers([]);
    }
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-start z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[340px] max-h-[550px] flex flex-col mt-16 ml-16 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold">Create Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b text-sm text-gray-500">
          <span>Select members (at least 2)</span>
          <span className="bg-primary text-white px-2 py-0.5 rounded-full text-xs">
            {selectedMembers.length}
          </span>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No friends yet. Add friends first!
            </div>
          ) : (
            contacts.map((user) => (
              <div
                key={user.id}
                onClick={() => toggleMember(user.id)}
                className={`flex items-center p-3 cursor-pointer transition-colors ${
                  selectedMembers.includes(user.id) ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-medium mr-3">
                  {(user.display_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.display_name || user.email}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedMembers.includes(user.id)
                      ? 'border-accent bg-accent'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedMembers.includes(user.id) && (
                    <span className="material-symbols-rounded text-white text-sm">check</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length < 2 || isCreating}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              groupName.trim() && selectedMembers.length >= 2
                ? 'bg-primary text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}