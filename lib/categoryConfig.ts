import { Snowflake, WashingMachine, Wind, Flame, IceCream, AirVent, UtensilsCrossed, Thermometer } from "lucide-react"

export type CategoryConfig = {
  icon: any
  slug: string
  entity: string
  title: string
  description: string
  capacityField: string
  capacityUnit: string
  types: string[]
  featureFilters: string[]
  tableColumns: Array<{
    key: string
    label: string
    type?: string
  }>
}

export const categoryConfig: Record<string, CategoryConfig> = {
  "Refrigerators": {
    icon: Snowflake,
    slug: "refrigerators",
    entity: "Refrigerator",
    title: "Refrigerators",
    description: "Compare refrigerator prices and find the best value per cubic foot",
    capacityField: "total_capacity_cuft",
    capacityUnit: "cu.ft.",
    types: ["French Door", "Side by Side", "Top Freezer", "Bottom Freezer", "Mini/Compact", "Portable", "Kegerator"],
    featureFilters: ["energy_star", "ice_maker", "water_dispenser", "smart_features", "fingerprint_resistant"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "capacity_cu_ft", label: "Capacity\n(cuft)" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "ice_maker", label: "Ice", type: "boolean" },
      { key: "water_dispenser", label: "Water", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Freezers": {
    icon: Snowflake,
    slug: "freezers",
    entity: "Freezer",
    title: "Freezers",
    description: "Compare freezer prices and find the best value per cubic foot",
    capacityField: "capacity_cuft",
    capacityUnit: "cu.ft.",
    types: ["Chest Freezer", "Upright Freezer"],
    featureFilters: ["energy_star", "garage_ready", "door_lock", "interior_light"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "capacity_cu_ft", label: "Capacity\n(cuft)" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Dishwashers": {
    icon: UtensilsCrossed,
    slug: "dishwashers",
    entity: "Dishwasher",
    title: "Dishwashers",
    description: "Compare dishwasher prices and features",
    capacityField: "place_settings",
    capacityUnit: "place settings",
    types: ["Built-In Dishwasher", "Countertop Dishwasher", "Portable Dishwasher"],
    featureFilters: ["energy_star", "third_rack", "steam_clean", "smart_features", "quiet_operation"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Ranges": {
    icon: Flame,
    slug: "ranges",
    entity: "Range",
    title: "Ranges",
    description: "Compare range prices and features",
    capacityField: "oven_capacity_cuft",
    capacityUnit: "cu.ft.",
    types: ["Drop-In Range", "Freestanding Range", "Slide-In Range"],
    featureFilters: ["convection", "self_cleaning", "air_fry", "double_oven", "induction"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Washers": {
    icon: WashingMachine,
    slug: "washers",
    entity: "Washer",
    title: "Washers",
    description: "Compare washing machine prices and capacity",
    capacityField: "capacity_cuft",
    capacityUnit: "cu.ft.",
    types: ["Top Load", "Front Load", "Portable", "Washer-Dryer Combo", "Compact"],
    featureFilters: ["energy_star", "steam_clean", "smart_features", "stackable", "agitator"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "capacity_cu_ft", label: "Capacity\n(cuft)" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Dryers": {
    icon: Wind,
    slug: "dryers",
    entity: "Dryer",
    title: "Dryers",
    description: "Compare dryer prices and capacity",
    capacityField: "capacity_cuft",
    capacityUnit: "cu.ft.",
    types: ["Electric", "Gas", "Ventless", "Heat Pump", "Portable", "Compact"],
    featureFilters: ["energy_star", "steam_refresh", "smart_features", "sensor_dry", "stackable"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "capacity_cu_ft", label: "Capacity\n(cuft)" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Air Fryers": {
    icon: Thermometer,
    slug: "air-fryers",
    entity: "AirFryer",
    title: "Air Fryers",
    description: "Compare air fryer prices and capacity",
    capacityField: "capacity_quarts",
    capacityUnit: "qt.",
    types: ["Basket", "Oven", "Toaster Oven Combo", "Dual Basket", "Lid/Pressure Cooker"],
    featureFilters: ["dishwasher_safe", "digital_display", "dehydrator_function", "rotisserie_function"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Ice Makers": {
    icon: IceCream,
    slug: "ice-makers",
    entity: "IceMaker",
    title: "Ice Makers",
    description: "Compare ice maker prices and production capacity",
    capacityField: "daily_production_lbs",
    capacityUnit: "lbs/day",
    types: ["Countertop", "Undercounter", "Portable", "Built-in", "Commercial"],
    featureFilters: ["self_cleaning", "water_line_required"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Air Conditioners": {
    icon: AirVent,
    slug: "air-conditioners",
    entity: "AirConditioner",
    title: "Air Conditioners",
    description: "Compare air conditioner prices and BTU ratings",
    capacityField: "btu",
    capacityUnit: "BTU",
    types: ["Window", "Portable", "Split-System", "Through-the-Wall"],
    featureFilters: ["energy_star", "smart_features", "heater_included", "remote_control"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "btu", label: "BTU" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Televisions": {
    icon: AirVent,
    slug: "televisions",
    entity: "Television",
    title: "Televisions",
    description: "Compare TV prices and screen sizes",
    capacityField: "screen_size",
    capacityUnit: "inches",
    types: ["LED & LCD TV", "OLED TV", "Portable TV", "QLED TV", "TV-DVD Combination"],
    featureFilters: ["smart_tv", "hdr", "4k", "8k", "curved"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "screen_size", label: "Size (in)" },
      { key: "height_in", label: "H (in)" },
      { key: "width_in", label: "W (in)" },
      { key: "depth_in", label: "D (in)" },
      { key: "weight_lbs", label: "Wt (lbs)" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  }
}

export const getCategoryBySlug = (slug: string): string | undefined => {
  return Object.entries(categoryConfig).find(([_, config]) => config.slug === slug)?.[0]
}

export const allCategories = Object.keys(categoryConfig)