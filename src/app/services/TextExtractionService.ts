/**
 * Service to handle text extracted from screen captures
 */

interface ExtractedText {
  entireScreen: string;
  regionText: string;
  mousePosition: { x: number; y: number };
  timestamp: string;
}

interface SearchResult {
  relevance: number;
  snippet: string;
  source: string;
}

// Custom event for text extraction
export const TEXT_EXTRACTION_EVENT = "text-extraction-event";

class TextExtractionService {
  private static instance: TextExtractionService;
  private history: ExtractedText[] = [];

  private constructor() {
    // Load history from localStorage on initialization
    this.loadFromStorage();

    // Listen for storage events from other tabs
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange);

      // Listen for custom extraction events
      window.addEventListener(TEXT_EXTRACTION_EVENT, (e: Event) => {
        const customEvent = e as CustomEvent<ExtractedText>;
        if (customEvent.detail) {
          this.addExtraction(customEvent.detail, false);
          this.saveToStorage();
        }
      });

      // Listen for service worker messages
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (
            event.data &&
            event.data.type === "NEW_EXTRACTION" &&
            event.data.extraction
          ) {
            this.addExtraction(event.data.extraction, false);
          }
        });
      }
    }
  }

  public static getInstance(): TextExtractionService {
    if (!TextExtractionService.instance) {
      TextExtractionService.instance = new TextExtractionService();
    }
    return TextExtractionService.instance;
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === "text-extractions") {
      this.loadFromStorage();

      // Dispatch event to notify components that extraction data has changed
      this.dispatchExtractionUpdate();
    }
  };

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("text-extractions");
      if (storedData) {
        try {
          this.history = JSON.parse(storedData);
        } catch (error) {
          console.error("Failed to parse stored extractions:", error);
          this.history = [];
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("text-extractions", JSON.stringify(this.history));
    }
  }

  /**
   * Add a new text extraction to history
   */
  public addExtraction(extraction: ExtractedText, broadcastEvent = true): void {
    this.history.push(extraction);
    // Limit history size to prevent memory issues
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }

    // Save to local storage for cross-tab persistence
    this.saveToStorage();

    // Process the extraction
    this.processExtraction(extraction);

    // Broadcast event to notify components
    this.dispatchExtractionUpdate();

    // Broadcast global extraction event for system-wide operation
    if (broadcastEvent && typeof window !== "undefined") {
      // Create a custom event that other tabs can listen for
      const extractionEvent = new CustomEvent(TEXT_EXTRACTION_EVENT, {
        detail: extraction,
      });

      window.dispatchEvent(extractionEvent);

      // Also notify the service worker to broadcast to other tabs
      this.notifyServiceWorker(extraction);
    }
  }

  /**
   * Notify the service worker about a new extraction
   */
  private notifyServiceWorker(extraction: ExtractedText): void {
    if (
      typeof navigator !== "undefined" &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller
    ) {
      try {
        // Send the extraction to the service worker
        navigator.serviceWorker.controller.postMessage({
          type: "BROADCAST_EXTRACTION",
          extraction: extraction,
        });
      } catch (error) {
        console.error("Failed to send extraction to service worker:", error);
      }
    }
  }

  private dispatchExtractionUpdate() {
    if (typeof window !== "undefined") {
      // Dispatch a custom event that components can listen for
      window.dispatchEvent(
        new CustomEvent("extraction-updated", {
          detail: {
            extractions: this.getHistory(),
            latestExtraction: this.history[this.history.length - 1],
          },
        })
      );
    }
  }

  /**
   * Process the extracted text
   */
  private processExtraction(extraction: ExtractedText): void {
    const { entireScreen, regionText } = extraction;

    // Log the extraction information
    console.log("Processing text extraction:");
    console.log("Query (region):", regionText);
    console.log(
      "Context (entire screen):",
      entireScreen.substring(0, 200) + "..."
    );

    // Here we would implement any further processing like:
    // - Natural language processing
    // - Searching through context using the query
    // - Sending to an API for further processing

    // For now, we'll just do a simple contextual search
    const searchResults = this.searchInContext(regionText, entireScreen);
    console.log("Search results:", searchResults);
  }

  /**
   * Simple search function to find query terms in context
   */
  private searchInContext(query: string, context: string): SearchResult[] {
    // Basic implementation - split query into words and search for each in context
    const results: SearchResult[] = [];
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Skip if no substantial query words
    if (queryWords.length === 0) return results;

    // Split context into paragraphs or sentences
    const contextParts = context
      .split(/\n+|\.\s+/)
      .filter((part) => part.length > 10);

    for (const part of contextParts) {
      const lowerPart = part.toLowerCase();
      let relevance = 0;

      // Calculate relevance based on number of query words found
      for (const word of queryWords) {
        if (lowerPart.includes(word)) {
          relevance += 1;
        }
      }

      if (relevance > 0) {
        results.push({
          relevance,
          snippet: part.length > 150 ? part.substring(0, 150) + "..." : part,
          source: "screen-capture",
        });
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  /**
   * Get all recorded extractions
   */
  public getHistory(): ExtractedText[] {
    return [...this.history];
  }

  /**
   * Get the most recent extraction
   */
  public getLatestExtraction(): ExtractedText | null {
    return this.history.length > 0
      ? this.history[this.history.length - 1]
      : null;
  }

  /**
   * Clear extraction history
   */
  public clearHistory(): void {
    this.history = [];
    this.saveToStorage();
    this.dispatchExtractionUpdate();
  }
}

export default TextExtractionService;
