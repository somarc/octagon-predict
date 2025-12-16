import { db } from "../db/index";
import { fighters, markets } from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create fighters
    const fighterData = [
      {
        id: "f1",
        name: "Alex Pereira",
        nickname: "Poatan",
        image: "/assets/generated_images/mma_fighter_red_corner.png",
        record: "9-2-0",
        weightClass: "Light Heavyweight",
        nationality: "BRA"
      },
      {
        id: "f2",
        name: "Jamahal Hill",
        nickname: "Sweet Dreams",
        image: "/assets/generated_images/mma_fighter_blue_corner.png",
        record: "12-1-0",
        weightClass: "Light Heavyweight",
        nationality: "USA"
      },
      {
        id: "f3",
        name: "Zhang Weili",
        nickname: "Magnum",
        image: "/assets/generated_images/mma_fighter_blue_corner.png",
        record: "24-3-0",
        weightClass: "Strawweight",
        nationality: "CHN"
      },
      {
        id: "f4",
        name: "Yan Xiaonan",
        nickname: "Fury",
        image: "/assets/generated_images/mma_fighter_red_corner.png",
        record: "17-3-0",
        weightClass: "Strawweight",
        nationality: "CHN"
      },
      {
        id: "f5",
        name: "Max Holloway",
        nickname: "Blessed",
        image: "/assets/generated_images/mma_fighter_red_corner.png",
        record: "25-7-0",
        weightClass: "Featherweight",
        nationality: "USA"
      },
      {
        id: "f6",
        name: "Justin Gaethje",
        nickname: "The Highlight",
        image: "/assets/generated_images/mma_fighter_blue_corner.png",
        record: "25-4-0",
        weightClass: "Lightweight",
        nationality: "USA"
      }
    ];

    console.log("Inserting fighters...");
    for (const fighter of fighterData) {
      await db.insert(fighters).values(fighter).onConflictDoNothing();
    }
    console.log("✅ Fighters inserted");

    // Create markets
    const marketData = [
      {
        id: "m1",
        event: "UFC 300",
        date: new Date("2025-04-13T22:00:00Z"),
        fighterAId: "f1",
        fighterBId: "f2",
        poolTotalVTHO: "4500000",
        oddsA: "1.75",
        oddsB: "2.15",
        volume24h: "125000",
        isLive: false,
        status: "upcoming"
      },
      {
        id: "m2",
        event: "UFC 300",
        date: new Date("2025-04-13T21:30:00Z"),
        fighterAId: "f3",
        fighterBId: "f4",
        poolTotalVTHO: "2800000",
        oddsA: "1.45",
        oddsB: "2.85",
        volume24h: "89000",
        isLive: false,
        status: "upcoming"
      },
      {
        id: "m3",
        event: "UFC Fight Night",
        date: new Date("2025-03-25T19:00:00Z"),
        fighterAId: "f5",
        fighterBId: "f6",
        poolTotalVTHO: "6200000",
        oddsA: "2.40",
        oddsB: "1.58",
        volume24h: "340000",
        isLive: true,
        status: "live"
      }
    ];

    console.log("Inserting markets...");
    for (const market of marketData) {
      await db.insert(markets).values(market).onConflictDoNothing();
    }
    console.log("✅ Markets inserted");

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
