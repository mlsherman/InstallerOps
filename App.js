import React, { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";

import JobDetails from "./JobDetails";
import UpcomingJobs from "./src/screens/UpcomingJobs";
import EditJob from "./src/screens/EditJob";
// NEW: Import new screens
import CustomersScreen from "./src/screens/CustomersScreen";
import CustomerDetails from "./src/screens/CustomerDetails";
import EditCustomer from "./src/screens/EditCustomer";
import InvoiceScreen from "./src/screens/InvoiceScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  // Existing job states
  const [showSplash, setShowSplash] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [jobPrice, setJobPrice] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [jobStatus, setJobStatus] = useState("scheduled");

  // NEW: Customer management states
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // NEW: Financial states
  const [invoices, setInvoices] = useState([]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    console.log("Selected day:", day);
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
        // NEW: Add payment status
        paymentStatus: "pending", // pending, paid, overdue
        invoiceId: null,
        photos: [], // ADD THIS LINE for photos
      };

      setScheduledJobs((prevJobs) => [...prevJobs, newJob]);

      // NEW: Check if customer exists, if not create one
      const existingCustomer = customers.find(
        (c) =>
          c.phone === customerPhone ||
          (c.name.toLowerCase() === customerName.toLowerCase() &&
            c.address === customerAddress)
      );

      if (!existingCustomer && customerName) {
        const newCustomer = {
          id: Date.now().toString(),
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          email: "", // We can add email field later
          notes: "",
          createdAt: new Date().toISOString(),
          totalJobs: 1,
          totalSpent: parseFloat(jobPrice) || 0,
        };
        setCustomers((prev) => [...prev, newCustomer]);
      } else if (existingCustomer) {
        // Update existing customer's job count and total spent
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === existingCustomer.id
              ? {
                  ...c,
                  totalJobs: c.totalJobs + 1,
                  totalSpent: c.totalSpent + (parseFloat(jobPrice) || 0),
                }
              : c
          )
        );
      }

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

  // Existing functions
  const deleteJob = (jobId) => {
    setScheduledJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  };

  const updateJob = (updatedJob) => {
    setScheduledJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    );
  };

  // NEW: Customer management functions
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalJobs: 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  };

  const deleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    // Also remove jobs for this customer
    setScheduledJobs((prev) =>
      prev.filter(
        (job) =>
          job.customerPhone !==
          customers.find((c) => c.id === customerId)?.phone
      )
    );
  };

  // NEW: Invoice functions
  const createInvoice = (job) => {
    const customer = customers.find((c) => c.phone === job.customerPhone);
    const newInvoice = {
      id: Date.now().toString(),
      jobId: job.id,
      customerId: customer?.id,
      customerName: job.customerName,
      jobName: job.name,
      amount: parseFloat(job.jobPrice) || 0,
      status: "pending", // pending, paid, overdue
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    setInvoices((prev) => [...prev, newInvoice]);

    // Update job with invoice ID
    updateJob({
      ...job,
      invoiceId: newInvoice.id,
      paymentStatus: "pending",
    });

    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId, status) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
    );

    // Update corresponding job payment status
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      const job = scheduledJobs.find((j) => j.id === invoice.jobId);
      if (job) {
        updateJob({
          ...job,
          paymentStatus: status,
        });
      }
    }
  };

  // Load/Save functions for AsyncStorage
  const loadData = async () => {
    try {
      const [storedJobs, storedCustomers, storedInvoices] = await Promise.all([
        AsyncStorage.getItem("scheduledJobs"),
        AsyncStorage.getItem("customers"),
        AsyncStorage.getItem("invoices"),
      ]);

      if (storedJobs) {
        const jobs = JSON.parse(storedJobs);
        const migrated = jobs.map((job) => ({
          ...job,
          status: job.status || "scheduled",
          id: job.id || Date.now().toString() + Math.random(),
          paymentStatus: job.paymentStatus || "pending",
          invoiceId: job.invoiceId || null,
        }));
        setScheduledJobs(migrated);
      }

      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }

      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("scheduledJobs", JSON.stringify(scheduledJobs)),
        AsyncStorage.setItem("customers", JSON.stringify(customers)),
        AsyncStorage.setItem("invoices", JSON.stringify(invoices)),
      ]);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [scheduledJobs, customers, invoices]);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="UpcomingJobs">
            <Stack.Screen name="UpcomingJobs">
              {(props) => (
                <UpcomingJobs
                  {...props}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  customerAddress={customerAddress}
                  setCustomerAddress={setCustomerAddress}
                  jobPrice={jobPrice}
                  setJobPrice={setJobPrice}
                  jobNotes={jobNotes}
                  setJobNotes={setJobNotes}
                  scheduledJobs={scheduledJobs}
                  setScheduledJobs={setScheduledJobs}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  jobName={jobName}
                  setJobName={setJobName}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  jobStatus={jobStatus}
                  setJobStatus={setJobStatus}
                  deleteJob={deleteJob}
                  updateJob={updateJob}
                  // NEW: Pass customer data
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  invoices={invoices}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="JobDetails">
              {(props) => (
                <JobDetails
                  {...props}
                  deleteJob={deleteJob}
                  updateJob={updateJob}
                  // NEW: Pass invoice functions
                  createInvoice={createInvoice}
                  invoices={invoices}
                  customers={customers}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EditJob"
              component={EditJob}
              options={{ title: "Edit Job" }}
            />
            {/* NEW: Customer screens */}
            <Stack.Screen name="Customers" options={{ title: "Customers" }}>
              {(props) => (
                <CustomersScreen
                  {...props}
                  customers={customers}
                  deleteCustomer={deleteCustomer}
                  scheduledJobs={scheduledJobs}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="CustomerDetails"
              options={{ title: "Customer Details" }}
            >
              {(props) => (
                <CustomerDetails
                  {...props}
                  updateCustomer={updateCustomer}
                  deleteCustomer={deleteCustomer}
                  scheduledJobs={scheduledJobs}
                  invoices={invoices}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EditCustomer"
              options={{ title: "Edit Customer" }}
            >
              {(props) => (
                <EditCustomer
                  {...props}
                  updateCustomer={updateCustomer}
                  addCustomer={addCustomer}
                />
              )}
            </Stack.Screen>
            {/* NEW: Invoice screen */}
            <Stack.Screen name="Invoice" options={{ title: "Invoice" }}>
              {(props) => (
                <InvoiceScreen
                  {...props}
                  updateInvoiceStatus={updateInvoiceStatus}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  form: {
    marginTop: 20,
    width: "100%",
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
  },
  jobsList: {
    marginTop: 30,
    width: "100%",
  },
  jobsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  jobItem: {
    marginBottom: 15,
  },
});

export default App;
