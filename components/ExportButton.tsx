"use client";

import { useState } from "react";
import { Download, FileText, Table as TableIcon, ChevronDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Asset {
    id: string;
    name: string;
    category: string;
    departmentName?: string;
    status: string;
    condition: string;
    serialNumber?: string;
    purchasePrice: number;
    purchaseDate: string;
}

interface ExportButtonProps {
    assets: Asset[];
}

export default function ExportButton({ assets }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportCSV = () => {
        setIsExporting(true);
        try {
            const headers = ["ID", "Name", "Category", "Department", "Status", "Condition", "S/N", "Price", "Purchase Date"];
            const rows = assets.map(a => [
                a.id,
                `"${a.name}"`,
                a.category,
                a.departmentName || "N/A",
                a.status,
                a.condition,
                a.serialNumber || "N/A",
                a.purchasePrice,
                a.purchaseDate
            ]);

            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `asset-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("CSV Export failed:", error);
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    const exportPDF = () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();

            // ZOU Colors & Branding
            const primaryColor = [29, 78, 216]; // blue-700

            // Header
            doc.setFontSize(22);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text("Zimbabwe Open University", 14, 22);

            doc.setFontSize(16);
            doc.setTextColor(100);
            doc.text("Asset Inventory Report", 14, 32);

            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
            doc.text(`Total Assets: ${assets.length}`, 14, 45);

            // Line separator
            doc.setDrawColor(200);
            doc.line(14, 50, 196, 50);

            const tableColumn = ["ID", "Name", "Category", "Dept", "Status", "Condition", "Price"];
            const tableRows = assets.map(a => [
                a.id,
                a.name,
                a.category,
                a.departmentName || "N/A",
                a.status,
                a.condition,
                `$${a.purchasePrice.toFixed(2)}`
            ]);

            (doc as any).autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 55,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                styles: { fontSize: 8, cellPadding: 3 },
            });

            doc.save(`asset-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isExporting}
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-lg bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--border)] hover:bg-[var(--accent)] transition-all items-center border border-[var(--border)]"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export
                    <ChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right divide-y divide-[var(--border)] rounded-xl bg-[var(--background)] shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                        <button
                            onClick={exportCSV}
                            className="group flex items-center w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            <TableIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-white" />
                            Export as CSV
                        </button>
                        <button
                            onClick={exportPDF}
                            className="group flex items-center w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            <FileText className="mr-3 h-4 w-4 text-gray-400 group-hover:text-white" />
                            Export as PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
