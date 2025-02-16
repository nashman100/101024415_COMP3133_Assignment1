const { gql } = require('apollo-server-express');

const schema = gql`
  scalar Upload

  type User {
    id: ID!
    username: String!
    email: String!
    created_at: String
    updated_at: String
    token: String
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    created_at: String
    updated_at: String
  }

  type Query {
    login(username: String!, password: String!): User

    getAllEmployees: [Employee]
    searchEmployeeById(id: ID!): Employee
    searchEmployeeByDepartment(filter: String!): [Employee]
  }

  type Mutation {
    # User Mutations
    signup(username: String!, email: String!, password: String!): User

    addNewEmployee(
      first_name: String!,
      last_name: String!,
      email: String!,
      gender: String,
      designation: String!,
      salary: Float!,
      date_of_joining: String!,
      department: String!,
      file: Upload
    ): Employee

    updateEmployeeById(
      id: ID!,
      input: UpdateEmployeeInput!
    ): Employee

    deleteEmployee(id: ID!): String
  }

  input UpdateEmployeeInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
    file: Upload
  }
`;

module.exports = schema;