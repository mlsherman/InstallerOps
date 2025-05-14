import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from "react-native";

const JobDetails = ({ route, navigation, deleteJob, updateJob }) => {
  const { job } = route.params;

  // Get status color
  const getStatusColor = (status) => {
    switch (status || 'scheduled') {
      case 'scheduled': return '#007AFF';
      case 'in-progress': return '#FFA500';
      case 'completed': return '#28A745';
      default: return '#007AFF';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    const safeStatus = status || 'scheduled';
    return safeStatus.replace('-', ' ').charAt(0).toUpperCase() + safeStatus.replace('-', ' ').slice(1);
  };

  // Handle edit button press
  const handleEdit = () => {
    navigation.navigate('EditJob', { job, updateJob });
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteJob(job.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    console.log('Changing status from', job.status, 'to', newStatus);
    
    const updatedJob = {
      ...job,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Updated job:', updatedJob);
    updateJob(updatedJob);
    
    // Show confirmation
    Alert.alert(
      'Status Updated',
      `Job status changed to ${formatStatus(newStatus)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>
            {formatStatus(job.status)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{job.date}</Text>
        </View>

        {job.time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{job.time}</Text>
          </View>
        )}

        {job.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{job.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>{job.customerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{job.customerPhone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue}>{job.customerAddress}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>${job.jobPrice}</Text>
        </View>
        {job.jobNotes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{job.jobNotes}</Text>
          </View>
        )}
      </View>

      {/* Quick Status Change Buttons */}
      {(job.status || 'scheduled') !== 'completed' && (
        <View style={styles.statusButtons}>
          <Text style={styles.sectionTitle}>Quick Status Update</Text>
          <View style={styles.buttonRow}>
            {(job.status || 'scheduled') === 'scheduled' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#FFA500' }]}
                onPress={() => handleStatusChange('in-progress')}
              >
                <Text style={styles.buttonText}>Start Job</Text>
              </TouchableOpacity>
            )}
            {job.status === 'in-progress' && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#28A745' }]}
                onPress={() => handleStatusChange('completed')}
              >
                <Text style={styles.buttonText}>Complete Job</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Job</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 80,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
  },
  statusButtons: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default JobDetails;