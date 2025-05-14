import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
// NEW: Import the edit screen
import EditJob from "./src/screens/EditJob";

const Stack = createNativeStackNavigator();

const App = () => {
  // Existing states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [jobPrice, setJobPrice] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scheduledJobs, setScheduledJobs] = useState([]);

  // NEW: Add time and status states
  const [selectedTime, setSelectedTime] = useState("");
  const [jobStatus, setJobStatus] = useState("scheduled"); // scheduled, in-progress, completed

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    console.log("Selected day:", day);
  };

  const handleSubmit = () => {
    if (selectedDate && jobName) {
      const newJob = {
        // NEW: Add unique ID for each job
        id: Date.now().toString(),
        date: selectedDate,
        // NEW: Add time to job
        time: selectedTime,
        name: jobName,
        description: jobDescription,
        customerName,
        customerPhone,
        customerAddress,
        jobPrice,
        jobNotes,
        // NEW: Add status
        status: jobStatus,
        // NEW: Add created timestamp
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
      // NEW: Clear time and reset status
      setSelectedTime("");
      setJobStatus("scheduled");

      console.log("Job scheduled:", newJob);
    } else {
      alert("Please select a date and enter a job name.");
    }
  };

  // NEW: Delete job function
  const deleteJob = (jobId) => {
    setScheduledJobs((prevJobs) => prevJobs.filter(job => job.id !== jobId));
  };

  // NEW: Update job function
  const updateJob = (updatedJob) => {
    setScheduledJobs((prevJobs) => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
  };

  // Existing AsyncStorage functions
  const loadJobs = async () => {
    try {
      const storedJobs = await AsyncStorage.getItem('scheduledJobs');
      if (storedJobs) {
        setScheduledJobs(JSON.parse(storedJobs));
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const saveJobs = async (jobs) => {
    try {
      await AsyncStorage.setItem('scheduledJobs', JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving jobs:', error);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    saveJobs(scheduledJobs);
  }, [scheduledJobs]);

  return (
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
              // NEW: Pass new props
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              jobStatus={jobStatus}
              setJobStatus={setJobStatus}
              deleteJob={deleteJob}
              updateJob={updateJob}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="JobDetails">
          {(props) => (
            <JobDetails
              {...props}
              // NEW: Pass functions to JobDetails
              deleteJob={deleteJob}
              updateJob={updateJob}
            />
          )}
        </Stack.Screen>
        {/* NEW: Add EditJob screen */}
        <Stack.Screen 
          name="EditJob" 
          component={EditJob}
          options={{ title: "Edit Job" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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