import { Snowflake, WashingMachine, Wind, Flame, IceCream, AirVent } from "lucide-react"

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
    types: ["French Door", "Side by Side", "Top Freezer", "Bottom Freezer", "Mini/Compact", "Portable", "Counter-Depth"],
    featureFilters: ["energy_star", "ice_maker", "water_dispenser", "smart_features", "fingerprint_resistant"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "total_capacity_cuft", label: "Total (cuft)" },
      { key: "fridge_capacity_cuft", label: "Fridge (cuft)" },
      { key: "freezer_capacity_cuft", label: "Freezer (cuft)" },
      { key: "height_inches", label: "H (in)" },
      { key: "depth_inches", label: "D (in)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "ice_maker", label: "Ice", type: "boolean" },
      { key: "water_dispenser", label: "Water", type: "boolean" },
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
      { key: "capacity_cuft", label: "Capacity (cuft)" },
      { key: "max_spin_speed_rpm", label: "Spin (RPM)" },
      { key: "height_inches", label: "H (in)" },
      { key: "depth_inches", label: "D (in)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "steam_clean", label: "Steam", type: "boolean" },
      { key: "smart_features", label: "Smart", type: "boolean" },
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
      { key: "capacity_cuft", label: "Capacity (cuft)" },
      { key: "voltage", label: "Volts" },
      { key: "height_inches", label: "H (in)" },
      { key: "depth_inches", label: "D (in)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "steam_refresh", label: "Steam", type: "boolean" },
      { key: "sensor_dry", label: "Sensor", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Air Fryers": {
    icon: Flame,
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
      { key: "capacity_quarts", label: "Capacity (qt)" },
      { key: "wattage", label: "Watts" },
      { key: "temperature_range_max", label: "Max Temp" },
      { key: "digital_display", label: "Digital", type: "boolean" },
      { key: "dishwasher_safe", label: "Dishwasher", type: "boolean" },
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
      { key: "ice_type", label: "Ice Type" },
      { key: "daily_production_lbs", label: "Prod (lbs/day)" },
      { key: "storage_capacity_lbs", label: "Storage (lbs)" },
      { key: "ice_ready_minutes", label: "Ready (min)" },
      { key: "self_cleaning", label: "Self-Clean", type: "boolean" },
      { key: "water_line_required", label: "Water Line", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  },
  "Window AC": {
    icon: AirVent,
    slug: "window-ac",
    entity: "WindowAC",
    title: "Window Air Conditioners",
    description: "Compare window AC prices and BTU ratings",
    capacityField: "btu",
    capacityUnit: "BTU",
    types: ["Standard", "U-Shaped", "Saddle", "Casement", "Slider"],
    featureFilters: ["energy_star", "smart_features", "heater_included", "remote_control"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "btu", label: "BTU" },
      { key: "cooling_sqft", label: "Sq Ft" },
      { key: "ceer", label: "CEER" },
      { key: "noise_level_db", label: "Noise (dB)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "smart_features", label: "Smart", type: "boolean" },
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
    types: ["Chest", "Upright", "Drawer", "Compact", "Commercial"],
    featureFilters: ["energy_star", "garage_ready", "door_lock", "interior_light"],
    tableColumns: [
      { key: "image", label: "Image\n(hover)" },
      { key: "price", label: "Price" },
      { key: "brand", label: "Brand" },
      { key: "model", label: "Model" },
      { key: "type", label: "Type" },
      { key: "capacity_cuft", label: "Capacity (cuft)" },
      { key: "defrost_type", label: "Defrost" },
      { key: "height_inches", label: "H (in)" },
      { key: "depth_inches", label: "D (in)" },
      { key: "energy_star", label: "E-Star", type: "boolean" },
      { key: "garage_ready", label: "Garage", type: "boolean" },
      { key: "rating", label: "Rating" },
      { key: "link", label: "Retailer Link" }
    ]
  }
}

export const getCategoryBySlug = (slug: string): string | undefined => {
  return Object.entries(categoryConfig).find(([_, config]) => config.slug === slug)?.[0]
}

export const allCategories = Object.keys(categoryConfig)