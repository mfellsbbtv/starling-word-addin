// Legal Matrix Loader - Load and initialize Legal Matrix TSV data for Word add-in
import { legalMatrixService } from './legal-matrix-service.js';
import { legalMatrixAnalyzer } from './legal-matrix-analyzer.js';

export class LegalMatrixLoader {
  constructor() {
    this.isLoaded = false;
    this.loadingPromise = null;
    this.matrixData = null;
    this.supportedParties = [];
  }

  /**
   * Load Legal Matrix TSV file into the system
   * This should be called once when the Word add-in starts
   */
  async loadLegalMatrix() {
    if (this.isLoaded) {
      return this.matrixData;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._performLoad();
    return this.loadingPromise;
  }

  /**
   * Perform the actual loading of Legal Matrix data
   */
  async _performLoad() {
    console.log("🔄 Loading Legal Matrix TSV data...");
    
    try {
      // Load TSV file content
      const tsvContent = await this.loadTSVFile();
      
      // Parse and load into Legal Matrix Service
      const loadResult = await legalMatrixService.loadLegalMatrix(tsvContent);
      
      // Initialize the analyzer
      await legalMatrixAnalyzer.initialize(legalMatrixService);
      
      // Extract metadata
      this.matrixData = {
        clausesLoaded: loadResult.clausesLoaded,
        partiesFound: loadResult.partiesFound,
        articlesFound: loadResult.articlesFound,
        loadedAt: new Date().toISOString()
      };
      
      this.supportedParties = loadResult.partiesFound;
      this.isLoaded = true;
      
      console.log("✅ Legal Matrix loaded successfully:", this.matrixData);
      
      return this.matrixData;
      
    } catch (error) {
      console.error("❌ Failed to load Legal Matrix:", error);
      this.loadingPromise = null;
      throw new Error(`Legal Matrix loading failed: ${error.message}`);
    }
  }

  /**
   * Load TSV file content (handles different environments)
   */
  async loadTSVFile() {
    // Try different methods to load the TSV file
    
    // Method 1: Direct file loading (if in Node.js environment)
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'Legal Matrix - Test.tsv');
        return fs.readFileSync(filePath, 'utf8');
      } catch (error) {
        console.log("Node.js file loading failed, trying fetch...");
      }
    }
    
    // Method 2: Fetch from relative URL (browser environment)
    try {
      const response = await fetch('./Legal Matrix - Test.tsv');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.log("Fetch loading failed, using embedded data...");
    }
    
    // Method 3: Use embedded sample data for development
    return this.getEmbeddedSampleData();
  }

  /**
   * Get embedded sample data for development/testing
   */
  getEmbeddedSampleData() {
    return `Article	Clause Number	Clause Title	Clause Summary BASELINE (Ninja Tune Ltd.)	Full Clause Text (Ninja Tune Ltd.)	Full Clause Text (MNRK Music Group LP)	WMX comparison to BASELINE	Sony comparison to BASELINE	Create Music Group comparison to BASELINE	Lionsgate comparison to BASELINE	MNRK comparison to BASELINE
ARTICLE 2	2.1	Channel Management Services	RHEI will provide Channel Management Services as detailed in Schedule "B" for Provider Channels listed in Schedule "A" or as mutually agreed.	RHEI shall provide Provider with the "Channel Management Services" as set out in Schedule "B" attached hereto (the "Channel Management Services") in connection with the Provider Channels set out in Schedule "A" attached hereto or any other Provider Channels mutually agreed upon by the parties in writing (email to suffice) (collectively, the "Managed Channels").	RHEI shall provide Provider with the "Channel Management Services" as set out in Schedule "B" attached hereto (the "Channel Management Services") in connection with the Provider Channels set out in Schedule "A" attached hereto or any other Provider Channels mutually agreed upon by the parties in writing (email to suffice) (collectively, the "Managed Channels").	WMX contract adds "solely" and explicitly states that all services, including video uploads, are subject to Provider approval as per Schedules A and B.	Found in Article 3.3; BBTV provides full management services for 'Managed Channels'.	✓	Matched in Article 2.1 of Lionsgate–BBTV DVSA under 'Channel Management Services' as described in Schedule B.	✓
ARTICLE 2	2.2	Content Development Services	RHEI will provide Content Development Services as detailed in Schedule "C".	RHEI shall provide Provider with the "Content Development Services" as set out in Schedule "C" attached hereto (the "Content Development Services").	RHEI shall provide Provider with the "Content Development Services" as set out in Schedule "C" attached hereto (the "Content Development Services").	The WMX contract has a completely different clause for 2.2, focusing on access and security of Managed Channels, while Ninja Tune and MNRK have Content Development Services here.	Not present. No standalone content development clause equivalent to Schedule C in newer agreements.	CBMG refers to Schedule "D" instead of Schedule "C" for Content Development Services.	Matched in Article 2.2 and Schedule C of Lionsgate–BBTV DVSA.	✓
ARTICLE 3	3.1	Provider Obligations	Provider must provide RHEI with administrative access and metadata for Provider Channels, and include RHEI Owned and Operated Channels on its Content Owner System Allowlist, as reasonably requested by RHEI.	Without limiting any other obligations of Provider set out in this Agreement, for the purposes of this Agreement, solely to the extent necessary for RHEI to provide the Services, Provider will take reasonable actions as may be necessary or desirable in order to: (a) Channel Management Services: (i) provide RHEI with administrative access to the Provider Channels; and (ii) provide RHEI with metadata for the Provider Channels and the Titles appearing thereon, as RHEI may reasonably request from time to time. (b) Provider's Content Owner System: (i) Include RHEI Owned and Operated Channels on Provider's Content Owner System permissions list (the "Allowlist") as RHEI may reasonably request from time to time.	Without limiting any other obligations of Provider set out in this Agreement, for the purposes of this Agreement, solely to the extent necessary for RHEI to provide the Services, Provider will take reasonable actions as may be necessary or desirable in order to: (a) Channel Management Services: (i) provide RHEI with administrative access to the Managed Channels; and (ii) provide RHEI with metadata for the Managed Channels and the Titles appearing thereon, as RHEI may reasonably request from time to time. (b) Provider's Content Owner System: (i) Include RHEI Owned and Operated Channels on Provider's Content Owner System permissions list (the "Allowlist") as RHEI may reasonably request from time to time	WMX has a specific "CMS System" clause, detailing limited administrative access for BBTV, while Ninja Tune/MNRK have a broader "Provider Obligations" clause that includes providing administrative access and metadata. The "Provider's Content Owner System" part of 3.1 in Ninja Tune/MNRK is not explicitly in WMX's 3.1, but aspects of it might be covered by general "Provider Obligations" in WMX's 3.2.	See Article 5.1; outlines metadata provision, CMS co-management, and hosting services.	CBMG's 3.1 is a "CO System" clause, specifically about incorporating Managed Channels into RHEI's content owner system ("CO"), which is different from Ninja Tune's broader "Provider Obligations" that includes administrative access and metadata, and an "Allowlist" for RHEI Owned and Operated Channels.	Covered in Article 3.2 of BBTV DVSA.	In 3.1(a)(i), "Provider Channels" is changed to "Managed Channels" in the MNRK contract.
ARTICLE 5	5.1	Revenue Shares	Details the revenue share arrangement: Provider pays RHEI 50% of the first $5,000 Net Revenue from Managed Channels and 30% of Net Revenue exceeding $5,000; RHEI pays Provider 30% of Net Revenue from Provider Content on RHEI Owned and Operated Channels.	For any given month during the Term: (a) Provider shall pay RHEI an amount equal to: (i) fifty percent (50%) of the first $5,000.00 in Net Revenue from the Managed Channels from such month; and (ii) thirty percent (30%) of the Net Revenue from the Managed Channels in excess of $5,000.00 from such month (RHEI's share of revenue set out in subsections (i) and (ii) above collectively referred to as "RHEI Net Revenue"). (b) RHEI shall pay Provider an amount equal to thirty percent (30%) of Net Revenue from Provider Content on RHEI Owned and Operated Channels ("Provider Net Revenue"). With the exception of the amounts payable to the other Party as described above, each Party shall be entitled to retain all other amounts of Net Revenue received by such Party under this Agreement.	For any given month during the Term: (a) Provider shall pay RHEI an amount equal to thirty percent (30%) of Net Revenue from such month from the Managed Channels ("RHEI Net Revenue") and (b) RHEI shall pay Provider an amount equal to seventy percent (70%) of Net Revenue from Provider Content on RHEI Owned and Operated Channels ("Provider Net Revenue") With the exception of the amounts payable to the other Party as described above, each Party shall be entitled to retain all other amounts of Net Revenue received by such Party under this Agreement.	WMX has a flat percentage for Managed Channels and a separate percentage for Content Development Services on Provider Videos (excluding Managed Channels), and it explicitly mentions "plus sales tax if applicable".	Revenue share is 80/20 in favour of Provider (Sony), vs. 70/30 in baseline. Found in Section 6.3.	CBMG's revenue share structure is entirely different. It specifies RHEI paying Provider, with tiered percentages based on whether channels received RHEI's Channel Management Services (70% vs 95%) and a separate 50% for Ads sold by RHEI.	Straight 70:30 Rev Share split	Significant difference in revenue share. The Ninja Tune contract has a tiered structure for Managed Channels (50% of first $5k, then 30%), while the MNRK contract has a flat 30% for Managed Channels. The RHEI Owned and Operated Channels share is 30% for Provider in Ninja Tune, and 70% for Provider in MNRK.`;
  }

  /**
   * Generate contract using Legal Matrix baseline clauses
   */
  async generateContract(formData = {}, options = {}) {
    await this.ensureLoaded();
    
    const contractOptions = {
      companyName: formData.company_name || 'RHEI, Inc.',
      providerName: formData.provider_name || 'Provider Name, Inc.',
      effectiveDate: formData.effective_date || new Date().toLocaleDateString(),
      ...options
    };
    
    return legalMatrixService.generateBaselineContract('content-management', contractOptions);
  }

  /**
   * Analyze contract against Legal Matrix
   */
  async analyzeContract(contractText, targetParty = null, options = {}) {
    await this.ensureLoaded();
    
    return legalMatrixAnalyzer.analyzeContract(contractText, targetParty, options);
  }

  /**
   * Get list of supported parties for analysis
   */
  getSupportedParties() {
    return this.supportedParties;
  }

  /**
   * Get Legal Matrix statistics
   */
  getStatistics() {
    if (!this.isLoaded) {
      return { loaded: false };
    }
    
    return {
      loaded: true,
      ...this.matrixData,
      baselineClauses: legalMatrixService.baselineClauses.size,
      partyVariations: legalMatrixService.partyVariations.size,
      supportedParties: this.supportedParties
    };
  }

  /**
   * Ensure Legal Matrix is loaded before operations
   */
  async ensureLoaded() {
    if (!this.isLoaded) {
      await this.loadLegalMatrix();
    }
  }

  /**
   * Reload Legal Matrix data (useful for updates)
   */
  async reload() {
    this.isLoaded = false;
    this.loadingPromise = null;
    this.matrixData = null;
    this.supportedParties = [];
    
    return this.loadLegalMatrix();
  }

  /**
   * Check if a specific party is supported
   */
  isPartySupportedForAnalysis(partyName) {
    return this.supportedParties.includes(partyName);
  }

  /**
   * Get party-specific recommendations for contract generation
   */
  async getPartyRecommendations(partyName) {
    await this.ensureLoaded();
    
    const partyVariations = legalMatrixService.partyVariations.get(partyName);
    if (!partyVariations) {
      return {
        supported: false,
        message: `No variations found for ${partyName}`
      };
    }
    
    const recommendations = [];
    partyVariations.forEach((variation, clauseKey) => {
      if (!variation.isUnchanged) {
        const baselineClause = legalMatrixService.baselineClauses.get(clauseKey);
        recommendations.push({
          clauseKey,
          title: baselineClause?.title || 'Unknown',
          baseline: baselineClause?.baseline || '',
          partyVariation: variation.modification,
          recommendation: `For ${partyName}, use: "${variation.modification}"`
        });
      }
    });
    
    return {
      supported: true,
      party: partyName,
      recommendations,
      totalVariations: recommendations.length
    };
  }
}

// Export singleton instance
export const legalMatrixLoader = new LegalMatrixLoader();
