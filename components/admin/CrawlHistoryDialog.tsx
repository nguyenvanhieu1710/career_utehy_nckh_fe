"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrawlHistoryTable } from "./CrawlHistoryTable";
import { CrawlDetailDialog } from "./CrawlDetailDialog";
import { CrawlHistory } from "@/types/crawl-history";
import { History } from "lucide-react";

interface CrawlHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId?: string;
  sourceName?: string;
}

export function CrawlHistoryDialog({
  open,
  onOpenChange,
  sourceId,
  sourceName,
}: CrawlHistoryDialogProps) {
  const [selectedCrawl, setSelectedCrawl] = useState<CrawlHistory | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetails = (crawl: CrawlHistory) => {
    setSelectedCrawl(crawl);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl bg-white border-2 border-green-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Lịch sử Crawl: {sourceName || "Tất cả nguồn"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <CrawlHistoryTable 
              sourceId={sourceId} 
              onViewDetails={handleViewDetails}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Detail Dialog */}
      <CrawlDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        crawlHistory={selectedCrawl}
      />
    </>
  );
}
