# Document Flow Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT FLOW SYSTEM                                │
│                    (Vue 2.6 + Vuetify 2.6 + Vuex 3)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROUTER LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  /dashboard/document-flow/                                                  │
│    ├── documents              → DocumentList                                │
│    ├── documents/:id          → DocumentDetail                              │
│    ├── documents/:id/edit     → DocumentFormPage                            │
│    ├── correspondence         → CorrespondenceList                          │
│    ├── correspondence/:id     → CorrespondenceDetail                        │
│    └── settings               → DocumentFlowSettings                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ DocumentFlowMain.vue                                                  │ │
│  │  • Tabs: Documents | Correspondence | Settings                       │ │
│  │  • FAB button → opens DocumentCreateDialog                           │ │
│  │  • Router view for child components                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ DocumentList.vue (245 lines)                                          │ │
│  │  • v-data-table with filters                                          │ │
│  │  • Filters: direction, current_state, document_type                  │ │
│  │  • Displays: title, out_number, type, direction, state, executor    │ │
│  │  • Color-coded state chips (Russian text → color)                    │ │
│  │  • Actions: view, edit, delete                                       │ │
│  │  ✅ All string fields handled properly                               │ │
│  │  ✅ Array.isArray() validation everywhere                            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ DocumentCreateDialog.vue (726 lines) ⭐ NEW                           │ │
│  │  Fullscreen dialog with 3-column layout                               │ │
│  │                                                                        │ │
│  │  ┌─────────────┬─────────────┬─────────────┐                         │ │
│  │  │  COLUMN 1   │  COLUMN 2   │  COLUMN 3   │                         │ │
│  │  │  File Pool  │  Form       │  Queue      │                         │ │
│  │  ├─────────────┼─────────────┼─────────────┤                         │ │
│  │  │ • Upload    │ Required:   │ Documents   │                         │ │
│  │  │   files     │  - title    │ to create:  │                         │ │
│  │  │ • System    │  - dir      │  - title    │                         │ │
│  │  │   files     │  - exec     │  - files    │                         │ │
│  │  │ • Search    │             │  - edit     │                         │ │
│  │  │ • Preview   │ Additional: │  - delete   │                         │ │
│  │  │ • Reuse     │  (toggle)   │             │                         │ │
│  │  │             │  - type     │ Summary:    │                         │ │
│  │  │             │  - desc     │ N docs,     │                         │ │
│  │  │             │  - project  │ M files     │                         │ │
│  │  │             │  - etc.     │             │                         │ │
│  │  │             │             │             │                         │ │
│  │  │             │ Files in    │ [Create]    │                         │ │
│  │  │             │ document    │  All Docs   │                         │ │
│  │  └─────────────┴─────────────┴─────────────┘                         │ │
│  │                                                                        │ │
│  │  Features:                                                             │ │
│  │  • Drag & drop file upload                                            │ │
│  │  • Image preview (thumbnails)                                         │ │
│  │  • File reuse across documents                                        │ │
│  │  • Batch creation with progress                                       │ │
│  │  • Object URL cleanup (no memory leaks)                               │ │
│  │  • Snackbar notifications                                             │ │
│  │  ✅ Memory safe (beforeDestroy cleanup)                               │ │
│  │  ✅ Proper error handling                                             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ DocumentDetail.vue (436 lines)                                        │ │
│  │                                                                        │ │
│  │  ┌─────────────────────┬───────────────────────┐                     │ │
│  │  │   LEFT (60%)        │   RIGHT (40%)          │                     │ │
│  │  ├─────────────────────┼───────────────────────┤                     │ │
│  │  │ PDF Viewer          │ Metadata:              │                     │ │
│  │  │  - First PDF        │  • Title, number       │                     │ │
│  │  │  - Selected file    │  • State (string+color)│                     │ │
│  │  │                     │  • Type (string)       │                     │ │
│  │  │                     │  • Executor (string)   │                     │ │
│  │  │                     │  • All fields          │                     │ │
│  │  │                     │                        │                     │ │
│  │  │                     │ File Links:            │                     │ │
│  │  │                     │  • Name, type          │                     │ │
│  │  │                     │  • Location (pages)    │                     │ │
│  │  │                     │  • Description         │                     │ │
│  │  │                     │  • Download, delete    │                     │ │
│  │  │                     │                        │                     │ │
│  │  │                     │ Signatories:           │                     │ │
│  │  │                     │  • Name, date          │                     │ │
│  │  │                     │  • Comment             │                     │ │
│  │  │                     │                        │                     │ │
│  │  │                     │ Workflow History:      │                     │ │
│  │  │                     │  • Timeline view       │                     │ │
│  │  │                     │  • State (string+color)│                     │ │
│  │  │                     │  • Actor (string)      │                     │ │
│  │  │                     │  • Timestamp           │                     │ │
│  │  └─────────────────────┴───────────────────────┘                     │ │
│  │                                                                        │ │
│  │  ✅ All string fields from StringRelatedField                         │ │
│  │  ✅ Color mapping for states                                          │ │
│  │  ✅ Proper array handling                                             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            VUEX STORE LAYER                                 │
│                  (documentFlow.js - 465 lines)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STATE                                                                      │
│  ├─ files: []              ✅ Renamed from 'file'                          │
│  ├─ documents: []                                                           │
│  ├─ currentDocument: null                                                   │
│  ├─ documentTypes: []                                                       │
│  ├─ workflowStates: []                                                      │
│  ├─ createOptions: null                                                     │
│  ├─ correspondence: []                                                      │
│  ├─ mailAccounts: []                                                        │
│  ├─ loading: {files, documents, document, ...}  ✅ Added files             │
│  └─ filters: {direction, current_state, document_type, ordering}           │
│                                                                             │
│  GETTERS (with Array.isArray() fallbacks)  ✅                              │
│  ├─ getFileList           → files || []                                    │
│  ├─ getDocuments          → documents || []                                │
│  ├─ getDocumentTypes      → documentTypes || []                            │
│  ├─ getWorkflowStates     → workflowStates || []                           │
│  └─ ... (all return arrays, never undefined)                               │
│                                                                             │
│  ACTIONS (with extractArray() utility)  ✅                                 │
│  ├─ fetchDocuments()      → GET /documents/                                │
│  ├─ fetchDocument(id)     → GET /documents/:id/                            │
│  ├─ createDocument(data)  → POST /documents/ (FormData)                    │
│  ├─ updateDocument()      → PATCH /documents/:id/                          │
│  ├─ deleteDocument()      → DELETE /documents/:id/                         │
│  ├─ changeDocumentState() → POST /documents/:id/change_state/              │
│  ├─ addFilesToDocument()  → POST /documents/:id/add_files/                 │
│  ├─ removeFilesFromDoc()  → POST /documents/:id/remove_files/              │
│  ├─ addSignatory()        → POST /documents/:id/add_signatory/             │
│  ├─ removeSignatory()     → POST /documents/:id/remove_signatory/          │
│  ├─ fetchDocumentTypes()  → GET /document-types/                           │
│  ├─ fetchWorkflowStates() → GET /workflow-states/                          │
│  ├─ fetchFileList()       → GET /file/                                     │
│  ├─ uploadFile()          → POST /file/ (with progress)                    │
│  └─ ... (correspondence, mail accounts)                                    │
│                                                                             │
│  UTILITY FUNCTION  ⭐                                                       │
│  extractArray(responseData) {                                              │
│    if (Array.isArray(responseData)) return responseData                    │
│    if (responseData?.results) return responseData.results                  │
│    return []                                                                │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API                                    │
│              (Django REST Framework + PostgreSQL)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Base URL: /api/document-flow/                                             │
│                                                                             │
│  ENDPOINTS                           SERIALIZER                            │
│  ────────────────────────────────────────────────────────────────────      │
│  GET    /documents/                  DocumentListSerializer                │
│         Returns: {data: [...]}       • executor → STRING                   │
│         • direction filter           • current_state → STRING              │
│         • current_state filter       • document_type → STRING              │
│         • document_type filter                                             │
│         • project filter                                                   │
│                                                                             │
│  POST   /documents/                  DocumentCreateWithFilesSerializer     │
│         Content-Type: multipart      • existing_files: [ids]              │
│         Returns: {data: {...}}       • new_files: [files]                 │
│                                      • file_descriptions: {id: desc}       │
│                                                                             │
│  GET    /documents/:id/              DocumentDetailSerializer              │
│         Returns: {data: {...}}       • files → DocumentFileLink[]          │
│                                      • signatories → Signatory[]           │
│                                      • workflow_history → History[]        │
│                                      • All strings from StringRelatedField │
│                                                                             │
│  GET    /documents/create_options/                                         │
│         Returns: {data: {            • executors: []                       │
│           executors: [],             • projects: []                        │
│           projects: [],              • legal_entities: []                  │
│           legal_entities: [],        • document_types: []                  │
│           document_types: [],        • workflow_states: []                 │
│           workflow_states: []                                              │
│         }}                                                                  │
│                                                                             │
│  POST   /documents/:id/change_state/                                       │
│         Body: {state_id, comment}                                          │
│                                                                             │
│  POST   /documents/:id/add_files/                                          │
│         Body: {file_ids: [...]}                                            │
│                                                                             │
│  GET    /file/                       DocumentFileListSerializer            │
│         Returns: {data: [...]}                                             │
│                                                                             │
│  POST   /file/                       File upload                           │
│         Content-Type: multipart                                            │
│         Returns: {data: {...}}                                             │
│                                                                             │
│  GET    /document-types/             DocumentTypeListSerializer            │
│  GET    /workflow-states/            WorkflowStateSerializer               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW EXAMPLE                                 │
│                    (Document Creation Workflow)                             │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER OPENS DIALOG
   └─> DocumentFlowMain: showCreateDialog = true
       └─> DocumentCreateDialog mounts
           ├─> fetchFileList() → GET /file/
           │   └─> extractArray(res.data.data) → files[]
           └─> fetchCreateOptions() → GET /documents/create_options/
               └─> Set: executors[], projects[], document_types[], etc.

2. USER UPLOADS FILES
   └─> v-file-input @change
       └─> uploadedFiles = [...files] (replace, not push)
           └─> Image preview: URL.createObjectURL(file)
               └─> Track in filePreviewUrls[] for cleanup

3. USER FILLS FORM
   ├─> Required: title, direction, executor
   └─> Optional: (collapsed) type, description, project, etc.

4. USER ADDS FILES TO DOCUMENT
   └─> Click file in pool
       └─> currentDocument.files.push({file, type, description})

5. USER ADDS DOCUMENT TO QUEUE
   └─> "Добавить документ" button
       └─> documentQueue.push(currentDocument)
           └─> Reset form

6. USER CREATES ALL DOCUMENTS
   └─> "Создать все документы" button
       └─> For each document in queue:
           ├─> Upload new files first
           │   └─> POST /file/ with FormData
           │       └─> Get file IDs
           ├─> Create document
           │   └─> POST /documents/ with:
           │       ├─> Document data (title, direction, etc.)
           │       └─> existing_files: [ids]
           └─> Update progress bar

7. SUCCESS
   ├─> Close dialog
   ├─> Emit 'created' event
   ├─> Cleanup object URLs (beforeDestroy)
   └─> DocumentFlowMain refreshes list
       └─> fetchDocuments() → Updated list

┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEY DESIGN DECISIONS                               │
└─────────────────────────────────────────────────────────────────────────────┘

✅ StringRelatedField Handling
   Backend uses StringRelatedField → returns strings, not objects
   Frontend maps strings to colors dynamically (no backend changes needed)

✅ Array Validation Everywhere
   All data passed to Vuetify validated with Array.isArray()
   Prevents "Expected Array, got Object" errors

✅ extractArray() Utility
   Handles all API response formats:
   - Direct arrays: [...]
   - Paginated: {results: [...]}
   - Empty: null/undefined → []

✅ Fullscreen Dialog (not separate page)
   Better UX for batch operations
   No navigation needed
   File pool visible while editing

✅ Memory Management
   Object URLs tracked and revoked
   beforeDestroy cleanup hook
   No memory leaks

✅ Error Handling
   Consistent snackbar notifications
   No native alert() dialogs
   Proper try-catch in all actions
```
