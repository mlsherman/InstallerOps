import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const EditJob = ({ route, navigation }) => {
  const { job, updateJob } = route.params;

  // Initialize states with existing job data
  const [jobName, setJobName] = useState(job.name);
  const [jobDescription, setJobDescription] = useState(job.description);
  const [customerName, setCustomerName] = useState(job.customerName);
  const [customerPhone, setCustomerPhone] = useState(job.customerPhone);
  const [customerAddress, setCustomerAddress] = useState(job.customerAddress);
  const [jobPrice, setJobPrice] = useState(job.jobPrice);
  const [jobNotes, setJobNotes] = useState(job.jobNotes);
  const [selectedTime, setSelectedTime] = useState(job.time || "");
  const [jobStatus, setJobStatus] = useState(job.status || "scheduled");

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

  // Helper function to format status
  const formatStatus = (status) => {
    const safeStatus = status || "scheduled";
    return (
      safeStatus.replace("-", " ").charAt(0).toUpperCase() +
      safeStatus.replace("-", " ").slice(1)
    );
  };

  // Show time picker
  const showTimePicker = () => {
    const timeOptions = generateTimeOptions();
    const buttons = [
      ...timeOptions.map((time) => ({
        text: time,
        onPress: () => setSelectedTime(time),
      })),
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Select Time", "Choose a time for this job:", buttons, {
      cancelable: true,
    });
  };

  // Show status picker
  const showStatusPicker = () => {
    const statusOptions = [
      { label: "Scheduled", value: "scheduled" },
      { label: "In Progress", value: "in-progress" },
      { label: "Completed", value: "completed" },
    ];

    const buttons = [
      ...statusOptions.map((status) => ({
        text: status.label,
        onPress: () => setJobStatus(status.value),
      })),
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Select Status", "Choose job status:", buttons, {
      cancelable: true,
    });
  };

  const handleSave = () => {
    if (!jobName.trim()) {
      Alert.alert("Error", "Job name is required");
      return;
    }

    const updatedJob = {
      ...job,
      name: jobName,
      description: jobDescription,
      customerName,
      customerPhone,
      customerAddress,
      jobPrice,
      jobNotes,
      time: selectedTime,
      status: jobStatus,
      updatedAt: new Date().toISOString(),
    };

    updateJob(updatedJob);
    navigation.goBack();
    Alert.alert("Success", "Job updated successfully");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Job</Text>

      <Text style={styles.label}>Job Name *</Text>
      <TextInput
        style={styles.input}
        value={jobName}
        onChangeText={setJobName}
        placeholder="Enter job name"
      />

      <Text style={styles.label}>Job Description</Text>
      <TextInput
        style={styles.input}
        value={jobDescription}
        onChangeText={setJobDescription}
        placeholder="Enter job description"
        multiline
      />

      <Text style={styles.label}>Time</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => showTimePicker()}
      >
        <Text
          style={[styles.selectorText, !selectedTime && styles.placeholderText]}
        >
          {selectedTime || "Select a time"}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Status</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => showStatusPicker()}
      >
        <Text style={styles.selectorText}>{formatStatus(jobStatus)}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Enter customer name"
      />

      <Text style={styles.label}>Customer Phone</Text>
      <TextInput
        style={styles.input}
        value={customerPhone}
        onChangeText={setCustomerPhone}
        placeholder="Enter customer phone"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Customer Address</Text>
      <TextInput
        style={styles.input}
        value={customerAddress}
        onChangeText={setCustomerAddress}
        placeholder="Enter customer address"
        multiline
      />

      <Text style={styles.label}>Job Price</Text>
      <TextInput
        style={styles.input}
        value={jobPrice}
        onChangeText={setJobPrice}
        placeholder="Enter job price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Job Notes</Text>
      <TextInput
        style={styles.notesInput}
        value={jobNotes}
        onChangeText={setJobNotes}
        placeholder="Enter job notes"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View style={styles.buttonContainer}>
        <Button title="Save Changes" onPress={handleSave} />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          color="#6c757d"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: "white",
  },
  notesInput: {
    minHeight: 80,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 8,
    paddingTop: 8,
    borderRadius: 5,
    backgroundColor: "white",
    textAlignVertical: "top",
  },
  selectorButton: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
    paddingBottom: 30,
  },
});

export default EditJob;
