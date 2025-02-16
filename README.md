# Employee Management GraphQL API

🚀 A Node.js-based **GraphQL API** for managing employees, supporting **user authentication, employee CRUD operations, and file uploads**.

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation-1)
- [Environment Variables](#-environment-variables)
- [Running the Server](#-running-the-server)
- [API Endpoints](#-api-endpoints-graphql-mutations--queries)
- [Testing with Postman](#-testing-with-postman)

---

## 📌 About the Project
This **GraphQL API** allows users to:
- **Sign up** and **log in** securely.
- **Manage employees** (Create, Read, Update, Delete).
- **Upload employee photos** and store their URLs.
- **Search employees by department or ID**.

Built using **Node.js, Express, MongoDB, and GraphQL**, it ensures **efficient querying and data handling**.

---

## ✨ Features
✅ **User Authentication** (Signup, Login)  
✅ **Employee CRUD Operations**  
✅ **File Uploads** (Store employee photos locally)  
✅ **Validation using Express Validator**  
✅ **GraphQL API with Apollo Server**  

---

## 🛠 Technologies Used
- **Node.js** (Backend)
- **Express.js** (API framework)
- **MongoDB & Mongoose** (Database)
- **GraphQL & Apollo Server** (API)
- **bcrypt & JWT** (Authentication)
- **graphql-upload** (File Uploads)
- **express-validator** (Input Validation)

---

## ⚙️ Installation
### **1️⃣ Clone the Repository**
```bash
git clone git@github.com:nashman100/101024415_COMP3133_Assignment1.git
cd 101024415_COMP3133_Assignment1
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Set Up MongoDB**
Ensure you have **MongoDB** running locally or use a **MongoDB Atlas** database.

---

## 🔑 Environment Variables
Create a `.env` file in the **root directory** and add:

```ini
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 🚀 Running the Server
```bash
npm start
```
Server runs on **http://localhost:4000/graphql**

---

## 📡 API Endpoints (GraphQL Mutations & Queries)

### **📌 User Authentication**
#### **Sign Up**
```graphql
mutation {
  signup(username: "johnDoe", email: "john@example.com", password: "password123") {
    id
    username
    email
  }
}
```
#### **Login**
```graphql
query {
  login(username: "johnDoe", password: "password123") {
    id
    username
    email
    token
  }
}
```

---

### **📌 Employee Management**
#### **Add New Employee**
```graphql
mutation ($input: AddEmployeeInput!) {
  addNewEmployee(input: $input) {
    id
    first_name
    last_name
    email
    employee_photo
  }
}
```
#### **Update Employee**
```graphql
mutation ($id: ID!, $input: UpdateEmployeeInput!) {
  updateEmployeeById(id: $id, input: $input) {
    id
    first_name
    last_name
    email
    employee_photo
  }
}
```
#### **Delete Employee**
```graphql
mutation {
  deleteEmployee(id: "EMPLOYEE_ID") 
}
```

---

## 📌 Testing with Postman
1. **Open Postman**
2. **Set Request Type:** `POST`
3. **URL:** `http://localhost:4000/graphql`
4. **For JSON Requests:**  
   - Go to `Body` → Select **GraphQL**
   - Paste the mutation/query
5. **For File Uploads:**  
   - Go to `Body` → Select **form-data**
   - Add:
     - `operations` → **Text** (GraphQL mutation JSON)
     - `map` → **Text** `{ "0": ["variables.input.file"] }`
     - `0` → **File** (Choose an image)

---
