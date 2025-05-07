import { CarStockDetailLayout } from "@/components/app/stock/detail/CarStockDetailLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function CarStockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void trpc.carStock.getById.prefetch({ id });
  return (
    <HydrateClient>
      <CarStockDetailLayout id={id} />
    </HydrateClient>
  );
}
