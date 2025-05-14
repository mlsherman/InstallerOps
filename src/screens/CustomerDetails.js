import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';

const CustomerDetails = ({ 
  route, 
  navigation, 
  updateCustomer, 
  deleteCustomer, 
  scheduledJobs,
  invoices 
}) => {
  const { customer, customerJobs } = route.params;

  // Get customer invoices
  const customerInvoices = invoices?.filter(inv => inv.customerId === customer.id) || [];

  // Handle edit customer
  const handleEdit = () => {
    navigation.navigate('EditCustomer', { customer, isNewCustomer: false });
  };

  // Handle delete customer
  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}? This will also remove all their jobs and invoices.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomer(customer.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28A745';
      case 'in-progress': return '#FFA500';
      case 'scheduled': return '#007AFF';
      default: return '#007AFF';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28A745';
      case 'pending': return '#FFA500';
      case 'overdue': return '#DC3545';
      default: return '#FFA500';
    }
  };

  // Render job item
  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => navigation.navigate('JobDetails', { job: item })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobName}>{item.name}</Text>
        <Text style={[styles.jobStatus, { color: getStatusColor(item.status) }]}>
          {(item.status || 'scheduled').replace('-', ' ').toUpperCase()}
        </Text>
      </View>
      <Text style={styles.jobDate}>{item.date} {item.time && `at ${item.time}`}</Text>
      <View style={styles.jobFooter}>
        <Text style={styles.jobPrice}>${item.jobPrice}</Text>
        <Text style={[styles.paymentStatus, { color: getPaymentStatusColor(item.paymentStatus) }]}>
          {(item.paymentStatus || 'pending').toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Calculate totals
  const totalSpent = customerJobs.reduce((sum, job) => sum + (parseFloat(job.jobPrice) || 0), 0);
  const completedJobs = customerJobs.filter(job => job.status === 'completed').length;
  const pendingPayments = customerJobs.filter(job => (job.paymentStatus || 'pending') === 'pending').length;

  return (
    <ScrollView style={styles.container}>
      {/* Customer Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{customer.phone}</Text>
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{customer.address}</Text>
        </View>

        {customer.email && (
          <View style={styles.contactInfo}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{customer.email}</Text>
          </View>
        )}

        {customer.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.infoLabel}>Notes:</Text>
            <Text style={styles.notes}>{customer.notes}</Text>
          </View>
        )}
      </View>

      {/* Statistics Card */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Customer Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{customerJobs.length}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedJobs}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#28A745' }]}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFA500' }]}>{pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending Payments</Text>
          </View>
        </View>
      </View>

      {/* Jobs History */}
      <View style={styles.jobsCard}>
        <Text style={styles.cardTitle}>Job History</Text>
        {customerJobs.length > 0 ? (
          <FlatList
            data={customerJobs.sort((a, b) => new Date(b.date) - new Date(a.date))}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noJobsText}>No jobs yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={() => {
            // Pre-fill customer info when scheduling new job
            navigation.navigate('UpcomingJobs', { 
              preselectedCustomer: customer 
            });
          }}
        >
          <Text style={styles.scheduleButtonText}>Schedule New Job</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Customer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    minWidth: 70,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  notesSection: {
    marginTop: 10,
  },
  notes: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  jobsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  noJobsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 20,
    gap: 10,
  },
  scheduleButton: {
    backgroundColor: '#28A745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomerDetails;