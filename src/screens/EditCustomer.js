import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

const EditCustomer = ({ route, navigation, updateCustomer, addCustomer }) => {
  const { customer, isNewCustomer } = route.params || {};

  // State for customer fields
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [notes, setNotes] = useState(customer?.notes || "");

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Customer name is required");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
      notes: notes.trim(),
    };

    if (isNewCustomer) {
      // Add new customer
      addCustomer(customerData);
      Alert.alert("Success", "Customer added successfully");
    } else {
      // Update existing customer
      const updatedCustomer = {
        ...customer,
        ...customerData,
        updatedAt: new Date().toISOString(),
      };
      updateCustomer(updatedCustomer);
      Alert.alert("Success", "Customer updated successfully");
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>
          {isNewCustomer ? "Add New Customer" : "Edit Customer"}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter customer name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            multiline
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter any notes about this customer"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {isNewCustomer ? "Add Customer" : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#333",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  notesInput: {
    minHeight: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 30,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    textAlignVertical: "top",
  },
  buttonContainer: {
    gap: 15,
  },
  saveButton: {
    backgroundColor: "#28A745",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditCustomer;
