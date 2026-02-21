import { Header } from "@/components/header";
import { CatalogTabs } from "@/components/catalog/catalog-tabs";
import { getIndustries, getNiches, getProducts, getServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [industries, niches, products, services] = await Promise.all([
    getIndustries(),
    getNiches(),
    getProducts(),
    getServices(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-8 px-10">
      <Header
        title="Catalog"
        subtitle="Manage industries, niches, products, and services"
      />
      <CatalogTabs
        industries={industries}
        niches={niches}
        products={products}
        services={services}
      />
    </div>
  );
}
