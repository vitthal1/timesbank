import { useState, useEffect } from 'react';
import { Star, TrendingUp, Clock, DollarSign, Edit2, Trash2, Eye, EyeOff, Package, Filter, Search, Plus, X, Image as ImageIcon, Award, BarChart3, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// ============================================
// ENHANCED TYPES
// ============================================

interface ServiceOffering {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  expected_hours: number;
  price_in_hours: number;
  status: 'active' | 'inactive' | 'booked' | 'paused';
  delivery_time_days: number;
  revisions_included: number;
  portfolio_items?: PortfolioItem[];
  requirements?: string[];
  faqs?: FAQ[];
  views_count: number;
  orders_completed: number;
  rating_average: number;
  rating_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  description?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceRequest {
  id: string;
  service_offering_id: string;
  requester_id: string;
  provider_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  requested_hours: number;
  notes?: string;
  budget_hours?: number;
  deadline?: string;
  created_at: string;
  service_offerings: Partial<ServiceOffering>;
  users: { username: string; avatar_url?: string; rating?: number };
}

interface Analytics {
  totalViews: number;
  totalOrders: number;
  conversionRate: number;
  avgRating: number;
  totalEarnings: number;
  pendingRequests: number;
  activeOfferings: number;
}

// ============================================
// MOCK DATA & SERVICES
// ============================================

const CATEGORIES = [
  { id: 'design', name: 'Design & Creative', subcategories: ['Logo Design', 'UI/UX', 'Illustration', 'Video Editing'] },
  { id: 'development', name: 'Development & Tech', subcategories: ['Web Development', 'Mobile Apps', 'WordPress', 'AI/ML'] },
  { id: 'marketing', name: 'Marketing & Sales', subcategories: ['SEO', 'Social Media', 'Content Marketing', 'Email Marketing'] },
  { id: 'writing', name: 'Writing & Translation', subcategories: ['Blog Writing', 'Copywriting', 'Technical Writing', 'Translation'] },
  { id: 'business', name: 'Business & Consulting', subcategories: ['Business Strategy', 'Financial Planning', 'Legal Consulting', 'HR'] },
];

const mockOfferings: ServiceOffering[] = [
  {
    id: '1',
    user_id: 'user123',
    title: 'Professional React Component Development',
    description: 'I will build custom, reusable React components with TypeScript, optimized for performance and accessibility.',
    category: 'development',
    subcategory: 'Web Development',
    tags: ['React', 'TypeScript', 'UI Components', 'Responsive'],
    expected_hours: 8,
    price_in_hours: 10,
    status: 'active',
    delivery_time_days: 5,
    revisions_included: 2,
    portfolio_items: [
      { id: 'p1', image_url: 'https://via.placeholder.com/300x200', title: 'Dashboard Components', description: 'Admin dashboard built with React' },
      { id: 'p2', image_url: 'https://via.placeholder.com/300x200', title: 'E-commerce UI', description: 'Shopping cart and checkout flow' },
    ],
    requirements: ['Detailed component specifications', 'Design mockups or wireframes', 'Brand guidelines (if applicable)'],
    faqs: [
      { question: 'Do you provide source code?', answer: 'Yes, you will receive complete, well-documented source code.' },
      { question: 'What frameworks do you use?', answer: 'React 18+, TypeScript, Tailwind CSS, and modern best practices.' },
    ],
    views_count: 1247,
    orders_completed: 23,
    rating_average: 4.9,
    rating_count: 19,
    featured: true,
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2025-10-01T14:30:00Z',
  },
  {
    id: '2',
    user_id: 'user123',
    title: 'Modern Logo Design with Brand Guidelines',
    description: 'Creative logo design with 3 concepts, unlimited revisions, and complete brand identity package.',
    category: 'design',
    subcategory: 'Logo Design',
    tags: ['Logo', 'Branding', 'Identity', 'Vector'],
    expected_hours: 12,
    price_in_hours: 15,
    status: 'active',
    delivery_time_days: 7,
    revisions_included: 999,
    views_count: 892,
    orders_completed: 15,
    rating_average: 5.0,
    rating_count: 15,
    featured: false,
    created_at: '2025-08-20T10:00:00Z',
    updated_at: '2025-09-28T14:30:00Z',
  },
];

const mockRequests: ServiceRequest[] = [
  {
    id: 'r1',
    service_offering_id: '1',
    requester_id: 'user456',
    provider_id: 'user123',
    status: 'pending',
    requested_hours: 8,
    notes: 'Need a custom data table component with sorting and filtering. Timeline is flexible.',
    budget_hours: 10,
    deadline: '2025-10-20',
    created_at: '2025-10-08T09:00:00Z',
    service_offerings: { title: 'Professional React Component Development' },
    users: { username: 'john_doe', avatar_url: 'https://i.pravatar.cc/150?img=1', rating: 4.8 },
  },
  {
    id: 'r2',
    service_offering_id: '1',
    requester_id: 'user789',
    provider_id: 'user123',
    status: 'pending',
    requested_hours: 12,
    notes: 'Building an admin dashboard. Need help with the layout components and charts integration.',
    budget_hours: 15,
    created_at: '2025-10-07T14:20:00Z',
    service_offerings: { title: 'Professional React Component Development' },
    users: { username: 'sarah_smith', avatar_url: 'https://i.pravatar.cc/150?img=5', rating: 4.9 },
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function ServiceOfferingsManager() {
  const [activeTab, setActiveTab] = useState<'offerings' | 'requests' | 'analytics'>('offerings');
  const [offerings, setOfferings] = useState<ServiceOffering[]>(mockOfferings);
  const [requests, setRequests] = useState<ServiceRequest[]>(mockRequests);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState<ServiceOffering | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const analytics: Analytics = {
    totalViews: offerings.reduce((sum, o) => sum + o.views_count, 0),
    totalOrders: offerings.reduce((sum, o) => sum + o.orders_completed, 0),
    conversionRate: offerings.reduce((sum, o) => sum + o.views_count, 0) > 0 
      ? (offerings.reduce((sum, o) => sum + o.orders_completed, 0) / offerings.reduce((sum, o) => sum + o.views_count, 0) * 100) 
      : 0,
    avgRating: offerings.length > 0 
      ? offerings.reduce((sum, o) => sum + o.rating_average, 0) / offerings.length 
      : 0,
    totalEarnings: offerings.reduce((sum, o) => sum + (o.orders_completed * o.price_in_hours), 0),
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    activeOfferings: offerings.filter(o => o.status === 'active').length,
  };

  const filteredOfferings = offerings.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || o.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Service Management</h1>
              <p className="text-sm text-slate-600 mt-1">Manage your offerings, track requests, and grow your business</p>
            </div>
            <button
              onClick={() => { setEditingOffering(null); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Service
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnalyticsCard icon={Eye} label="Total Views" value={analytics.totalViews} color="blue" />
          <AnalyticsCard icon={Package} label="Completed Orders" value={analytics.totalOrders} color="green" />
          <AnalyticsCard icon={TrendingUp} label="Conversion Rate" value={`${analytics.conversionRate.toFixed(1)}%`} color="purple" />
          <AnalyticsCard icon={Clock} label="Time Credits Earned" value={`${analytics.totalEarnings}h`} color="orange" />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <TabButton active={activeTab === 'offerings'} onClick={() => setActiveTab('offerings')} icon={Package}>
            My Services ({offerings.length})
          </TabButton>
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={Users}>
            Requests ({requests.filter(r => r.status === 'pending').length})
          </TabButton>
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart3}>
            Analytics
          </TabButton>
        </div>

        {/* Offerings Tab */}
        {activeTab === 'offerings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Offerings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOfferings.map(offering => (
                <OfferingCard
                  key={offering.id}
                  offering={offering}
                  onEdit={() => { setEditingOffering(offering); setShowCreateModal(true); }}
                  onDelete={(id) => setOfferings(prev => prev.filter(o => o.id !== id))}
                  onToggleStatus={(id) => setOfferings(prev => prev.map(o => 
                    o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o
                  ))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                onAccept={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r))}
                onReject={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))}
              />
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard offerings={offerings} analytics={analytics} />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateEditModal
          offering={editingOffering}
          onClose={() => { setShowCreateModal(false); setEditingOffering(null); }}
          onSave={(offering) => {
            if (editingOffering) {
              setOfferings(prev => prev.map(o => o.id === offering.id ? offering : o));
            } else {
              setOfferings(prev => [{ ...offering, id: Date.now().toString() }, ...prev]);
            }
            setShowCreateModal(false);
            setEditingOffering(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function AnalyticsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function OfferingCard({ offering, onEdit, onDelete, onToggleStatus }: any) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-slate-100 text-slate-800',
    booked: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {offering.featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Featured Service</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{offering.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{offering.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[offering.status]}`}>
            {offering.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {offering.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-600">Duration</p>
              <p className="text-sm font-semibold text-slate-900">{offering.expected_hours}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-600">Price</p>
              <p className="text-sm font-semibold text-slate-900">{offering.price_in_hours}h</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">{offering.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">{offering.orders_completed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-slate-900">{offering.rating_average}</span>
              <span className="text-xs text-slate-600">({offering.rating_count})</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(offering.id)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {offering.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(offering.id)}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onReject }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <img src={request.users.avatar_url} alt="" className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">{request.users.username}</h3>
              <p className="text-sm text-slate-600">Requesting: {request.service_offerings.title}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{request.users.rating}</span>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-700">{request.notes}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Hours Requested</p>
              <p className="text-sm font-semibold text-slate-900">{request.requested_hours}h</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Budget</p>
              <p className="text-sm font-semibold text-slate-900">{request.budget_hours}h</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Deadline</p>
              <p className="text-sm font-semibold text-slate-900">{request.deadline || 'Flexible'}</p>
            </div>
          </div>

          {request.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(request.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Accept Request
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsDashboard({ offerings, analytics }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</p>
            <p className="text-sm text-slate-600 mt-1">Total Orders</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{analytics.totalEarnings}h</p>
            <p className="text-sm text-slate-600 mt-1">Credits Earned</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{analytics.avgRating.toFixed(1)}</p>
            <p className="text-sm text-slate-600 mt-1">Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Services</h3>
        <div className="space-y-3">
          {offerings.sort((a, b) => b.orders_completed - a.orders_completed).slice(0, 5).map((offering, i) => (
            <div key={offering.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                <div>
                  <p className="font-medium text-slate-900">{offering.title}</p>
                  <p className="text-sm text-slate-600">{offering.orders_completed} orders • {offering.views_count} views</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{offering.price_in_hours * offering.orders_completed}h</p>
                <p className="text-xs text-slate-600">earned</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateEditModal({ offering, onClose, onSave }: any) {
  const [formData, setFormData] = useState<Partial<ServiceOffering>>(offering || {
    title: '',
    description: '',
    category: 'development',
    subcategory: '',
    tags: [],
    expected_hours: 1,
    price_in_hours: 1,
    delivery_time_days: 3,
    revisions_included: 1,
    status: 'active',
    requirements: [''],
    faqs: [{ question: '', answer: '' }],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      views_count: offering?.views_count || 0,
      orders_completed: offering?.orders_completed || 0,
      rating_average: offering?.rating_average || 0,
      rating_count: offering?.rating_count || 0,
      featured: offering?.featured || false,
      created_at: offering?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const addTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {offering ? 'Edit Service' : 'Create New Service'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Professional React Component Development"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you'll deliver and what makes your service unique..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select subcategory</option>
                  {CATEGORIES.find(c => c.id === formData.category)?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Delivery
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Hours *</label>
                <input
                  type="number"
                  value={formData.expected_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_hours: parseFloat(e.target.value) }))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price (Time Credits) *</label>
                <input
                  type="number"
                  value={formData.price_in_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_in_hours: parseFloat(e.target.value) }))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Time (Days) *</label>
                <input
                  type="number"
                  value={formData.delivery_time_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) }))}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Revisions Included *</label>
                <input
                  type="number"
                  value={formData.revisions_included}
                  onChange={(e) => setFormData(prev => ({ ...prev, revisions_included: parseInt(e.target.value) }))}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Requirements from Buyer
            </h3>
            {formData.requirements?.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => {
                    const newReqs = [...(formData.requirements || [])];
                    newReqs[i] = e.target.value;
                    setFormData(prev => ({ ...prev, requirements: newReqs }));
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Design mockups or wireframes"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    requirements: prev.requirements?.filter((_, idx) => idx !== i) 
                  }))}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                requirements: [...(prev.requirements || []), ''] 
              }))}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              + Add Requirement
            </button>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>
            {formData.faqs?.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const newFaqs = [...(formData.faqs || [])];
                    newFaqs[i].question = e.target.value;
                    setFormData(prev => ({ ...prev, faqs: newFaqs }));
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Question"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaqs = [...(formData.faqs || [])];
                    newFaqs[i].answer = e.target.value;
                    setFormData(prev => ({ ...prev, faqs: newFaqs }));
                  }}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Answer"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    faqs: prev.faqs?.filter((_, idx) => idx !== i) 
                  }))}
                  className="text-red-600 text-sm hover:text-red-700"
                >
                  Remove FAQ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                faqs: [...(prev.faqs || []), { question: '', answer: '' }] 
              }))}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              + Add FAQ
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              {offering ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}