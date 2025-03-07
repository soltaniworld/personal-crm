# Personal CRM

A lightweight, modern CRM application built with Next.js, React, Firebase, and Tailwind CSS to help you manage your contacts and interactions efficiently.

![Personal CRM Screenshot](https://via.placeholder.com/800x400?text=Personal+CRM+Screenshot)

## Features

- **Contact Management**: Store and organize your personal and professional contacts
- **Interaction Tracking**: Log and track all your interactions with contacts
- **Rich Text Notes**: Support for formatted notes with bold, italic, lists, and bullet points using ReactQuill
- **User Authentication**: Secure login with email/password or Google authentication
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatically adapts to your system preference

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Rich Text Editor**: ReactQuill
- **Date Handling**: date-fns
- **Components**: Headless UI

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- A Firebase account

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/personal-crm.git
   cd personal-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

4. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. Enable Email/Password and Google authentication in your Firebase project

6. Set up Firestore Database in your Firebase project and create the following collections:
   - `contacts`
   - `interactions`

7. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app

### Firebase Security Rules

For appropriate security, add these rules to your Firestore database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Application Structure

```
app/
├── auth/                  # Authentication pages
│   ├── signin/
│   └── signup/
├── components/            # Reusable React components
├── contacts/              # Contact management pages
│   ├── [id]/              # Contact details and edit
│   └── new/               # New contact creation
├── interactions/          # Interaction management pages
│   ├── [id]/              # Interaction details and edit
│   └── new/               # New interaction creation
└── lib/                   # Utility functions and API
```

## Usage

1. Sign up or sign in with email/password or Google
2. Add contacts through the contacts page
3. Log interactions with those contacts
4. View and edit past interactions
5. See a dashboard of recent contact activity

## Customization

### Styling

This project uses Tailwind CSS. You can customize the look and feel by modifying the `tailwind.config.js` file.

### Adding Features

The codebase is organized to make it easy to add new features:

- Add new components in the `app/components` directory
- Modify database schema in the `app/lib/db.ts` file
- Add new pages by creating the appropriate directory structure in the `app` folder

## Deployment

This application can be deployed on Vercel with minimal configuration:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ReactQuill](https://github.com/zenoamaro/react-quill) - Rich text editor
- [React Hook Form](https://react-hook-form.com/) - Form handling

---

Made with ❤️ using Next.js and Firebase
