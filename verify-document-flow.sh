#!/bin/bash
# Document Flow Implementation Verification Script
# Run this after starting the dev server to test the implementation

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║           DOCUMENT FLOW IMPLEMENTATION VERIFICATION                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if all component files exist
echo "📁 Checking Component Files..."
echo "================================"

components=(
    "src/components/DocumentFlow/DocumentFlowMain.vue"
    "src/components/DocumentFlow/DocumentList.vue"
    "src/components/DocumentFlow/DocumentDetail.vue"
    "src/components/DocumentFlow/DocumentForm.vue"
    "src/components/DocumentFlow/DocumentFormPage.vue"
    "src/components/DocumentFlow/DocumentStateChangeDialog.vue"
    "src/components/DocumentFlow/DocumentPdfViewer.vue"
    "src/components/DocumentFlow/CorrespondenceList.vue"
    "src/components/DocumentFlow/CorrespondenceDetail.vue"
    "src/components/DocumentFlow/CorrespondenceForm.vue"
    "src/components/DocumentFlow/CorrespondenceFormPage.vue"
    "src/components/DocumentFlow/DocumentFlowSettings.vue"
)

all_exist=true
for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo "✓ $component"
    else
        echo "✗ $component - MISSING!"
        all_exist=false
    fi
done

echo ""
echo "📦 Checking Store Module..."
echo "============================="
if [ -f "src/store/modules/crm/documentFlow.js" ]; then
    echo "✓ src/store/modules/crm/documentFlow.js"
else
    echo "✗ src/store/modules/crm/documentFlow.js - MISSING!"
    all_exist=false
fi

echo ""
echo "🛣️  Checking Router Configuration..."
echo "====================================="
if grep -q "doc-flow-documents" src/router/index.js; then
    echo "✓ Document flow routes configured"
else
    echo "✗ Document flow routes NOT configured!"
    all_exist=false
fi

echo ""
echo "🧭 Checking Dashboard Navigation..."
echo "===================================="
if grep -q "Документооборот" src/components/Dashboard.vue; then
    echo "✓ Dashboard navigation menu updated"
else
    echo "✗ Dashboard navigation NOT updated!"
    all_exist=false
fi

echo ""
echo "📄 Checking Documentation..."
echo "============================="
if [ -f "DOCUMENT_FLOW_IMPLEMENTATION.md" ]; then
    echo "✓ DOCUMENT_FLOW_IMPLEMENTATION.md"
else
    echo "✗ Documentation file missing!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$all_exist" = true ]; then
    echo "✅ All files present and configured correctly!"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Start the development server: npm run serve"
    echo "   2. Navigate to: http://localhost:8080/dashboard/document-flow"
    echo "   3. Test document creation, viewing, and management"
    echo "   4. Test correspondence management"
    echo "   5. Verify API integration with backend"
    echo ""
    echo "📋 Routes Available:"
    echo "   - /dashboard/document-flow/documents         (Document list)"
    echo "   - /dashboard/document-flow/documents/create  (Create document)"
    echo "   - /dashboard/document-flow/correspondence    (Correspondence list)"
    echo "   - /dashboard/document-flow/settings          (Settings)"
else
    echo "❌ Some files are missing! Please check the implementation."
fi

echo ""
echo "For detailed information, see: DOCUMENT_FLOW_IMPLEMENTATION.md"
