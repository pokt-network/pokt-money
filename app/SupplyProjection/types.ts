export interface SupplyByDayItem {
  day: string
  total_supply: number
}

export interface ShannonSupplyByDay {
  getTotalSupplyByDay: Array<SupplyByDayItem>
}
