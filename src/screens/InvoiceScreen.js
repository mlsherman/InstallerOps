import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Share,
} from "react-native";

const InvoiceScreen = ({ route, navigation, updateInvoiceStatus }) => {
  const { invoices = [], customers = [] } = route.params || {};
  const [filter, setFilter] = useState("all"); // all, pending, paid, overdue

  // Use local state for invoices to ensure real-time updates
  const [currentInvoices, setCurrentInvoices] = useState(invoices);

  // Update local state when route params change
  useEffect(() => {
    setCurrentInvoices(invoices);
  }, [invoices]);

  // Handle status change with local state update
  const handleStatusChange = (invoiceId, currentStatus) => {
    const statusOptions = [
      { label: "Mark as Pending", value: "pending" },
      { label: "Mark as Paid", value: "paid" },
      { label: "Mark as Overdue", value: "overdue" },
    ].filter((option) => option.value !== currentStatus);

    const buttons = [
      ...statusOptions.map((option) => ({
        text: option.label,
        onPress: () => {
          // Update local state immediately
          setCurrentInvoices((prev) =>
            prev.map((inv) =>
              inv.id === invoiceId ? { ...inv, status: option.value } : inv
            )
          );
          // Update parent state
          updateInvoiceStatus(invoiceId, option.value);
        },
      })),
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Update Invoice Status", "Choose new status:", buttons);
  };

  // Filter invoices based on status
  const filteredInvoices = currentInvoices.filter((invoice) => {
    if (filter === "all") return true;
    return invoice.status === filter;
  });

  // Get customer name for invoice
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "#28A745";
      case "pending":
        return "#FFA500";
      case "overdue":
        return "#DC3545";
      default:
        return "#FFA500";
    }
  };

  // Handle share invoice
  const handleShareInvoice = async (invoice) => {
    const customerName = getCustomerName(invoice.customerId);
    const invoiceText = `
INVOICE #${invoice.id}

Customer: ${customerName}
Job: ${invoice.jobName}
Amount: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
Created: ${new Date(invoice.createdAt).toLocaleDateString()}

Thank you for your business!
    `;

    try {
      await Share.share({
        message: invoiceText,
        title: `Invoice #${invoice.id}`,
      });
    } catch (error) {
      console.error("Error sharing invoice:", error);
    }
  };

  // Render invoice item
  const renderInvoiceItem = ({ item }) => {
    const customerName = getCustomerName(item.customerId);
    const isOverdue =
      item.status === "pending" && new Date(item.dueDate) < new Date();

    return (
      <TouchableOpacity
        style={[
          styles.invoiceItem,
          {
            borderLeftColor: getStatusColor(
              isOverdue ? "overdue" : item.status
            ),
          },
        ]}
        onLongPress={() => handleStatusChange(item.id, item.status)}
        delayLongPress={800}
      >
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>Invoice #{item.id.slice(-6)}</Text>
          <Text
            style={[
              styles.invoiceStatus,
              { color: getStatusColor(isOverdue ? "overdue" : item.status) },
            ]}
          >
            {isOverdue ? "OVERDUE" : item.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.customerName}>{customerName}</Text>
        <Text style={styles.jobName}>{item.jobName}</Text>

        <View style={styles.invoiceFooter}>
          <Text style={styles.invoiceAmount}>${item.amount.toFixed(2)}</Text>
          <View style={styles.invoiceDates}>
            <Text style={styles.dateText}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.dateText}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShareInvoice(item)}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            onPress={() => handleStatusChange(item.id, item.status)}
          >
            <Text style={styles.statusButtonText}>Update Status</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate totals using currentInvoices
  const totalInvoices = currentInvoices.length;
  const paidInvoices = currentInvoices.filter(
    (inv) => inv.status === "paid"
  ).length;
  const pendingInvoices = currentInvoices.filter(
    (inv) => inv.status === "pending"
  ).length;
  const overdueInvoices = currentInvoices.filter(
    (inv) => inv.status === "pending" && new Date(inv.dueDate) < new Date()
  ).length;
  const totalRevenue = currentInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalInvoices}</Text>
          <Text style={styles.summaryLabel}>Total Invoices</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: "#28A745" }]}>
            {paidInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: "#FFA500" }]}>
            {pendingInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: "#DC3545" }]}>
            {overdueInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueAmount}>${totalRevenue.toFixed(2)}</Text>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {["all", "pending", "paid", "overdue"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.activeFilterButtonText,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invoice List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id}
        style={styles.invoiceList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubtext}>
              Create jobs with prices to generate invoices
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 5,
  },
  revenueCard: {
    backgroundColor: "#28A745",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  revenueLabel: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  activeFilterButtonText: {
    color: "white",
  },
  invoiceList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  invoiceItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  invoiceStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  jobName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28A745",
  },
  invoiceDates: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  statusButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default InvoiceScreen;
