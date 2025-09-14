export interface ServicePricing {
  basePrice: number;
  pricePerSqft: number;
  complexityMultipliers: {
    simple: number;    // 1-3 complexity
    medium: number;    // 4-6 complexity  
    complex: number;   // 7-10 complexity
  };
  additionalServices: {
    chipRepair: { min: number; max: number };
    colorChange: { min: number; max: number };
    surfacePrep: { min: number; max: number };
    rushJob: { multiplier: number };
  };
}

export class PricingReference {
  static readonly PRICING_GUIDE = `
# BATHROOM REFINISHING PRICING GUIDE

## Base Service Rates
- **Bathtub Refinishing**: $300-600 base
- **Shower Refinishing**: $400-800 base  
- **Full Bathroom**: $800-1500 base
- **Tile Refinishing**: $200-400 base
- **Sink Refinishing**: $150-300 base

## Complexity Assessment (1-10 Scale)

### Simple (1-3): Standard Refinishing
- Clean, minimal damage
- Standard white/almond colors
- Good existing finish
- **Multiplier**: 1.0x

### Medium (4-6): Enhanced Refinishing  
- Minor chips/scratches
- Color changes
- Some surface preparation
- **Multiplier**: 1.5x

### Complex (7-10): Full Restoration
- Extensive damage/chips
- Deep scratches/stains
- Structural repairs needed
- Custom colors/finishes
- **Multiplier**: 2.0x

## Additional Services & Fees

### Repair Work
- **Chip Repair**: +$50-150 per repair
- **Crack Repair**: +$75-200 per crack
- **Hole Repair**: +$100-300 per hole

### Surface Preparation
- **Light Prep**: +$75-150
- **Medium Prep**: +$150-250  
- **Heavy Prep**: +$250-400

### Color & Finish Options
- **Standard Colors**: No charge
- **Custom Colors**: +$100-200
- **Specialty Finishes**: +$150-400
- **Texture Work**: +$100-250

### Service Modifiers
- **Rush Job** (< 48h): 1.5x multiplier
- **Weekend Work**: 1.3x multiplier
- **Holiday Work**: 1.5x multiplier
- **Multiple Rooms**: 10% discount per additional room

## Material Considerations

### Surface Types
- **Fiberglass**: Standard rates
- **Cast Iron**: +$100-200 (harder to prep)
- **Steel**: Standard rates
- **Acrylic**: -$50-100 (easier finish)
- **Tile**: +$2-5 per square foot

### Age Factors  
- **New** (< 5 years): Standard rates
- **Medium** (5-15 years): Standard rates
- **Old** (15-25 years): +$100-200
- **Vintage** (> 25 years): +$200-400

## Quality Grades

### Standard Grade
- 2-year warranty
- Single coat process
- Base pricing

### Premium Grade  
- 5-year warranty
- Multi-coat process
- +$200-400 premium

### Commercial Grade
- 10-year warranty
- Heavy-duty finish
- +$400-800 premium

## Geographic Modifiers
- **Urban Areas**: 1.1-1.3x multiplier
- **Suburban**: Standard rates
- **Rural**: 0.9-1.1x multiplier
- **Travel** (>50 miles): +$100-200

---

**Last Updated**: Auto-updated by admin configuration
**Currency**: USD
**Tax**: Not included (varies by location)
`;

  static getServicePricing(serviceTypeId: string): ServicePricing {
    // Default pricing structure - can be customized per service type
    const basePricing: ServicePricing = {
      basePrice: 450,
      pricePerSqft: 8,
      complexityMultipliers: {
        simple: 1.0,
        medium: 1.5,
        complex: 2.0
      },
      additionalServices: {
        chipRepair: { min: 50, max: 150 },
        colorChange: { min: 100, max: 200 },
        surfacePrep: { min: 75, max: 400 },
        rushJob: { multiplier: 1.5 }
      }
    };

    // Customize pricing based on service type
    switch (serviceTypeId) {
      case 'bathtub':
        return { ...basePricing, basePrice: 450 };
      case 'shower':
        return { ...basePricing, basePrice: 600 };
      case 'full-bathroom':
        return { ...basePricing, basePrice: 1200 };
      case 'tile':
        return { ...basePricing, basePrice: 300, pricePerSqft: 12 };
      default:
        return basePricing;
    }
  }

  static calculatePrice(
    surfaceArea: number,
    complexity: number,
    serviceTypeId: string,
    additionalFactors: {
      chipRepairs?: number;
      needsColorChange?: boolean;
      heavyPrep?: boolean;
      rushJob?: boolean;
    } = {}
  ): number {
    const pricing = this.getServicePricing(serviceTypeId);
    
    // Base calculation
    let totalPrice = pricing.basePrice + (surfaceArea * pricing.pricePerSqft);
    
    // Apply complexity multiplier
    let multiplier = pricing.complexityMultipliers.simple;
    if (complexity <= 3) multiplier = pricing.complexityMultipliers.simple;
    else if (complexity <= 6) multiplier = pricing.complexityMultipliers.medium;
    else multiplier = pricing.complexityMultipliers.complex;
    
    totalPrice *= multiplier;
    
    // Add additional services
    if (additionalFactors.chipRepairs) {
      const repairCost = Math.min(
        additionalFactors.chipRepairs * pricing.additionalServices.chipRepair.max,
        pricing.additionalServices.chipRepair.min * 3 // Cap at 3x minimum
      );
      totalPrice += repairCost;
    }
    
    if (additionalFactors.needsColorChange) {
      totalPrice += pricing.additionalServices.colorChange.min;
    }
    
    if (additionalFactors.heavyPrep) {
      totalPrice += pricing.additionalServices.surfacePrep.max;
    }
    
    if (additionalFactors.rushJob) {
      totalPrice *= pricing.additionalServices.rushJob.multiplier;
    }
    
    // Round to nearest $25
    return Math.round(totalPrice / 25) * 25;
  }

  // Method for admin to update pricing guide
  static updatePricingGuide(newGuide: string): void {
    // In production, this would save to database
    // For now, just log the update
    console.log('Pricing guide updated by admin:', newGuide.length, 'characters');
  }
}

export default PricingReference;