# Document Flow Implementation

## Overview
This implementation adds a complete document management system (Документооборот) to the CRM frontend application.

## Components Implemented

### Core Components

1. **DocumentFlowMain.vue** - Main layout with tab navigation
   - Tabs: Documents, Correspondence, Settings
   - Floating Action Buttons for creating documents/correspondence
   - Path: `/dashboard/document-flow`

2. **DocumentList.vue** - Document list with filtering
   - Data table with sortable columns
   - Filters: Direction, State, Document Type, Project
   - Actions: View, Edit, Delete
   - Click row to view document details

3. **DocumentDetail.vue** - Document details with PDF viewer
   - Split layout: PDF viewer (left) + metadata (right)
   - File management (view, download, add, remove)
   - Signatory management
   - Workflow history timeline
   - State change functionality

4. **DocumentForm.vue** - Create/Edit document form
   - All document fields (title, type, direction, etc.)
   - File upload support
   - Validation rules

5. **DocumentStateChangeDialog.vue** - Dialog for changing document state
   - State selection with color-coded chips
   - Comment field
   - Integrates with workflow

6. **DocumentPdfViewer.vue** - Enhanced PDF viewer
   - Uses vue-pdf-app library
   - Toolbar with zoom, navigation, download, print controls
   - Fullscreen support
   - Thumbnail sidebar

### Correspondence Components

7. **CorrespondenceList.vue** - List of correspondence packages
   - Direction indicators (incoming/outgoing/internal)
   - Delivery method display
   - Response deadline indicator with color coding:
     - Green: >5 days remaining
     - Orange: 2-5 days remaining
     - Red: <2 days remaining
     - Grey: Overdue

8. **CorrespondenceDetail.vue** - Correspondence details
   - Sender/recipient information
   - List of attached documents
   - Document management (add/remove)

9. **CorrespondenceForm.vue** - Create correspondence
   - Direction and delivery method selection
   - Sender/recipient fields (legal/physical/text)
   - Mail account selection

### Settings Component

10. **DocumentFlowSettings.vue** - Reference data management
    - Document types table (hierarchical)
    - Workflow states table (read-only with color coding)
    - Mail accounts CRUD table

## Store Module

**src/store/modules/crm/documentFlow.js** - Enhanced Vuex store
- Complete state management for documents, correspondence, and settings
- Actions for all CRUD operations
- Actions for workflow state changes
- Actions for file and signatory management
- Getters for accessing state data
- Loading state tracking
- Filter management

## Router Configuration

Added routes under `/dashboard/document-flow`:
- `/` - Redirects to documents
- `/documents` - Document list
- `/documents/create` - Create document
- `/documents/:id` - Document detail
- `/documents/:id/edit` - Edit document
- `/correspondence` - Correspondence list
- `/correspondence/create` - Create correspondence
- `/correspondence/:id` - Correspondence detail
- `/settings` - Settings/Reference data

## Navigation

Added "Документооборот" menu item to Dashboard sidebar:
- Icon: `mdi-file-document-multiple-outline`
- Links to `/dashboard/document-flow`

## API Integration

All components integrate with the backend API at `${BASE_URL}/api/document-flow/`:

### Endpoints Used:
- `GET /documents/` - List documents (with filtering)
- `POST /documents/` - Create document
- `GET /documents/:id/` - Get document details
- `PATCH /documents/:id/` - Update document
- `DELETE /documents/:id/` - Delete document
- `POST /documents/:id/change_state/` - Change document state
- `POST /documents/:id/add_files/` - Add files to document
- `POST /documents/:id/remove_files/` - Remove files from document
- `POST /documents/:id/add_signatory/` - Add signatory
- `POST /documents/:id/remove_signatory/` - Remove signatory
- `GET /document-types/` - Get document types
- `GET /workflow-states/` - Get workflow states
- `GET /correspondence/` - List correspondence
- `GET /correspondence/:id/` - Get correspondence details
- `POST /correspondence/` - Create correspondence
- `POST /correspondence/:id/add_documents/` - Add documents to correspondence
- `POST /correspondence/:id/remove_documents/` - Remove documents from correspondence
- `GET /mail-accounts/` - Get mail accounts
- `GET /file/` - List files
- `POST /file/` - Upload file
- `DELETE /file/:id/safe_delete` - Delete file

## Features

### Document Management
- ✅ Create, read, update, delete documents
- ✅ Document filtering by direction, state, type, project
- ✅ Document state workflow with history tracking
- ✅ File attachment management
- ✅ Signatory management
- ✅ PDF preview with enhanced viewer

### Correspondence
- ✅ Create and view correspondence packages
- ✅ Link documents to correspondence
- ✅ Response deadline tracking with visual indicators
- ✅ Support for multiple delivery methods

### Settings
- ✅ View document types (hierarchical)
- ✅ View workflow states with color coding
- ✅ Manage mail accounts

### UI/UX Features
- ✅ Vuetify 2 Material Design
- ✅ Responsive layout
- ✅ Color-coded status chips
- ✅ Timeline for workflow history
- ✅ Data tables with sorting and pagination
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling with snackbar notifications
- ✅ Russian localization

## Technical Details

### Dependencies Used:
- Vue 2.6.12
- Vuetify 2.6.12
- Vuex 3.6.2
- Vue Router 3.5.1
- Axios 0.19.2
- Moment.js 2.29.1
- vue-pdf-app 2.1.0
- pdfjs-dist 2.16.105

### Code Patterns:
- Options API (not Composition API)
- Namespaced Vuex modules
- Async/await for API calls
- Axios via `this.$http`
- Constants from `@/const/customConst`
- Snackbar notifications via Vuex store
- Moment.js for date formatting

### File Structure:
```
src/
├── components/
│   └── DocumentFlow/
│       ├── DocumentFlowMain.vue
│       ├── DocumentList.vue
│       ├── DocumentDetail.vue
│       ├── DocumentForm.vue
│       ├── DocumentStateChangeDialog.vue
│       ├── DocumentPdfViewer.vue
│       ├── CorrespondenceList.vue
│       ├── CorrespondenceDetail.vue
│       ├── CorrespondenceForm.vue
│       └── DocumentFlowSettings.vue
├── store/
│   └── modules/
│       └── crm/
│           └── documentFlow.js (enhanced)
└── router/
    └── index.js (updated)
```

## Testing

To test the implementation:
1. Navigate to `/dashboard/document-flow`
2. Test document creation and viewing
3. Test state changes
4. Test file management
5. Test correspondence creation
6. Verify API integration with backend

## Notes

- All responses from backend should be wrapped in `{data: ...}`
- File uploads use `multipart/form-data`
- Document state changes are tracked in workflow history
- Response deadline calculation: `sent_date + default_response_days - today`
- PDF viewer supports fullscreen, zoom, and navigation
- All text is in Russian as per requirements

## Future Enhancements

Potential improvements not in scope:
- Advanced PDF features (text selection, annotations)
- Drag & drop file upload
- Bulk operations on documents
- Advanced search and filtering
- Email integration
- Document templates
- Electronic signature integration
