"use client";

import { useState } from "react";
import { IndustryTable } from "./industry-table";
import { NicheTable } from "./niche-table";
import { SimpleCatalogTable } from "./simple-catalog-table";

interface Industry {
  id: string;
  name: string;
  description: string | null;
  nicheCount: number;
}

interface Niche {
  id: string;
  name: string;
  description: string | null;
  industryId: string;
  industryName: string;
}

interface SimpleItem {
  id: string;
  name: string;
  description: string | null;
}

interface CatalogTabsProps {
  industries: Industry[];
  niches: Niche[];
  products: SimpleItem[];
  services: SimpleItem[];
}

const tabs = ["Industries", "Niches", "Products", "Services"] as const;

export function CatalogTabs({ industries, niches, products, services }: CatalogTabsProps) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Industries");

  const industryOptions = industries.map((i) => ({ value: i.id, label: i.name }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer -mb-px ${
              active === tab
                ? "text-text-primary border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Industries" && (
        <IndustryTable industries={industries} niches={niches} />
      )}
      {active === "Niches" && (
        <NicheTable niches={niches} industries={industryOptions} />
      )}
      {active === "Products" && (
        <SimpleCatalogTable type="product" items={products} />
      )}
      {active === "Services" && (
        <SimpleCatalogTable type="service" items={services} />
      )}
    </div>
  );
}
