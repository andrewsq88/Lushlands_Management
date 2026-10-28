import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, User, AlertCircle, CheckCircle, Clock, ExternalLink, Search, Filter } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { PaymentRequestModal } from './PaymentRequestModal';
import { PaymentListModal } from './PaymentListModal';
import { AdSenseBanner } from './AdSenseBanner';

export function Payments() {
  const { payments, pendingPayments, paidPayments, loading, updatePayment } = usePayments();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPaymentListModal, setShowPaymentListModal] = useState(false);
  const [paymentListTitle, setPaymentListTitle] = useState('');
  const [paymentListData, setPaymentListData] = useState<any[]>([]);

  // Check for payment success/cancel in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const paymentId = urlParams.get('payment_id');

    if (success === 'true' && paymentId) {
      // Update payment status to paid
      updatePayment(paymentId, { status: 'paid' });
      setSuccessMessage('Payment completed successfully!');
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } else if (canceled === 'true') {
      setSuccessMessage('Payment was canceled.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [updatePayment]);

  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.tenants?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.tenants?.properties?.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && payment.status === 'paid') ||
      (statusFilter === 'pending' && payment.status === 'pending' && !isOverdue(payment.due_date, payment.status)) ||
      (statusFilter === 'overdue' && isOverdue(payment.due_date, payment.status));
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatsCardClick = (type: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const paidThisMonth = paidPayments.filter(p => {
      const paymentDate = new Date(p.updated_at);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    switch (type) {
      case 'pending':
        setPaymentListTitle('Pending Payments');
        setPaymentListData(pendingPayments);
        setShowPaymentListModal(true);
        break;
      case 'paid-month':
        setPaymentListTitle('Paid Payments This Month');
        setPaymentListData(paidThisMonth);
        setShowPaymentListModal(true);
        break;
      case 'outstanding':
        setPaymentListTitle('Outstanding Payments');
        setPaymentListData(pendingPayments);
        setShowPaymentListModal(true);
        break;
      case 'collected':
        setPaymentListTitle('Collected Payments This Month');
        setPaymentListData(paidThisMonth);
        setShowPaymentListModal(true);
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      rent: 'bg-blue-100 text-blue-800',
      mortgage: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-orange-100 text-orange-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate) return false;
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  const totalOutstanding = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaidThisMonth = paidPayments
    .filter(p => {
      const paymentDate = new Date(p.updated_at);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-2 text-gray-600">Manage rent, mortgage, and maintenance payments with Stripe</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Send Payment Request
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="rent">Rent</option>
                <option value="mortgage">Mortgage</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button 
          onClick={() => handleStatsCardClick('pending')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-yellow-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('paid-month')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid This Month</p>
              <p className="text-2xl font-bold text-gray-900">{paidPayments.filter(p => {
                const paymentDate = new Date(p.updated_at);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
              }).length}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('outstanding')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleStatsCardClick('collected')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collected This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPaidThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Stripe Integration Notice - Updated */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ExternalLink className="h-5 w-5 text-purple-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-purple-900">Secure Payments with Stripe</h3>
            <p className="text-sm text-purple-700 mt-1">
              All payments are processed securely through Stripe. Tenants can pay with credit cards, debit cards, or bank transfers.
            </p>
          </div>
        </div>
      </div>

      {/* AdSense Banner - Between stats and payments list */}
      <AdSenseBanner 
        slot="7890123456" 
        format="horizontal"
        className="max-w-4xl mx-auto"
      />

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {payments.length === 0 ? 'No payments yet' : 'No payments found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {payments.length === 0 
                ? 'Start by sending your first payment request'
                : searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No payments to display'
              }
            </p>
            {payments.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Send Payment Request
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isOverdue(payment.due_date, payment.status) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.tenants?.name || 'Unknown Tenant'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.tenants?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.tenants?.properties?.address || 'No Property'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(payment.type)}`}>
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${Number(payment.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${
                          isOverdue(payment.due_date, payment.status) 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-900'
                        }`}>
                          {formatDate(payment.due_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 font-mono">
                        {payment.stripe_payment_id ? (
                          <span title={payment.stripe_payment_id}>
                            {payment.stripe_payment_id.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">No Stripe ID</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Request Modal */}
      {showModal && (
        <PaymentRequestModal onClose={() => setShowModal(false)} />
      )}

      {/* Payment List Modal */}
      {showPaymentListModal && (
        <PaymentListModal
          title={paymentListTitle}
          payments={paymentListData}
          onClose={() => setShowPaymentListModal(false)}
        />
      )}
    </div>
  );
}