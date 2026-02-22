# Booth Level - Progressive Web App (PWA)
## Household Issue Collection Platform

A field-ready Progressive Web App (PWA) for collecting household-level issues during political door-to-door outreach campaigns.

---

## ✨ Features

### Core Features
- ✅ **Phone Number Authentication** - OTP-based login via Firebase
- ✅ **Household Data Collection** - Simple form for issue capture
- ✅ **Real-Time Sync** - Automatic Firestore integration
- ✅ **PWA Ready** - Installable on Android phones
- ✅ **Offline Support** - Service worker for offline functionality
- ✅ **Malayalam UI** - Localized interface for users
- ✅ **Data Export** - CSV/Excel export for analysis
- ✅ **Session Management** - Automatic user tracking

### Target Users
- Booth Presidents
- Authorized booth-level volunteers
- Maximum ~500 users

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project (free tier available)

### Installation
```bash
# Clone and install
git clone <repository-url>
cd booth-level
npm install

# Start dev server
npm start
```

App runs at `http://localhost:3000`

---

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Phone Authentication**
3. Enable **Firestore Database**
4. Add **authorized domains** (localhost, your domain)
5. Copy Firestore rules from `FIRESTORE_RULES.md` into Firebase Rules tab

---

## 📱 User Flow

1. **Login**: Enter phone number → Verify OTP
2. **Signup** (first-time): Enter booth number → Create profile
3. **Data Entry**: Fill household form → Submit
4. **Logout**: Click logout button

---

## 📊 Data Collection

**Form Fields** (30-45 seconds per household):
- Household Member Name
- Phone Number
- Issues/Concerns (open text)

**Auto-Filled**:
- Booth Number (from user profile)
- Date & Time (automatic)
- User ID & Name (automatic)

---

## 🔐 Security

- ✅ Firebase Phone OTP authentication
- ✅ reCAPTCHA bot protection
- ✅ Firestore database access control
- ✅ User session management
- ✅ HTTPS required for deployment

---

## 📦 Deployment

### Firebase Hosting (Recommended)
```bash
npm run build
firebase deploy
```

### Android PWA Installation
1. Open app in Chrome on Android
2. Tap menu → "Install app"
3. App appears on home screen

---

## 📊 Data Export

Household data is stored in Firestore and can be exported as:
- **CSV** (for Excel/Sheets)
- **JSON** (for analysis)
- **Direct Query** (from Firebase Console)

---

## 📖 Full Documentation

See `FIRESTORE_RULES.md` for database setup details.

---

## 🎯 Status

✅ **Production Ready**
- Authentication working
- Household data collection active
- Real-time Firestore sync
- PWA installable
- Offline support ready

---

**Version**: 1.0.0  
**Last Updated**: February 18, 2026

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
