# 🔐 Credenciais de Demonstração - UniChurch

## Para Revisão da Apple / TestFlight

**IMPORTANT FOR APPLE REVIEW:** Use these credentials to test all features of UniChurch app.

---

## 🚨 QUICK START FOR APPLE REVIEWERS

### Member Account (Regular User)
```
Email: demo.membro@unichurch.com
Password: demo123
```

**How to test:**
1. Open app → Tap "Sou membro" (I'm a member)
2. Tap "Já tenho conta" (Already have account)
3. Login with credentials above
4. Explore: Feed, People, Groups, Profile

### Admin Account (Church Administrator)
```
Email: demo.admin@unichurch.com
Password: demo123
```

**How to test:**
1. Open app → Tap "Sou igreja" (I'm a church)
2. Tap "Já tenho conta" (Already have account)  
3. Login with credentials above
4. Access: Dashboard, Members, Groups, Settings

**Note:** This is the PRIMARY admin account for the demo church. It's registered as the church's main administrator.

---

## 📋 Church Information

**Church Name:** Igreja UniChurch São Paulo  
**QR Code ID:** `unichurch-sp-main`  
**Location:** São Paulo - SP, Brazil

---

## 🧪 Complete Testing Guide

### Test 1: Member Login & Features
1. Open the app
2. Select "Sou membro" (I'm a member)
3. Tap "Já tenho conta" (Already have account)
4. Login: `demo.membro@unichurch.com` / `demo123`
5. **Available features:**
   - ✅ View church feed/wall with member activities
   - ✅ Discover other members with similar interests
   - ✅ Join and participate in groups
   - ✅ Welcome new members
   - ✅ Edit profile and interests
   - ✅ Privacy settings

### Test 2: Admin Login & Management
1. Open the app
2. Select "Sou igreja" (I'm a church)
3. Tap "Já tenho conta" (Already have account)
4. Login: `demo.admin@unichurch.com` / `demo123`
5. **Available features:**
   - ✅ Administrative dashboard with statistics
   - ✅ Member management
   - ✅ Create and manage groups
   - ✅ Edit church information
   - ✅ Access church QR Code for new member registration
   - ✅ View all church data

### Test 3: New Member Registration (Full Onboarding)
1. Open the app
2. Select "Sou membro" (I'm a member)
3. Tap "Começar" (Start)
4. Scan QR Code OR manually enter: `unichurch-sp-main`
5. Complete onboarding flow:
   - Welcome screen
   - Basic information
   - Interests selection (sports, hobbies, etc.)
   - Social media (optional)
   - Privacy settings
   - Create account with email/password
6. Access main app

---

## 📱 Key Features by Account Type

### Member Account Features:
- ✅ Guided onboarding with interest collection
- ✅ Church feed/wall with real-time events
- ✅ People discovery with matching algorithm
- ✅ Group participation (cells, ministries, hobbies)
- ✅ Customizable profile with privacy controls
- ✅ Welcome system for new members
- ✅ Direct contact via WhatsApp/Instagram (if public)

### Admin Account Features:
- ✅ Dashboard with church statistics
- ✅ Member management and oversight
- ✅ Group creation and management
- ✅ Church QR Code for member registration
- ✅ Church settings and information
- ✅ Multiple administrators support
- ✅ View member profiles and activity

---

## 🌐 Language Note

The app is currently in **Portuguese (Brazil)** as it's designed for Brazilian churches. UI elements include:
- "Sou membro" = I'm a member
- "Sou igreja" = I'm a church
- "Já tenho conta" = Already have account
- "Começar" = Start/Begin

---

## 🔄 Reset Demo Data

If demo data needs to be reset, run on server:

```bash
cd backend
npm run seed
```

This recreates all churches, members, groups, and events including demo accounts.

---

## ✅ Verification Checklist

- [x] Member account exists and is functional
- [x] Admin account exists and is functional
- [x] Demo member has interests configured
- [x] Demo member is in 3 groups
- [x] Both accounts in same church (UniChurch São Paulo)
- [x] Sample data populated (events, members, groups)
- [x] All features accessible

---

## 📞 Support

For review questions or technical issues:
- **App Version:** 1.0
- **Platform:** iOS
- **Backend:** Node.js + MongoDB
- **Region:** Brazil

---

**Last Updated:** January 2025  
**Review Submission ID:** 4b1d2311-3a2c-45f1-b357-dbdf38deb50d  
**App Version:** 1.0

