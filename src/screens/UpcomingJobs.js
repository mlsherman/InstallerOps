import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";

const UpcomingJobs = ({
  navigation,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  jobPrice,
  setJobPrice,
  jobNotes,
  setJobNotes,
  scheduledJobs,
  setScheduledJobs,
  selectedDate,
  setSelectedDate,
  jobName,
  setJobName,
  jobDescription,
  setJobDescription,
  selectedTime,
  setSelectedTime,
  jobStatus,
  setJobStatus,
  deleteJob,
  updateJob,
}) => {
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleSubmit = () => {
    if (selectedDate && jobName) {
      const newJob = {
        id: Date.now().toString(),
        date: selectedDate,
        time: selectedTime,
        name: jobName,
        description: jobDescription,
        customerName,
        customerPhone,
        customerAddress,
        jobPrice,
        jobNotes,
        status: jobStatus,
        createdAt: new Date().toISOString(),
      };

      setScheduledJobs((prevJobs) => [...prevJobs, newJob]);

      // Clear all form fields after submission
      setJobName("");
      setJobDescription("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setJobPrice("");
      setJobNotes("");
      setSelectedTime("");
      setJobStatus("scheduled");

      console.log("Job scheduled:", newJob);
    } else {
      alert("Please select a date and enter a job name.");
    }
  };

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

  // Get status color
  const getStatusColor = (status) => {
    switch (status || "scheduled") {
      case "scheduled":
        return "#007AFF";
      case "in-progress":
        return "#FFA500";
      case "completed":
        return "#28A745";
      default:
        return "#007AFF";
    }
  };

  // Long press handler for jobs
  const handleJobLongPress = (job) => {
    Alert.alert("Job Options", `What would you like to do with ${job.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => navigation.navigate("EditJob", { job, updateJob }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(job.id),
      },
    ]);
  };

  // Confirm delete function
  const confirmDelete = (jobId) => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteJob(jobId),
      },
    ]);
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <Text style={styles.title}>Upcoming Jobs</Text>

      <Calendar
        current={"2025-05-12"}
        minDate={"2025-05-10"}
        maxDate={"2025-06-30"}
        onDayPress={handleDayPress}
        markedDates={{
          ...scheduledJobs.reduce((acc, job) => {
            acc[job.date] = {
              marked: true,
              dotColor: getStatusColor(job.status),
              selectedColor: job.date === selectedDate ? "green" : undefined,
            };
            return acc;
          }, {}),
          [selectedDate]: {
            selected: true,
            selectedColor: "green",
            marked: scheduledJobs.some((job) => job.date === selectedDate),
            dotColor: "blue",
          },
        }}
      />

      {selectedDate && (
        <View style={styles.formContainer}>
          <Text style={styles.dateText}>Selected Date: {selectedDate}</Text>

          <Text style={styles.label}>Job Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter job name"
            value={jobName}
            onChangeText={setJobName}
          />

          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter job description"
            value={jobDescription}
            onChangeText={setJobDescription}
          />

          <Text style={styles.label}>Select Time:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => showTimePicker()}
          >
            <Text
              style={[
                styles.selectorText,
                !selectedTime && styles.placeholderText,
              ]}
            >
              {selectedTime || "Select a time"}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Job Status:</Text>
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
            placeholder="Enter customer name"
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={styles.label}>Customer Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer phone"
            value={customerPhone}
            onChangeText={setCustomerPhone}
          />

          <Text style={styles.label}>Customer Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer address"
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />

          <Text style={styles.label}>Job Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter job price"
            value={jobPrice}
            onChangeText={setJobPrice}
          />

          <Text style={styles.label}>Job Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter job notes"
            value={jobNotes}
            onChangeText={setJobNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.submitButtonContainer}>
            <Button title="Schedule Job" onPress={handleSubmit} />
          </View>
        </View>
      )}

      <View style={styles.jobsList}>
        <Text style={styles.jobsTitle}>Scheduled Jobs:</Text>
        {scheduledJobs.length > 0 ? (
          scheduledJobs.map((job, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.jobItem,
                { borderLeftColor: getStatusColor(job.status) },
              ]}
              onPress={() => navigation.navigate("JobDetails", { job })}
              onLongPress={() => handleJobLongPress(job)}
              delayLongPress={800}
            >
              <View style={styles.jobHeader}>
                <Text style={styles.jobName}>{job.name}</Text>
                <Text
                  style={[
                    styles.jobStatus,
                    { color: getStatusColor(job.status) },
                  ]}
                >
                  {formatStatus(job.status)}
                </Text>
              </View>
              <Text style={styles.jobDate}>
                {job.date} {job.time && `at ${job.time}`}
              </Text>
              <Text style={styles.jobCustomer}>{job.customerName}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No jobs scheduled yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
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
  dateText: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  jobsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  jobItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#333",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  jobName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  jobDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  jobCustomer: {
    fontSize: 14,
    color: "#666",
  },
  submitButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
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
});

export default UpcomingJobs;
