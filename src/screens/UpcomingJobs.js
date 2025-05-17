import React, { useState, useEffect, useRef } from "react";
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
  Animated, // Add this import
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
  customers,
  selectedCustomer,
  setSelectedCustomer,
  invoices,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFilter, setJobFilter] = useState("all"); // all, scheduled, in-progress, completed
  const [searchText, setSearchText] = useState("");

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
        paymentStatus: "pending",
        invoiceId: null,
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
      Alert.alert("Error", "Please select a date and enter a job name.");
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
  // For Android, create a smaller set of times (morning, afternoon, evening)
  const simplifiedTimes = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];
  
  const buttons = [
    ...simplifiedTimes.map((time) => ({
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

  // Show customer picker
  const showCustomerPicker = () => {
    if (customers.length === 0) {
      Alert.alert(
        "No Customers",
        "You don't have any customers yet. Add customer details manually or go to Customers screen to add one.",
        [{ text: "OK" }]
      );
      return;
    }

    const buttons = [
      ...customers.map((customer) => ({
        text: `${customer.name} - ${customer.phone}`,
        onPress: () => {
          setCustomerName(customer.name);
          setCustomerPhone(customer.phone);
          setCustomerAddress(customer.address);
          setSelectedCustomer(customer);
        },
      })),
      { text: "Enter Manually", onPress: () => setSelectedCustomer(null) },
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Select Customer", "Choose an existing customer:", buttons, {
      cancelable: true,
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status || "scheduled") {
      case "scheduled":
        return "#4A90E2";
      case "in-progress":
        return "#F5A623";
      case "completed":
        return "#7ED321";
      default:
        return "#4A90E2";
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "#7ED321";
      case "pending":
        return "#F5A623";
      case "overdue":
        return "#D0021B";
      default:
        return "#F5A623";
    }
  };

  // Filter jobs based on status and search text
  const getFilteredJobs = () => {
    let filtered = scheduledJobs;

    // Filter by status
    if (jobFilter !== "all") {
      filtered = filtered.filter(
        (job) => (job.status || "scheduled") === jobFilter
      );
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (job) =>
          job.name.toLowerCase().includes(searchText.toLowerCase()) ||
          job.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          (job.description &&
            job.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
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

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.jobCard, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => navigation.navigate("JobDetails", { job: item })}
      onLongPress={() => handleJobLongPress(item)}
      delayLongPress={800}
    >
      <View style={styles.jobCardHeader}>
        <Text style={styles.jobTitle}>{item.name}</Text>
        <View style={styles.statusBadges}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
          </View>
          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor: getPaymentStatusColor(
                  item.paymentStatus || "pending"
                ),
              },
            ]}
          >
            <Text style={styles.paymentText}>
              {(item.paymentStatus || "pending").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.jobDate}>
        📅 {item.date} {item.time && `• 🕐 ${item.time}`}
      </Text>
      <Text style={styles.jobCustomer}>👤 {item.customerName}</Text>
      <Text style={styles.jobPrice}>💰 ${item.jobPrice}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Modern Header Navigation */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Customers")}
        >
          <Text style={styles.navButtonText}>👥 Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            navigation.navigate("Invoice", {
              invoices: invoices,
              customers: customers,
            })
          }
        >
          <Text style={styles.navButtonText}>📄 Invoices</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Upcoming Jobs</Text>
          <Text style={styles.subtitle}>
            Schedule and manage your installations
          </Text>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            minDate={
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            maxDate={
              new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            onDayPress={handleDayPress}
            markedDates={{
              ...scheduledJobs.reduce((acc, job) => {
                acc[job.date] = {
                  marked: true,
                  dotColor: getStatusColor(job.status),
                  selectedColor:
                    job.date === selectedDate ? "#4A90E2" : undefined,
                };
                return acc;
              }, {}),
              [selectedDate]: {
                selected: true,
                selectedColor: "#4A90E2",
                marked: scheduledJobs.some((job) => job.date === selectedDate),
                dotColor: "white",
              },
            }}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#4A90E2",
              selectedDayBackgroundColor: "#4A90E2",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#4A90E2",
              dayTextColor: "#2d2d2d",
              textDisabledColor: "#d9e1e8",
              monthTextColor: "#2d2d2d",
              indicatorColor: "#4A90E2",
              arrowColor: "#4A90E2",
            }}
          />
        </View>

        {/* Job Form */}
        {selectedDate && (
          <View style={styles.formCard}>
            {!showJobForm ? (
              <View style={styles.createJobPrompt}>
                <Text style={styles.promptText}>
                  Ready to schedule a job for {selectedDate}?
                </Text>
                <TouchableOpacity
                  style={styles.showFormButton}
                  onPress={() => setShowJobForm(true)}
                >
                  <Text style={styles.showFormButtonText}>+ Create Job</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Create New Job</Text>
                  <TouchableOpacity
                    onPress={() => setShowJobForm(false)}
                    style={styles.closeFormButton}
                  >
                    <Text style={styles.closeFormText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedDateText}>📅 {selectedDate}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Details</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Job name *"
                    value={jobName}
                    onChangeText={setJobName}
                    placeholderTextColor="#9B9B9B"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Job description"
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    placeholderTextColor="#9B9B9B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Scheduling</Text>
                  <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={showTimePicker}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        !selectedTime && styles.placeholderText,
                      ]}
                    >
                      {selectedTime || "Select time"}
                    </Text>
                    <Text style={styles.dropdownArrow}>🕐</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={showStatusPicker}
                  >
                    <Text style={styles.selectorText}>
                      {formatStatus(jobStatus)}
                    </Text>
                    <Text style={styles.dropdownArrow}>📊</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Customer Information</Text>
                  <TouchableOpacity
                    style={styles.selectCustomerButtonNew}
                    onPress={showCustomerPicker}
                  >
                    <Text style={styles.selectCustomerText}>
                      Select Existing Customer
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.input}
                    placeholder="Customer name"
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholderTextColor="#9B9B9B"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9B9B9B"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={customerAddress}
                    onChangeText={setCustomerAddress}
                    placeholderTextColor="#9B9B9B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Additional Details</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Job price"
                    value={jobPrice}
                    onChangeText={setJobPrice}
                    keyboardType="numeric"
                    placeholderTextColor="#9B9B9B"
                  />
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Job notes"
                    value={jobNotes}
                    onChangeText={setJobNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor="#9B9B9B"
                  />
                </View>

                <TouchableOpacity
                  style={styles.createJobButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.createJobButtonText}>Create Job</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Jobs Section with Filter and Search */}
        <View style={styles.jobsSection}>
          <View style={styles.jobsHeader}>
            <Text style={styles.sectionTitle}>
              Scheduled Jobs ({getFilteredJobs().length})
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, customers..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9B9B9B"
            />
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {[
              { label: "All", value: "all" },
              { label: "Scheduled", value: "scheduled" },
              { label: "In Progress", value: "in-progress" },
              { label: "Completed", value: "completed" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  jobFilter === filter.value && styles.activeFilterButton,
                ]}
                onPress={() => setJobFilter(filter.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    jobFilter === filter.value && styles.activeFilterButtonText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {getFilteredJobs().length > 0 ? (
            <FlatList
              data={getFilteredJobs()}
              renderItem={renderJobItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {jobFilter === "all" && !searchText
                  ? "No jobs scheduled yet"
                  : "No jobs match your filter"}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {jobFilter === "all" && !searchText
                  ? "Select a date above to create your first job"
                  : "Try adjusting your search or filter settings"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  navButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  navButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  mainScrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#9B9B9B",
  },
  calendarSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D2D2D",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 10,
    color: "#2D2D2D",
  },
  notesInput: {
    minHeight: 80,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    textAlignVertical: "top",
    color: "#2D2D2D",
  },
  selectorButton: {
    height: 50,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  selectorText: {
    fontSize: 16,
    color: "#2D2D2D",
  },
  placeholderText: {
    color: "#9B9B9B",
  },
  dropdownArrow: {
    fontSize: 18,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectCustomerButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectCustomerText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
  },
  createJobButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  createJobButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  jobsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 15,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D2D2D",
    flex: 1,
    marginRight: 10,
  },
  statusBadges: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  jobDate: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 6,
  },
  jobCustomer: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 6,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7ED321",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9B9B9B",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9B9B9B",
    textAlign: "center",
  },
  createJobPrompt: {
    padding: 30,
    alignItems: "center",
  },
  promptText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 15,
    textAlign: "center",
  },
  showFormButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  showFormButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  closeFormButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  closeFormText: {
    fontSize: 18,
    color: "#666666",
  },
  selectCustomerButtonNew: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 15,
    alignItems: "center",
  },
  jobsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#2D2D2D",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  filterButtonText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#666666",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
});

export default UpcomingJobs;
