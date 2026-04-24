import { useState, useEffect } from 'react';
import { socketService } from '../../services/socket';
import { contactsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      handleSearch();
    } else if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery, isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults((results || []).filter((u) => u.id !== user?.id));
    setIsSearching(false);
  };

  const handleAddFriend = async (targetUser) => {
    setLoadingUsers((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      console.log('Adding friend via API, email:', targetUser.email);
      const res = await contactsAPI.add(targetUser.email);
      console.log('Add friend API response:', res.data);
      if (res.data?.success) {
        console.log('Calling socket addFriend:', targetUser.email);
        socketService.addFriend(targetUser.email);
        onContactAdded?.();
      }
    } catch (err) {
      console.error('Add friend error:', err);
    } finally {
      setSearchResults((prev) => prev.filter((u) => u.id !== targetUser.id));
      setLoadingUsers((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-start z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[320px] max-h-[500px] flex flex-col mt-16 ml-16 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold">Add Friends</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin p-2">
          {isSearching ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              {searchQuery.trim() ? 'No users found' : 'Search for users to add'}
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
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
                <button
                  onClick={() => handleAddFriend(user)}
                  disabled={loadingUsers[user.id]}
                  className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50"
                  title="Send friend request"
                >
                  {loadingUsers[user.id] ? (
                    <span className="material-symbols-rounded animate-spin text-sm">sync</span>
                  ) : (
                    <span className="material-symbols-rounded text-sm">person_add</span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}