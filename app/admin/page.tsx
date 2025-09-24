// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getIssues, updateIssueStatus, subscribeToIssues, Issue } from '../../lib/supabase';

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load issues from database
  const loadIssues = async () => {
    setLoading(true);
    const { data, error } = await getIssues();
    
    if (error) {
      console.error('Error loading issues:', error);
    } else {
      console.log('Loaded issues:', data);
      setIssues(data || []);
    }
    setLoading(false);
  };

  // Setup real-time subscription
  useEffect(() => {
    loadIssues();
    
    // Subscribe to real-time changes
    const subscription = subscribeToIssues((payload) => {
      console.log('Real-time update:', payload);
      loadIssues(); // Reload all issues when changes occur
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter issues based on selected filters
  useEffect(() => {
    let filtered = issues;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(issue => issue.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === filterCategory);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filterPriority);
    }
    
    setFilteredIssues(filtered);
  }, [issues, filterStatus, filterCategory, filterPriority]);

  // Get statistics
  const stats = {
    total: issues.length,
    new: issues.filter(i => i.status === 'new').length,
    assigned: issues.filter(i => i.status === 'assigned').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    highPriority: issues.filter(i => i.priority === 'high').length,
  };

  // Update issue status in database
  const handleUpdateIssueStatus = async (issueId: string, newStatus: Issue['status']) => {
    const { data, error } = await updateIssueStatus(issueId, newStatus);
    
    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } else {
      console.log('Status updated:', data);
      loadIssues(); // Reload to get updated data
    }
  };

  // Assign issue to worker
  const assignIssue = async (issueId: string, workerId: string) => {
    const { data, error } = await updateIssueStatus(issueId, 'assigned', workerId);
    
    if (error) {
      console.error('Error assigning issue:', error);
      alert('Failed to assign issue');
    } else {
      console.log('Issue assigned:', data);
      loadIssues(); // Reload to get updated data
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'assigned': return 'text-purple-600 bg-purple-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pothole': return '🕳️';
      case 'streetlight': return '💡';
      case 'garbage': return '🗑️';
      case 'traffic': return '🚦';
      case 'graffiti': return '🎨';
      case 'sidewalk': return '🚶';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏛️ Municipal Dashboard</h1>
              <p className="text-gray-600">Manage civic issues and track city improvements</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                📱 Citizen Portal
              </a>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">
                📊 Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-red-600">{stats.new}</div>
            <div className="text-sm text-gray-600">New Reports</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-purple-600">{stats.assigned}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Filter Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Pothole</option>
                <option value="streetlight">Streetlight</option>
                <option value="garbage">Garbage</option>
                <option value="traffic">Traffic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setFilterPriority('all');
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading issues from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedIssue(issue);
                  setShowModal(true);
                }}
              >
                {/* Issue Image */}
                {issue.image_url && (
                  <img
                    src={issue.image_url}
                    alt={issue.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}
                
                {/* Issue Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <span className="font-semibold text-gray-900">{issue.title}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">📍 {issue.location_address}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>🏢 {issue.department}</span>
                      <span>📅 {new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No issues found */}
        {!loading && filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedIssue.image_url && (
                <img
                  src={selectedIssue.image_url}
                  alt={selectedIssue.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getCategoryIcon(selectedIssue.category)} {selectedIssue.title}
                  </h3>
                  <p className="text-gray-600">{selectedIssue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">📍 {selectedIssue.location_address}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Department:</span>
                  <p className="text-gray-600">🏢 {selectedIssue.department}</p>
                </div>
                
                {selectedIssue.assigned_to && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Assigned to:</span>
                    <p className="text-gray-600">👷 {selectedIssue.assigned_to}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>Created: {new Date(selectedIssue.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedIssue.updated_at).toLocaleString()}</div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    handleUpdateIssueStatus(selectedIssue.id, 'assigned');
                    setShowModal(false);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  disabled={selectedIssue.status === 'assigned'}
                >
                  👤 Assign Task
                </button>
                <button
                  onClick={() => {
                    handleUpdateIssueStatus(selectedIssue.id, 'in-progress');
                    setShowModal(false);
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                  disabled={selectedIssue.status === 'in-progress'}
                >
                  🔄 Mark In Progress
                </button>
                <button
                  onClick={() => {
                    handleUpdateIssueStatus(selectedIssue.id, 'resolved');
                    setShowModal(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  disabled={selectedIssue.status === 'resolved'}
                >
                  ✅ Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}