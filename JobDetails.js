import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import PhotoGallery from "./src/components/PhotoGallery";

const JobDetails = ({
  route,
  navigation,
  deleteJob,
  updateJob,
  createInvoice,
  invoices,
  customers,
}) => {
  const { job } = route.params;

  // Local state for photos to ensure immediate updates
  const [currentJob, setCurrentJob] = useState(job);

  // Update local state when route params change
  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  // Check if invoice already exists for this job
  const existingInvoice = invoices?.find((inv) => inv.jobId === currentJob.id);

  // Handle photo updates
  const handlePhotosChange = (newPhotos) => {
    console.log("Photos changed:", newPhotos); // Debug log
    const updatedJob = {
      ...currentJob,
      photos: newPhotos,
      updatedAt: new Date().toISOString(),
    };
    console.log("Updated job with photos:", updatedJob); // Debug log

    // Update local state immediately for instant UI update
    setCurrentJob(updatedJob);

    // Update the parent state
    updateJob(updatedJob);
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

  // Format status for display
  const formatStatus = (status) => {
    const safeStatus = status || "scheduled";
    return (
      safeStatus.replace("-", " ").charAt(0).toUpperCase() +
      safeStatus.replace("-", " ").slice(1)
    );
  };

  // Handle edit button press
  const handleEdit = () => {
    navigation.navigate("EditJob", { job: currentJob, updateJob });
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteJob(currentJob.id);
          navigation.goBack();
        },
      },
    ]);
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    console.log("Changing status from", currentJob.status, "to", newStatus);

    const updatedJob = {
      ...currentJob,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    console.log("Updated job:", updatedJob);
    setCurrentJob(updatedJob);
    updateJob(updatedJob);

    // Show confirmation
    Alert.alert(
      "Status Updated",
      `Job status changed to ${formatStatus(newStatus)}`,
      [{ text: "OK" }]
    );
  };

  // NEW: Handle create invoice
  const handleCreateInvoice = () => {
    if (!currentJob.jobPrice || parseFloat(currentJob.jobPrice) === 0) {
      Alert.alert(
        "Cannot Create Invoice",
        "This job has no price set. Please edit the job and add a price first.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Create Invoice",
      `Create an invoice for ${currentJob.jobPrice}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: () => {
            const invoice = createInvoice(currentJob);
            Alert.alert(
              "Invoice Created",
              `Invoice #${invoice.id.slice(-6)} has been created for ${
                currentJob.customerName
              }`,
              [
                { text: "OK" },
                {
                  text: "View Invoice",
                  onPress: () =>
                    navigation.navigate("Invoice", {
                      invoices: [...(invoices || []), invoice],
                      customers,
                    }),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // NEW: Handle view invoice
  const handleViewInvoice = () => {
    if (existingInvoice) {
      navigation.navigate("Invoice", {
        invoices: invoices || [],
        customers,
        selectedInvoiceId: existingInvoice.id,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentJob.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(currentJob.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {formatStatus(currentJob.status)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{currentJob.date}</Text>
        </View>

        {currentJob.time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{currentJob.time}</Text>
          </View>
        )}

        {currentJob.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{currentJob.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>{currentJob.customerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{currentJob.customerPhone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue}>{currentJob.customerAddress}</Text>
        </View>
      </View>

      {/* PHOTO GALLERY SECTION - NEW */}
      <PhotoGallery
        photos={currentJob.photos || []}
        onPhotosChange={handlePhotosChange}
      />

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>
            ${currentJob.jobPrice}
          </Text>
        </View>

        {/* NEW: Payment status and invoice info */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Status:</Text>
          <Text
            style={[
              styles.detailValue,
              {
                color:
                  currentJob.paymentStatus === "paid" ? "#28A745" : "#FFA500",
              },
            ]}
          >
            {(currentJob.paymentStatus || "pending").toUpperCase()}
          </Text>
        </View>

        {existingInvoice && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invoice:</Text>
            <TouchableOpacity onPress={handleViewInvoice}>
              <Text
                style={[
                  styles.detailValue,
                  { color: "#007AFF", textDecorationLine: "underline" },
                ]}
              >
                #{existingInvoice.id.slice(-6)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {currentJob.jobNotes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.detailValue}>{currentJob.jobNotes}</Text>
          </View>
        )}
      </View>

      {/* Quick Status Change Buttons */}
      {(currentJob.status || "scheduled") !== "completed" && (
        <View style={styles.statusButtons}>
          <Text style={styles.sectionTitle}>Quick Status Update</Text>
          <View style={styles.buttonRow}>
            {(currentJob.status || "scheduled") === "scheduled" && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: "#FFA500" }]}
                onPress={() => handleStatusChange("in-progress")}
              >
                <Text style={styles.buttonText}>Start Job</Text>
              </TouchableOpacity>
            )}
            {currentJob.status === "in-progress" && (
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: "#28A745" }]}
                onPress={() => handleStatusChange("completed")}
              >
                <Text style={styles.buttonText}>Complete Job</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* NEW: Invoice section */}
      <View style={styles.invoiceSection}>
        <Text style={styles.sectionTitle}>Invoice & Payment</Text>
        {existingInvoice ? (
          <TouchableOpacity
            style={styles.viewInvoiceButton}
            onPress={handleViewInvoice}
          >
            <Text style={styles.viewInvoiceButtonText}>
              View Invoice #{existingInvoice.id.slice(-6)}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.createInvoiceButton}
            onPress={handleCreateInvoice}
          >
            <Text style={styles.createInvoiceButtonText}>Create Invoice</Text>
          </TouchableOpacity>
        )}
      </View>

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
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    marginRight: 10,
    minWidth: 80,
    color: "#666",
  },
  detailValue: {
    flex: 1,
    color: "#333",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28A745",
  },
  statusButtons: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // NEW: Invoice section styles
  invoiceSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  createInvoiceButton: {
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  createInvoiceButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewInvoiceButton: {
    backgroundColor: "#6f42c1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  viewInvoiceButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 50,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default JobDetails;
