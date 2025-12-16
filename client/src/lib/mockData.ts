export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  image: string;
  record: string;
  weightClass: string;
  nationality: string;
}

export interface Market {
  id: string;
  event: string;
  date: string;
  fighterA: Fighter;
  fighterB: Fighter;
  poolTotalVTHO: number;
  oddsA: number; // Decimal odds
  oddsB: number; // Decimal odds
  volume24h: number;
  isLive: boolean;
}

import fighterRed from '@assets/generated_images/mma_fighter_red_corner.png';
import fighterBlue from '@assets/generated_images/mma_fighter_blue_corner.png';

export const mockMarkets: Market[] = [
  {
    id: "m1",
    event: "UFC 300",
    date: "2025-04-13T22:00:00Z",
    fighterA: {
      id: "f1",
      name: "Alex Pereira",
      nickname: "Poatan",
      image: fighterRed,
      record: "9-2-0",
      weightClass: "Light Heavyweight",
      nationality: "BRA"
    },
    fighterB: {
      id: "f2",
      name: "Jamahal Hill",
      nickname: "Sweet Dreams",
      image: fighterBlue,
      record: "12-1-0",
      weightClass: "Light Heavyweight",
      nationality: "USA"
    },
    poolTotalVTHO: 4500000,
    oddsA: 1.75,
    oddsB: 2.15,
    volume24h: 125000,
    isLive: false
  },
  {
    id: "m2",
    event: "UFC 300",
    date: "2025-04-13T21:30:00Z",
    fighterA: {
      id: "f3",
      name: "Zhang Weili",
      nickname: "Magnum",
      image: fighterBlue, // Reusing for mock
      record: "24-3-0",
      weightClass: "Strawweight",
      nationality: "CHN"
    },
    fighterB: {
      id: "f4",
      name: "Yan Xiaonan",
      nickname: "Fury",
      image: fighterRed, // Reusing for mock
      record: "17-3-0",
      weightClass: "Strawweight",
      nationality: "CHN"
    },
    poolTotalVTHO: 2800000,
    oddsA: 1.45,
    oddsB: 2.85,
    volume24h: 89000,
    isLive: false
  },
  {
    id: "m3",
    event: "UFC Fight Night",
    date: "2025-03-25T19:00:00Z",
    fighterA: {
      id: "f5",
      name: "Max Holloway",
      nickname: "Blessed",
      image: fighterRed,
      record: "25-7-0",
      weightClass: "Featherweight",
      nationality: "USA"
    },
    fighterB: {
      id: "f6",
      name: "Justin Gaethje",
      nickname: "The Highlight",
      image: fighterBlue,
      record: "25-4-0",
      weightClass: "Lightweight",
      nationality: "USA"
    },
    poolTotalVTHO: 6200000,
    oddsA: 2.40,
    oddsB: 1.58,
    volume24h: 340000,
    isLive: true
  }
];

export const userBalance = {
  vet: 15000,
  vtho: 45280.50
};
