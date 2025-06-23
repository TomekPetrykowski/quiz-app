# Quiz App Frontend - Keycloak Integration

This Next.js frontend application integrates with Keycloak for authentication and communicates with a protected backend API.

## Features

- 🔐 **Keycloak Authentication**: Login and registration through Keycloak
- 🔄 **Automatic Token Refresh**: Handles JWT token refresh automatically
- 🛡️ **Protected Routes**: Route protection with authentication checks
- 🌐 **API Client**: Type-safe API client with JWT token handling
- 🎨 **Modern UI**: Clean interface with Tailwind CSS

## Prerequisites

- Node.js 18+ 
- Keycloak server running on `http://localhost:8080`
- Backend API running on `http://localhost:3001`

## Keycloak Configuration

Your Keycloak realm should be configured with:

### Realm Settings
- **Realm name**: `quiz-app`
- **User registration**: Enabled
- **Login with email**: Enabled

### Client Configuration
- **Client ID**: `frontend`
- **Client Type**: `Confidential`
- **Valid Redirect URIs**: `http://localhost:3000/api/auth/callback/keycloak`
- **Valid Post Logout Redirect URIs**: `http://localhost:3000`
- **Web Origins**: `http://localhost:3000`


## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

### Login Process
1. User clicks "Sign In" → Redirected to Keycloak login
2. User enters credentials in Keycloak
3. Keycloak redirects back with authorization code
4. NextAuth exchanges code for JWT tokens
5. User is logged in and redirected to dashboard

### Registration Process
1. User clicks "Register" → Redirected to Keycloak registration
2. User fills registration form in Keycloak
3. After registration, user is redirected back to login

### API Communication
- All API calls automatically include JWT Bearer token
- Tokens are refreshed automatically when expired
- Failed authentication redirects to login page

## API Client Usage

### Using the Hook
```tsx
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { get, post, loading, error } = useApi();

  const fetchData = async () => {
    await get('/api/users', {
      onSuccess: (data) => console.log(data),
      onError: (error) => console.error(error)
    });
  };

  return (
    <button onClick={fetchData} disabled={loading}>
      {loading ? 'Loading...' : 'Fetch Data'}
    </button>
  );
}
```

## Error Handling

The application handles various authentication errors:
- **Token Expiration**: Automatically refreshes tokens
- **Invalid Tokens**: Redirects to login
- **Network Errors**: Shows user-friendly error messages
- **Keycloak Errors**: Displays specific error information

## Common Issues

### "No access token available"
- Ensure user is logged in
- Check if token has expired
- Verify Keycloak client configuration

### "Authentication required" from API
- Check if backend API is running
- Verify API endpoint URLs
- Ensure backend accepts the JWT tokens from Keycloak

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
