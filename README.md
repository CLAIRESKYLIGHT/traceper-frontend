# TRACEPER - Transparency Portal

A comprehensive transparency portal for the Municipality of Matnog, Sorsogon, designed to promote good governance through transparency, accountability, and citizen engagement.

## 🎯 Project Overview

**TRACEPER** stands for:
- **T**ransparency
- **R**ule of Law
- **A**ccountability
- **C**onsensus-Oriented
- **E**quity & Inclusiveness
- **P**articipatory
- **E**ffectiveness & Efficiency
- **R**esponsiveness

This portal provides citizens and administrators with a centralized platform to view, track, and manage municipal projects, financial records, barangay information, officials, documents, and transactions.

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Admin/Citizen)
- Secure token-based authentication
- Profile management

### 📊 Dashboards
- **Admin Dashboard**: Comprehensive overview with statistics, charts, and quick actions
- **Citizen Dashboard**: Public-facing dashboard with project status, financial summaries, and recent activities
- Real-time statistics and visualizations
- Interactive charts and graphs

### 🏗️ Project Management
- Create, read, update, and delete projects
- Project status tracking (Not Started, In Progress, Completed, Delayed, Cancelled)
- Budget allocation and tracking
- Automatic remaining budget calculation
- Auto-set remaining budget to 0 when project status is "Completed"
- Project details with associated documents and transactions
- Clickable document links that navigate to document details

### 🏘️ Barangay Management
- List all barangays with IRA shares
- Barangay details page with projects and officials
- Year-based filtering for financial data
- Interactive map integration

### 👥 Officials Management
- Directory of municipal officials
- Official profiles with contact information
- Projects and transactions associated with officials

### 📄 Document Management
- Upload and manage project/transaction documents
- Document categorization (Project/Transaction)
- File download and viewing
- Document navigation from project details
- Search and filter functionality

### 💰 Financial Management
- Financial records tracking
- Transaction management
- Revenue and expenditure tracking
- Budget allocation and monitoring
- Financial charts and visualizations
- Year-based financial records

### 🗺️ Interactive Map
- Google Maps integration showing Matnog municipality
- Barangay locations and information
- Visual representation of municipal boundaries

### 🔍 Search & Navigation
- Global search functionality
- Filter by status, barangay, project, etc.
- Text-based modern navigation
- Responsive design for all devices

### 📈 Data Visualization
- Project status charts
- Revenue and expense charts
- Budget allocation charts
- Barangay IRA distribution charts
- Monthly transaction charts
- Transaction type breakdowns

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (Laravel backend)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd traceper-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following content:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```
   
   For production, update this to your production API URL:
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
traceper-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── charts/        # Chart components
│   │   └── ...            # Other components
│   ├── pages/             # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── CitizenDashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── Barangays.jsx
│   │   ├── Officials.jsx
│   │   ├── Documents.jsx
│   │   ├── Financials.jsx
│   │   ├── Map.jsx
│   │   └── ...
│   ├── services/          # API services
│   │   └── api.js         # Axios configuration
│   ├── utils/             # Utility functions
│   │   └── useAuth.js     # Authentication hooks
│   ├── App.jsx            # Main app component with routing
│   └── main.jsx           # Entry point
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

For production, update this to your production API URL.

### API Configuration

The API service is configured in `src/services/api.js`. It automatically:
- Attaches authentication tokens to requests
- Handles 401 errors (unauthorized) by clearing tokens
- Provides error logging for debugging

## 👤 User Roles

### Admin
- Full CRUD access to all resources
- Can create, edit, and delete projects, documents, transactions
- Access to admin dashboard with comprehensive statistics
- Manage contractors and officials

### Citizen
- Read-only access to public information
- View projects, barangays, officials, documents
- Access to citizen dashboard
- Search and filter capabilities

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Accessible**: Text-based navigation for better usability
- **Interactive**: Smooth animations and transitions
- **User-Friendly**: Toast notifications, loading states, error handling

## 📝 Key Functionalities

### Project Management
- Create projects with budget allocation
- Track project status and progress
- View project details with associated documents
- Automatic budget calculations
- Clickable document links for easy navigation

### Document Management
- Upload documents (max 10MB)
- Categorize by project or transaction
- View and download documents
- Search and filter documents
- Navigate from project details to specific documents

### Financial Tracking
- Record financial transactions
- Track revenue and expenditures
- View financial records by year
- Generate financial reports
- Export financial data

### Data Export
- Export projects to CSV
- Export transactions to CSV
- Export documents list to CSV
- Print project details
- Print financial reports

## 🛠️ Technologies Used

- **React 19** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vite** - Build tool

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security Features

- Token-based authentication
- Automatic token expiration handling
- Secure API communication
- Role-based access control
- Input validation
- XSS protection

## 📊 API Endpoints Used

The frontend communicates with a Laravel backend API. Key endpoints include:

- `/api/login` - User authentication
- `/api/register` - User registration
- `/api/projects` - Project CRUD operations
- `/api/barangays` - Barangay information
- `/api/officials` - Officials directory
- `/api/documents` - Document management
- `/api/transactions` - Financial transactions
- `/api/financial-records` - Financial records
- `/api/dashboard` - Dashboard statistics

## 🐛 Troubleshooting

### API Connection Issues
- Ensure the backend server is running
- Check the API base URL in `.env`
- Verify CORS settings on the backend

### Authentication Issues
- Clear browser localStorage
- Check token expiration
- Verify user role in localStorage

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 📄 License

This project is developed for the Municipality of Matnog, Sorsogon.

## 👥 Contributors

- Development Team
- Municipality of Matnog, Sorsogon

## 📞 Support

For issues or questions, please contact the development team or refer to the project documentation.

---

**Version**: 1.0.0  
**Last Updated**: 2025
