# Supabase Storage Setup for Document Uploads

## Overview
This guide shows you how to set up Supabase Storage for student document uploads in the university application system.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **eurovhkmzgqtjrkjwrpb**
3. Click on **Storage** in the left sidebar
4. Click **New Bucket**
5. Configure the bucket:
   - **Name**: `application-documents`
   - **Public bucket**: ✅ **Checked** (so students can download their own documents)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png`
6. Click **Create Bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security policies:

### Policy 1: Allow Authenticated Users to Upload

1. In Storage, click on **application-documents** bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **Custom Policy**
5. Configure:
   - **Policy Name**: `Users can upload own documents`
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **USING expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
6. Click **Save Policy**

### Policy 2: Allow Users to View Own Documents

1. Click **New Policy** again
2. Select **Custom Policy**
3. Configure:
   - **Policy Name**: `Users can view own documents`
   - **Allowed operation**: SELECT
   - **Target roles**: authenticated
   - **USING expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Save Policy**

### Policy 3: Allow Users to Delete Own Documents

1. Click **New Policy** again
2. Select **Custom Policy**
3. Configure:
   - **Policy Name**: `Users can delete own documents`
   - **Allowed operation**: DELETE
   - **Target roles**: authenticated
   - **USING expression**:
   ```sql
   (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Save Policy**

## Step 3: Test Upload (Optional)

You can test the upload by running this in your browser console when logged in:

```javascript
const file = new File(["test"], "test.pdf", { type: "application/pdf" })
const { data, error } = await supabase.storage
  .from('application-documents')
  .upload('test-folder/test.pdf', file)

console.log({ data, error })
```

## Step 4: Access the University Application Page

Once set up, students can access their university application at:
- URL: `https://studywithpride.com/portal/university/upf`
- Replace `upf` with the university ID

## Features

✅ **Document Upload**: Students can upload 5 types of documents
✅ **Progress Tracking**: See how many documents are uploaded
✅ **Document Management**: View, download, or delete uploaded documents
✅ **Application Notes**: Add notes to the application
✅ **Secure Storage**: Each student can only access their own documents

## Required Documents

1. Academic Transcript
2. Passport Copy
3. Curriculum Vitae (CV)
4. Motivation Letter
5. Letter of Recommendation

## File Restrictions

- **Max file size**: 10 MB
- **Accepted formats**: PDF, DOC, DOCX, JPG, PNG
- **Naming convention**: `{userId}/{universityId}/{documentType}-{timestamp}.{ext}`

## Troubleshooting

### Error: "new row violates row-level security policy"
- Check that the storage policies are correctly set up
- Verify that the user is authenticated
- Make sure the folder name starts with the user's ID

### Error: "The resource already exists"
- The file was already uploaded
- Use the upsert option or delete the old file first

### Upload Button Not Working
- Check browser console for errors
- Verify file size is under 10MB
- Check that file format is allowed
