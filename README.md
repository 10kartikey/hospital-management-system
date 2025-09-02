# 🏥 HealthCare Plus - Advanced Hospital Management System

**A comprehensive, modern hospital management system with enhanced admin analytics, beautiful UI, and robust features.**

![Healthcare Plus](https://img.shields.io/badge/Version-2.0-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Project Overview

HealthCare Plus is a full-stack web application designed to streamline hospital operations with a focus on patient care, appointment management, and administrative efficiency. The system features a modern, responsive design with comprehensive analytics and real-time updates.

### 🚀 **Enhanced Features (Version 2.0)**

#### 🎨 **Modern Admin Dashboard**
- **Comprehensive Analytics**: Interactive charts and graphs powered by Chart.js
- **Multi-section Interface**: Dashboard, Appointments, Doctors, Patients, Analytics, Settings
- **Real-time Statistics**: Live appointment counts, patient metrics, revenue tracking
- **Advanced Filtering**: Filter appointments by date, status, and doctor
- **Beautiful UI Components**: Modern cards, gradients, and hover effects

#### 📊 **Data Visualization & Analytics**
- **Appointment Trends**: 7-day appointment overview with line charts
- **Department Distribution**: Pie charts showing appointment distribution by department
- **Revenue Analytics**: Bar charts tracking income by department
- **Time Slot Analysis**: Popular booking times visualization
- **Patient Demographics**: Age distribution and patient growth metrics

#### 🎯 **Enhanced User Experience**
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Modern Landing Page**: Beautiful hero section with particle effects
- **Service Showcase**: Interactive service cards with hover animations
- **Doctor Profiles**: Enhanced doctor cards with ratings and experience
- **Advanced Features**: Loading states, progress indicators, and smooth animations

#### 🔧 **Technical Improvements**
- **Enhanced API**: New endpoints for patient management and analytics
- **Better Error Handling**: Comprehensive validation and error responses
- **Improved Security**: Enhanced JWT implementation and session management
- **Modern CSS**: CSS Grid, Flexbox, and custom animations
- **Chart Integration**: Chart.js for beautiful data visualizations

## Features

### Patient Features
- **Patient Registration & Login**: Secure authentication with JWT tokens
- **Profile Management**: View and edit personal information
- **Appointment Management**: 
  - Book new appointments
  - View appointment history
  - Cancel appointments
  - Edit appointment details
- **Email Notifications**: 
  - Appointment confirmations
  - Appointment reminders
  - Cancellation notifications
- **Dashboard**: Overview of appointments and statistics

### Admin Features
- **Doctor Management**: Add, edit, and delete doctors
- **Appointment Overview**: View all appointments
- **Admin Authentication**: Secure admin login

### General Features
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Dynamic appointment booking with conflict detection
- **Modern UI**: Bootstrap-based interface with custom styling

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **nodemailer** for email notifications
- **express-session** for session management

### Frontend
- **HTML5** with semantic markup
- **CSS3** with custom styling
- **JavaScript** (ES6+) for dynamic functionality
- **Bootstrap 5** for responsive design
- **Font Awesome** for icons

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd capstone-hospital-management
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/hospital_management

# Session Secret
SESSION_SECRET=your_session_secret_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Port
PORT=5000
```

### 4. Email Setup (Optional)
For email notifications to work:

1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password
4. Use the App Password in EMAIL_PASS

### 5. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

## Usage

### For Patients

1. **Access Patient Portal**: Navigate to `/patient-portal.html`
2. **Register**: Create a new account with your details
3. **Login**: Use your credentials to access the dashboard
4. **Book Appointments**: 
   - Click "Book New Appointment"
   - Select department and doctor
   - Choose date and time slot
   - Add symptoms and address
   - Confirm booking
5. **Manage Appointments**:
   - View all appointments in the dashboard
   - Cancel appointments if needed
   - Edit profile information

### For Admins

1. **Access Admin Panel**: Navigate to `/html/admin-login.html`
2. **Login**: Use admin credentials from .env file
3. **Manage Doctors**: Add, edit, or remove doctors
4. **View Appointments**: See all patient appointments

## API Endpoints

### Patient Authentication
- `POST /api/patients/register` - Patient registration
- `POST /api/patients/login` - Patient login
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile

### Patient Appointments
- `GET /api/patients/appointments` - Get patient's appointments
- `PUT /api/patients/appointments/:id` - Update appointment
- `DELETE /api/patients/appointments/:id` - Cancel appointment

### General Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Add new doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor (admin only)
- `DELETE /api/doctors/:id` - Delete doctor (admin only)

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

## Database Schema

### Patient Model
```javascript
{
  username: String (unique),
  password: String (hashed),
  name: String,
  contact: String (unique),
  email: String (unique),
  createdAt: Date
}
```

### Appointment Model
```javascript
{
  patientName: String,
  patientContact: String,
  patientAddress: String,
  symptoms: String,
  department: String,
  doctorName: String,
  date: String,
  time: String,
  status: String (scheduled/confirmed/completed/cancelled),
  patientId: ObjectId (reference to Patient),
  createdAt: Date
}
```

### Doctor Model
```javascript
{
  name: String,
  department: String,
  timeSlots: [{
    start: String,
    end: String
  }],
  fee: String
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing protection
- **Session Management**: Secure session handling for admin

## Email Notifications

The system sends automated emails for:
- **Appointment Confirmations**: When appointments are booked
- **Appointment Reminders**: Before scheduled appointments
- **Cancellation Notifications**: When appointments are cancelled

## Future Enhancements

- SMS notifications using Twilio
- Payment integration
- Medical records management
- Prescription management
- Lab results integration
- Video consultations
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 