# Deployment & Usage Guide: Chillicothe Community Resource Directory

This directory is built with modern, ultra-fast React, TypeScript, and Tailwind CSS. It is a completely static, zero-maintenance web application that can be hosted for **100% free** on **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 🚀 How to Run Locally

To test or run the site locally on your computer:

```bash
# 1. Start development server
npm.cmd run dev

# 2. Or test the optimized production build
npm.cmd run preview
```
Open your browser to `http://localhost:4000` (or the URL displayed in your terminal).

---

## 🌐 Free 1-Click Deployment Options

### Option 1: Deploy to Vercel (Recommended - Easiest & Fastest)
1. Sign up for a free account at [vercel.com](https://vercel.com) using your GitHub, Google, or email account.
2. If your project is pushed to GitHub, click **"Add New Project"** and select this repository.
3. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. In under 60 seconds, your site will be live at a free public URL like:
   `https://chillicothe-community-resources.vercel.app`
5. You can also connect a custom domain (e.g., `chillicotheresources.org`) at any time for free in Vercel settings.

### Option 2: Deploy to Netlify
1. Go to [netlify.com](https://www.netlify.com) and log in.
2. Drag and drop the `dist/` folder directly onto the Netlify dashboard, or connect your repository.
3. Your site will instantly go live with a free SSL certificate.

### Option 3: Deploy to GitHub Pages
1. In `package.json`, ensure `"build": "tsc && vite build"`.
2. Push the code to a GitHub repository.
3. Under repository **Settings > Pages**, choose **GitHub Actions** and select the static Vite starter workflow.

---

## 📋 Connecting Submissions to Google Sheets / Google Form

Right now, user-submitted corrections and new service recommendations are saved directly in the visitor's browser and can be reviewed inside the **"Inbox"** panel in the app header, where you can **Export to CSV** at any time.

If you would like submissions to also automatically submit to your private Google Sheet:
1. Create a simple Google Form with questions matching:
   - Resource Name / Correction
   - Issue Type
   - Submitter Name & Contact
2. In Google Forms, click **Responses > Link to Sheets** to create your live tracking spreadsheet.
3. You can embed the Google Form link directly in `src/components/Header.tsx` or point the form action to your Google Form response URL.

---

## 🖨️ Printing Resource Handouts for Clients

Social workers, shelter intake staff, and churches frequently need physical paper printouts for clients who do not have smartphones or cellular service.

- Click the **"Print Guide"** button in the header (or press `Ctrl+P`).
- If you select a specific category first (e.g. **Food & Meals**, **Homeless Shelters**, or **Blessing Boxes**), the print engine will print a clean, high-contrast, black-and-white 1-2 page sheet tailored specifically to that service category, complete with 24/7 crisis numbers at the top!
