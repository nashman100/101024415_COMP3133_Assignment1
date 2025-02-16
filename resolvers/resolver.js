const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { GraphQLUpload } = require('graphql-upload');
const { check, validationResult } = require('express-validator');

const signupValidations = [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const employeeValidations = [
    check('first_name').not().isEmpty().withMessage('First name is required'),
    check('last_name').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('salary').isFloat({ min: 1000 }).withMessage('Salary must be at least 1000')
];

const updateEmployeeValidations = [
    check('email').optional().isEmail().withMessage('Invalid email format'),
    check('salary').optional().isFloat({ min: 1000 }).withMessage('Salary must be at least 1000')
];


const resolvers = {

    Upload: GraphQLUpload,

    Query: {
        
        login: async (_, { username, password }) => {
            try {
                const user = await User.findOne({ username });

                if (!user) {
                    throw new Error('User not found');
                }

                const validPassword = await bcrypt.compare(password, user.password);

                if (!validPassword) {
                    throw new Error('Invalid username or password');
                }

                const token = jwt.sign(
                    { userId: user.id, username: user.username }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '1h' }
                );

                console.log(`Login Successful for user: ${user.username}`);
                return {id: user.id, username: user.username, email: user.email, token };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        getAllEmployees: async () => {
            return await Employee.find();
        },

        searchEmployeeById: async (_, { id }) => {
            return await Employee.findById(id);
        },

        searchEmployeeByDepartment: async (_, { filter }) => {
            return await Employee.find({
                $or: [{ designation: filter }, { department: filter }]
            });
        }
    },

    Mutation: {

        signup: async (_, args, { req }) => {
            try {

                const { username, email, password } = args;
                req.body = { username, email, password };

                await Promise.all(signupValidations.map(validation => validation.run(req)));
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new Error(errors.array().map(err => err.msg).join(', '));
                }

                const userExists = await User.findOne({ email });

                if(userExists) {
                    throw new Error('User already exists');
                }

                const hashPassword = await bcrypt.hash(password, 10);

                const user = new User({
                    username,
                    email,
                    password: hashPassword
                });
                
                await user.save();
                console.log(`Sign Up Successful: New User Created - ${user.username}`);
                return user;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        addNewEmployee: async (_, args, { req }) => {
            try{

                const { first_name, last_name, email, gender, designation, salary, date_of_joining, department, file } = args;
                req.body = { first_name, last_name, email, salary };

                await Promise.all(employeeValidations.map(validation => validation.run(req)));
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new Error(errors.array().map(err => err.msg).join(', '));
                }

                const employeeExists = await Employee.findOne({ email });

                if(employeeExists) {
                    throw new Error('Employee already exists');
                }

                let filePath = null;

                if(file) {
                    const { createReadStream, filename } = await file;
                    const stream = createReadStream();
                    const uploadPath = `uploads/${Date.now()}-${filename}`;

                    await new Promise((resolve, reject) => {
                        const writeStream = fs.createWriteStream(uploadPath);
                        stream.pipe(writeStream);
                        writeStream.on("finish", resolve);
                        writeStream.on("error", reject);
                    });

                    filePath = `http://localhost:4000/${uploadPath}`;
                }

                const employee = new Employee({
                    first_name, 
                    last_name, 
                    email, 
                    gender, 
                    designation, 
                    salary, 
                    date_of_joining, 
                    department, 
                    employee_photo: filePath
                });

                await employee.save();

                console.log(`New Employee Added: ${employee.first_name} ${employee.last_name} - ID: ${employee.id}`);
                return employee;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        updateEmployeeById: async (_, { id, input }, { req }) => {
            try {
                req.body = input;
                await Promise.all(updateEmployeeValidations.map(validation => validation.run(req)));
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new Error(errors.array().map(err => err.msg).join(', '));
                }
        
                const employee = await Employee.findById(id);
                if (!employee) {
                    throw new Error('Employee not found');
                }
        
                let filePath = employee.employee_photo;
        
                if (input.file) {
        
                    if (filePath) {
                        const oldFilePath = filePath.replace("http://localhost:4000/", "");
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
        
                    const { createReadStream, filename } = await input.file;
                    const stream = createReadStream();
                    const uploadPath = `uploads/${Date.now()}-${filename}`;
        
                    await new Promise((resolve, reject) => {
                        const writeStream = fs.createWriteStream(uploadPath);
                        stream.pipe(writeStream);
                        writeStream.on("finish", resolve);
                        writeStream.on("error", reject);
                    });
        
                    filePath = `http://localhost:4000/${uploadPath}`;
                }
        
                const updatedEmployee = await Employee.findByIdAndUpdate(
                    id,
                    { 
                        first_name: input.first_name || employee.first_name,
                        last_name: input.last_name || employee.last_name,
                        email: input.email || employee.email,
                        gender: input.gender || employee.gender,
                        designation: input.designation || employee.designation,
                        salary: input.salary || employee.salary,
                        date_of_joining: input.date_of_joining || employee.date_of_joining,
                        department: input.department || employee.department,
                        employee_photo: filePath || employee.employee_photo
                    },
                    { new: true }
                );
                console.log(`Employee Updated Successfully: ${updatedEmployee.first_name} ${updatedEmployee.last_name} - New Photo: ${updatedEmployee.employee_photo}`);
                return updatedEmployee;
            } catch (error) {
                throw new Error(error.message);
            }
        },                

        deleteEmployee: async (_, { id }) => {
            try{
                const employee = await Employee.findById(id);

                if(!employee) {
                    throw new Error('Employee not found')
                }

                if (employee.employee_photo) {
                    const filePath = employee.employee_photo.replace('http://localhost:4000/', '');
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (err) {
                        console.warn(`Warning: Could not delete file ${filePath}`);
                    }
                }

                await Employee.findByIdAndDelete(id);
                
                console.log(`Employee with ID: ${id} Deleted Successfully`);
                return "Employee deleted successfully";
            } catch(error) {
                throw new Error(error.message);
            }   
        }

        
    }
}

module.exports = resolvers;