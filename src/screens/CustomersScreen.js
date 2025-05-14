import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';

const CustomersScreen = ({ 
  navigation, 
  customers, 
  deleteCustomer, 
  scheduledJobs 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Get customer statistics
  const getCustomerStats = (customer) => {
    const customerJobs = scheduledJobs.filter(job => 
      job.customerPhone === customer.phone
    );
    
    const totalJobs = customerJobs.length;
    const totalSpent = customerJobs.reduce((sum, job) => 
      sum + (parseFloat(job.jobPrice) || 0), 0
    );
    const completedJobs = customerJobs.filter(job => 
      job.status === 'completed'
    ).length;
    
    return { totalJobs, totalSpent, completedJobs };
  };

  // Handle customer press
  const handleCustomerPress = (customer) => {
    const stats = getCustomerStats(customer);
    navigation.navigate('CustomerDetails', { 
      customer: { ...customer, ...stats },
      customerJobs: scheduledJobs.filter(job => job.customerPhone === customer.phone)
    });
  };

  // Handle delete customer
  const handleDeleteCustomer = (customerId, customerName) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customerName}? This will also remove all their jobs.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomer(customerId)
        }
      ]
    );
  };

  // Render customer item
  const renderCustomerItem = ({ item }) => {
    const stats = getCustomerStats(item);
    
    return (
      <TouchableOpacity
        style={styles.customerItem}
        onPress={() => handleCustomerPress(item)}
        onLongPress={() => handleDeleteCustomer(item.id, item.name)}
        delayLongPress={800}
      >
        <View style={styles.customerHeader}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
        <Text style={styles.customerAddress}>{item.address}</Text>
        <View style={styles.customerStats}>
          <Text style={styles.statText}>Jobs: {stats.totalJobs}</Text>
          <Text style={styles.statText}>Completed: {stats.completedJobs}</Text>
          <Text style={styles.statText}>Spent: ${stats.totalSpent.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Customer button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('EditCustomer', { isNewCustomer: true })}
        >
          <Text style={styles.addButtonText}>+ Add Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Customer list */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        style={styles.customerList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers yet</Text>
            <Text style={styles.emptySubtext}>Add your first customer to get started</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  addButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  customerList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customerItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default CustomersScreen;