# PhotoBooth

PhotoBooth is a modern social media platform built with React and Vite, allowing users to share and interact with photos in a beautiful, responsive interface.

![PhotoBooth Logo](./public/logo-2.svg)

## Features

- 🔐 **Authentication**
  - Email/Password login and registration
  - Google OAuth integration
  - Password reset functionality
  - Protected routes for authenticated users

- 📸 **Post Management**
  - Create posts with images and captions
  - Edit and delete your own posts
  - View posts in a responsive grid layout
  - Infinite scrolling for post loading

- 👥 **User Interactions**
  - Like and comment on posts
  - View post details and comments
  - Share posts
  - Edit and delete your own comments
  - View user profiles
  - Update profile information and avatar

- 🎨 **UI/UX**
  - Modern, responsive design with Tailwind CSS
  - Smooth animations with Framer Motion
  - Toast notifications for user feedback
  - Loading states and skeletons
  - Modal dialogs for enhanced interaction
  - Login popup for unauthenticated users

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Authentication**: Firebase
- **Routing**: React Router DOM
- **API Requests**: Axios
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Date Formatting**: date-fns
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Project installation

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/rafi983/PhotoBooth.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd PhotoBooth 
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.


## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Main application pages/routes
- `/src/hooks` - Custom React hooks
- `/src/store` - Zustand state management
- `/src/utils` - Utility functions and configurations
- `/src/firebase` - Firebase configuration and services
- `/src/assets` - Static assets (images, icons)

## Deployment

The project is configured for deployment on Vercel with the included `vercel.json` configuration file.


## License

This project is licensed under the MIT License.
