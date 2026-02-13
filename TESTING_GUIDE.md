# Document Flow Frontend Testing Guide

## Prerequisites
- Backend API running at configured URL (dev: http://127.0.0.1:8181, prod: http://crm.planer-studio.ru:9090)
- Backend returns data in `{data: ...}` format
- Backend uses StringRelatedField for related objects in list serializers
- Test user account with document flow permissions

## Testing Checklist

### 1. Document List Page (`/dashboard/document-flow/documents`)

#### Load Test
- [ ] Page loads without console errors
- [ ] No Vuetify type warnings about arrays
- [ ] Documents load and display in table
- [ ] Loading spinner shows during fetch

#### Display Test
- [ ] Title column displays correctly
- [ ] Out number column displays correctly
- [ ] Document type displays as string (not object)
- [ ] Direction chips show correct colors:
  - Incoming = blue
  - Outgoing = green
  - Internal = orange
- [ ] Current state chips show correct colors:
  - Черновик = grey
  - На рассмотрении = orange
  - Подписан = green
  - Отправлен = blue
  - Завершён = teal
  - В архиве = brown
- [ ] Executor displays as string (not object)
- [ ] Created date formatted as DD.MM.YYYY HH:mm

#### Filter Test
- [ ] Direction filter works
- [ ] Current state filter populates from API
- [ ] Document type filter populates from API
- [ ] Filters apply when changed
- [ ] Clear filter works

#### Action Test
- [ ] Click on row navigates to detail page
- [ ] Edit icon navigates to edit page
- [ ] Delete icon shows confirmation
- [ ] Delete removes document and shows success message

### 2. Document Creation Dialog

#### Open Test
- [ ] FAB button visible on document list page
- [ ] Click FAB opens fullscreen dialog
- [ ] Dialog loads without errors
- [ ] Three columns visible (files, form, queue)

#### File Pool - New Files Tab
- [ ] File input visible
- [ ] Can select multiple files
- [ ] Selected files appear in list
- [ ] Image files show thumbnail preview
- [ ] Non-image files show appropriate icon
- [ ] File size displayed correctly
- [ ] Click on file adds to current document
- [ ] File shows visual indicator when in document
- [ ] Remove button deletes file from pool
- [ ] Re-selecting files replaces old list (no duplicates)

#### File Pool - System Files Tab
- [ ] Tab switches to system files
- [ ] System files load from API
- [ ] Search box filters files by name
- [ ] Click on file adds to current document
- [ ] File icons show correctly
- [ ] File size displayed

#### Document Form - Required Fields
- [ ] Title field (required)
- [ ] Direction select (required, default: internal)
- [ ] Executor autocomplete (required, auto-filled if possible)
- [ ] Form validation prevents submit when invalid
- [ ] "Добавить документ" button disabled when invalid

#### Document Form - Additional Fields
- [ ] "Дополнительные поля" button visible
- [ ] Click expands additional fields
- [ ] Click again collapses fields
- [ ] All additional fields present:
  - Document type (select)
  - Out number (text)
  - Description (textarea)
  - Project (autocomplete)
  - Issuer legal (autocomplete)
  - Issuer physical (autocomplete)
  - Owner physical (autocomplete)
  - Owner legal (autocomplete)
  - Amount (number)
  - Currency (select: RUB/USD/EUR)

#### Document Form - Files Section
- [ ] Shows count of files in document
- [ ] Lists all attached files
- [ ] Each file has description input
- [ ] Remove button works
- [ ] Can create document without files

#### Document Queue
- [ ] "Добавить документ" adds to queue
- [ ] Document appears in queue list
- [ ] Shows title, direction chip, executor
- [ ] Shows first 2 files + count
- [ ] Edit button loads document back to form
- [ ] Delete button removes from queue
- [ ] Bottom shows total count

#### Batch Creation
- [ ] "Создать все документы" button shows count
- [ ] Click shows progress dialog
- [ ] Progress bar updates
- [ ] New files upload first
- [ ] Documents created sequentially
- [ ] Success message on completion
- [ ] Dialog closes automatically
- [ ] Document list refreshes
- [ ] Errors shown via snackbar (not alert)

#### Memory Management
- [ ] No memory leaks (check DevTools Memory)
- [ ] Object URLs cleaned up on dialog close
- [ ] Object URLs cleaned up on file remove

### 3. Document Detail Page (`/dashboard/document-flow/documents/:id`)

#### Load Test
- [ ] Page loads without errors
- [ ] Document data fetches
- [ ] Loading spinner during fetch

#### Left Column - PDF Viewer
- [ ] PDF viewer component loads
- [ ] First PDF file auto-selected
- [ ] PDF displays if available

#### Right Column - Metadata
- [ ] Title displays
- [ ] Out number displays (or dash)
- [ ] Current state displays as string with color chip
- [ ] Document type displays as string
- [ ] Direction chip with correct color
- [ ] Executor displays as string
- [ ] Issuer fields display if present
- [ ] Owner fields display if present
- [ ] Project displays if present
- [ ] Amount and currency display if present
- [ ] Description displays if present

#### Files Section
- [ ] File links list displays
- [ ] File name shows
- [ ] Location type shows (full/pages/path)
- [ ] Location value shows if present
- [ ] Description shows if present
- [ ] File icon correct for type
- [ ] Download button works
- [ ] Click on file updates PDF viewer
- [ ] Delete button shows confirmation
- [ ] Delete removes file and shows success

#### Signatories Section
- [ ] Signatories list displays
- [ ] Signatory name shows
- [ ] Signed date formatted correctly
- [ ] Comment shows if present
- [ ] Delete button works

#### Workflow History
- [ ] Timeline displays
- [ ] Events in chronological order
- [ ] State name displays as string
- [ ] State color mapped correctly
- [ ] Actor name displays as string
- [ ] Timestamp formatted correctly
- [ ] Comment displays if present

#### Actions
- [ ] "Изменить состояние" button opens dialog
- [ ] State change dialog works
- [ ] "Добавить файл" button opens dialog
- [ ] "Добавить подписанта" button opens dialog
- [ ] Back button returns to list

### 4. Router

#### Navigation Test
- [ ] `/dashboard/document-flow` redirects to documents
- [ ] `/dashboard/document-flow/documents` shows list
- [ ] `/dashboard/document-flow/documents/:id` shows detail
- [ ] `/dashboard/document-flow/documents/:id/edit` shows edit form
- [ ] `/dashboard/document-flow/correspondence` shows correspondence
- [ ] `/dashboard/document-flow/settings` shows settings
- [ ] No route for `/dashboard/document-flow/documents/create` (removed)

### 5. Vuex Store

#### State Test
- [ ] files array initializes empty
- [ ] documents array initializes empty
- [ ] Loading states work correctly
- [ ] Filters persist

#### Getters Test
- [ ] All getters return arrays (never undefined)
- [ ] Empty data returns empty arrays (not null)

#### Actions Test
- [ ] fetchDocuments works
- [ ] fetchDocument works
- [ ] fetchCreateOptions works
- [ ] createDocument works with FormData
- [ ] updateDocument works
- [ ] deleteDocument works
- [ ] changeDocumentState works
- [ ] addFilesToDocument works
- [ ] removeFilesFromDocument works
- [ ] addSignatory works
- [ ] removeSignatory works
- [ ] fetchDocumentTypes works
- [ ] fetchWorkflowStates works
- [ ] fetchFileList works
- [ ] uploadFile works with progress callback

### 6. Error Handling

#### Network Errors
- [ ] Failed fetch shows error snackbar
- [ ] Failed create shows error snackbar
- [ ] Failed update shows error snackbar
- [ ] Failed delete shows error snackbar
- [ ] No unhandled promise rejections

#### Validation Errors
- [ ] Form validation prevents invalid submit
- [ ] Backend validation errors display properly
- [ ] File upload errors handled

#### Edge Cases
- [ ] Empty document list displays message
- [ ] Document with no files displays message
- [ ] Document with no signatories displays message
- [ ] Document with no history displays message
- [ ] Null/undefined fields display dash

### 7. Performance

#### Load Times
- [ ] Document list loads < 2 seconds
- [ ] Document detail loads < 2 seconds
- [ ] File upload shows progress
- [ ] No unnecessary re-renders

#### Memory
- [ ] No memory leaks (check DevTools)
- [ ] Object URLs cleaned up
- [ ] Component unmount cleanup works

### 8. Security

#### CodeQL
- [x] No security alerts (verified)

#### Data Validation
- [ ] File upload validates file type on backend
- [ ] User permissions checked on backend
- [ ] No XSS vulnerabilities
- [ ] No SQL injection vulnerabilities

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers (if applicable)
- [ ] Chrome Mobile
- [ ] Safari iOS

## Known Issues / Limitations

1. **Documents can be created without files** - By design
2. **No real-time updates** - Requires manual refresh
3. **Sequential creation** - Documents created one by one (not parallel)
4. **File preview** - Only images get thumbnails; PDFs need viewer
5. **Browser compatibility** - Requires modern browser with ES6 support

## Test Results

### Date: _________________
### Tester: _________________

| Test Section | Pass | Fail | Notes |
|-------------|------|------|-------|
| Document List | [ ] | [ ] | |
| Create Dialog | [ ] | [ ] | |
| Document Detail | [ ] | [ ] | |
| Router | [ ] | [ ] | |
| Vuex Store | [ ] | [ ] | |
| Error Handling | [ ] | [ ] | |
| Performance | [ ] | [ ] | |
| Security | [x] | [ ] | CodeQL passed |

### Overall Result: ________________

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Recommendations:
1. 
2. 
3. 
