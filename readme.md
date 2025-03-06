### **Project Proposal: Personal CRM System**

#### **1\. Introduction**

This project is a **Personal CRM (Customer Relationship Management)** system designed to help users manage their personal and professional relationships. Users can log interactions with contacts, view past updates, and track important details. The system ensures **user-specific data isolation**, meaning each user only sees their own data. The tech stack includes **Firebase** for the database, **React** for the frontend, **Node.js** for the backend, and **Tailwind CSS** for styling.

Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies

React with Next.js 14 App Router
TailwindCSS
Firebase Auth, Storage, and Database

#### **2\. Key Features**

1.  **User Authentication**:
    
    *   Secure login and registration using Firebase Authentication.
        
2.  **Home Page**:
    
    *   **New Interaction Input**: A form to log interactions with a searchable dropdown for contacts, a title field, rich text notes, and a date picker.
        
    *   **Previous Interactions Table**: Displays past interactions with columns for Title, Contact, and Date. Each row links to the **Interaction Detail Page**.
        
    *   **Upcoming Important Dates**: Shows the next 10 important dates (e.g., birthdays) with associated contacts. Each date/contact pair links to the **Individual Contact Page**.
        
3.  **Interaction Detail Page**:
    
    *   Displays full details of an interaction (title, contact, date, and notes).
        
    *   Allows users to **edit** or **delete** the interaction.
        
    *   Links back to the **Home Page**.
        
4.  **Contact Page**:
    
    *   Displays all contacts with options to **edit** or **delete**.
        
    *   Each contact name links to the **Individual Contact Page**.
        
    *   Includes an **Add New Contact** button.
        
5.  **Individual Contact Page**:
    
    *   Shows contact details (name, email, phone) with options to **edit** or **delete**.
        
    *   Lists all interactions linked to the contact, with each interaction title linking to the **Interaction Detail Page**.
        
    *   Links back to the **Contact Page**.
        

#### **3\. Tech Stack**

*   **Frontend**:
    
    *   **React**: For building the user interface.
        
    *   **Tailwind CSS**: For styling.
        
    *   **Rich Text Editor**: Use **Quill** or **Draft.js** for notes.
        
*   **Backend**:
    
    *   **Node.js**: For server-side logic.
        
    *   **Express.js**: For building the REST API.
        
*   **Database**:
    
    *   **Firebase Firestore**: For real-time data storage.
        
        *   Collections:
            
            *   users: Stores user info (email, hashed password).
                
            *   contacts: Stores contact details linked to a user via userId.
                
            *   interactions: Stores interaction details linked to a user (userId) and a contact (contactId).
                
*   **Authentication**:
    
    *   **Firebase Authentication**: For secure login and registration.
        
*   **Other Tools**:
    
    *   **React Router**: For navigation between pages.
        
    *   **Axios**: For API requests.
        
    *   **Date-fns**: For date formatting.
        

#### **4\. Database Structure**

1.  **Users**:
    
    *   userId (string)
        
    *   email (string)
        
    *   password (string, hashed)
        
2.  **Contacts**:
    
    *   contactId (string)
        
    *   userId (string, links to Users)
        
    *   name (string)
        
    *   email (string)
        
    *   phone (string)
        
    *   otherDetails (object)
        
3.  **Interactions**:
    
    *   interactionId (string)
        
    *   userId (string, links to Users)
        
    *   contactId (string, links to Contacts)
        
    *   title (string)
        
    *   notes (string, rich text)
        
    *   date (timestamp)
        

#### **5\. Data Isolation**

To ensure users only see their own data:

*   Use **Firebase Security Rules** to restrict access to data based on userId.
    
*   guide me through setting up firebase
    

#### **6\. Navigation Flow**

*   **Home Page**:
    
    *   Links to:
        
        *   **Interaction Detail Page** (via rows in the Previous Interactions Table).
            
        *   **Individual Contact Page** (via contact names in the Upcoming Important Dates section).
            
*   **Interaction Detail Page**:
    
    *   Links to:
        
        *   **Individual Contact Page** (via the contact name).
            
        *   **Home Page** (via the Back Link).
            
*   **Contact Page**:
    
    *   Links to:
        
        *   **Individual Contact Page** (via contact names in the All Contacts List).
            
*   **Individual Contact Page**:
    
    *   Links to:
        
        *   **Interaction Detail Page** (via interaction titles in the Related Interactions List).
            
        *   **Contact Page** (via the Back Link).
            

#### **7\. Instructions for Junior Developer**

1.  **Set Up the Project**:
    
    *   Initialize a React app with create-react-app.
        
    *   Install dependencies: firebase, react-router-dom, axios, tailwindcss, and a rich text editor like quill.
        
2.  **Build the Frontend**:
    
    *   Create components for each page: **Home Page**, **Interaction Detail Page**, **Contact Page**, and **Individual Contact Page**.
        
    *   Use **React Router** to handle navigation between pages.
        
    *   Style the app using **Tailwind CSS**.
        
3.  **Set Up Firebase**:
    
    *   Create a Firebase project and enable Firestore and Authentication.
        
    *   Configure Firebase in your app and set up security rules for data isolation.
        
4.  **Build the Backend**:
    
    *   Use **Node.js** and **Express.js** to create a REST API for handling database operations.
        
    *   Connect the frontend to the backend using **Axios**.
        
5.  **Test the App**:
    
    *   Ensure all pages and features work as expected.
        
    *   Test data isolation by logging in with different users and verifying they only see their own data

## Features

### User Authentication
- Sign up with email and password
- Log in with existing credentials
- **Sign in with Google**: One-click authentication using your Google account
- Protected routes that require authentication

### Contact Management
- Add new contacts with name, email, phone, and notes
- View a list of all contacts
- View contact details
- Edit and delete contacts
- Add interactions directly from contact details

### Interaction Management
- Log interactions with contacts
- View all interactions in a chronological list
- View interactions for a specific contact
- Edit and delete interactions
- **Create contacts on-the-fly**: When logging a new interaction, you can create a new contact without leaving the interaction form if the contact doesn't exist yet
  - Enhanced dialog for creating new contacts with additional fields (email, phone)
  - Seamless integration with the interaction form
  - Visual indicators for creating new contacts

### UI Features
- Responsive design for mobile and desktop
- Dark mode support
- Clean, modern interface with Tailwind CSS
- Rich text editor for notes
