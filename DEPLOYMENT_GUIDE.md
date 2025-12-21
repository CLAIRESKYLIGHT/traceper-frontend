# 🚀 TRACEPER Frontend Deployment Guide

## ✅ Production Configuration

Your backend is deployed at: `https://traceper-backend.onrender.com/`
Your frontend is deployed at: `traceper-frontend.vercel.app`

---

## 🔧 Environment Variables Setup

### For Vercel Deployment:

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following environment variable:**

   ```
   Name: VITE_API_BASE_URL
   Value: https://traceper-backend.onrender.com/api
   Environment: Production, Preview, Development
   ```

4. **Optional - If storage files are on a different domain:**
   ```
   Name: VITE_STORAGE_URL
   Value: https://traceper-backend.onrender.com
   Environment: Production, Preview, Development
   ```

5. **Redeploy your application** after adding environment variables

---

## 📝 Environment Variables Reference

### Required:
- `VITE_API_BASE_URL` - Your backend API URL (must end with `/api`)

### Optional:
- `VITE_STORAGE_URL` - Storage file URL (if different from API base URL)

---

## 🔍 How It Works

The frontend now uses environment variables for all API calls:

1. **API Calls**: Uses `VITE_API_BASE_URL` from environment
2. **File Downloads**: Automatically constructs storage URL from API base URL
3. **Fallback**: If no environment variable is set, defaults to localhost (for development)

---

## 🧪 Testing Production Configuration

### 1. Check Environment Variables in Vercel:
- Go to your project → Settings → Environment Variables
- Verify `VITE_API_BASE_URL` is set correctly

### 2. Test API Connection:
- Open browser console on your deployed site
- Check network requests - they should go to `https://traceper-backend.onrender.com/api`

### 3. Test File Downloads:
- Try downloading a document
- Verify the URL points to your production backend

---

## 🐛 Troubleshooting

### Issue: API calls failing
**Solution**: 
- Verify `VITE_API_BASE_URL` is set in Vercel
- Make sure it ends with `/api`
- Redeploy after adding environment variables

### Issue: Files not downloading
**Solution**:
- Check if `VITE_STORAGE_URL` is set (optional)
- Verify backend storage is accessible
- Check CORS settings on backend

### Issue: CORS errors
**Solution**:
- Ensure backend `.env` has:
  ```
  SANCTUM_STATEFUL_DOMAINS=traceper-frontend.vercel.app
  ```
- Check backend CORS configuration allows your frontend domain

---

## 📋 Pre-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] `VITE_API_BASE_URL` points to production backend
- [ ] Backend CORS configured for frontend domain
- [ ] Test login/registration
- [ ] Test API calls
- [ ] Test file downloads
- [ ] Verify all features work in production

---

## 🔄 After Deployment

1. **Test the application**:
   - Login/Registration
   - API calls
   - File downloads
   - All major features

2. **Monitor for errors**:
   - Check browser console
   - Check Vercel logs
   - Check backend logs

3. **Update if needed**:
   - If backend URL changes, update `VITE_API_BASE_URL` in Vercel
   - Redeploy after changes

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Test backend API directly

---

**Your application is now configured for production! 🎉**

